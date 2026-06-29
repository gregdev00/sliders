import { DEFAULT_TASKS } from '$lib/constants/defaultTasks';
import type { Day } from '$lib/types/day';
import type { ISODateString } from '$lib/types/isoDateString';
import type { SyncStatus } from '$lib/types/syncStatus';
import type { Task } from '$lib/types/task';
import type { theme } from '$lib/types/theme';
import type { Week, WeekDay } from '$lib/types/week';
import { getTodayDateISO } from '$lib/utils/formatUtils';
import { getStorageItem, setStorageItem } from '$lib/utils/storageUtils';
import { authService } from './AuthService.svelte';
import { taskService } from './TaskService.svelte';
import { toastService } from './ToastService.svelte';

export interface AppSettings {
	stepSize: number;
	theme: theme;
	showTimeline: boolean;
	favourites: any[];
}

export interface AppDataState {
	tasks: Task[];
	dayStart: number;
	dayEnd: number;
}

/**
 * Service responsible for managing application data persistence,
 * state synchronization, and storage keys.
 *
 * Write strategy:
 *  - localStorage  → debounced at LOCAL_DEBOUNCE_MS  (fast, cheap)
 *  - Firebase      → debounced at CLOUD_DEBOUNCE_MS  (slower, only when authed)
 *  - Settings      → debounced at SETTINGS_DEBOUNCE_MS (separate timer, less frequent)
 *
 * This means rapid slider adjustments never flood storage or the network.
 */
class SyncService {
	// Storage keys
	readonly DAY_KEY_PREFIX = 'sliders_day_' as const;
	readonly STORAGE_KEY = 'sliders_data' as const;
	readonly SETTINGS_KEY = 'sliders_settings_v1' as const;
	readonly WEEK_KEY = 'sliders_week_v1' as const;
	readonly USAGE_KEY = 'sliders_task_usage' as const;

	// Debounce intervals
	readonly LOCAL_DEBOUNCE_MS = 300;
	readonly CLOUD_DEBOUNCE_MS = 2000;

	// Internal timers
	#localTimer: ReturnType<typeof setTimeout> | null = null;
	#cloudTimer: ReturnType<typeof setTimeout> | null = null;
	#settingsTimer: ReturnType<typeof setTimeout> | null = null;

	#isSwitching = false;

	// App state (single source of truth)
	// Lives here so the page never has to manage or pass settings around.
	appState = $state<AppSettings & AppDataState>({
		tasks: DEFAULT_TASKS,
		favourites: [],
		stepSize: 15,
		theme: 'system',
		showTimeline: true,
		dayStart: 8,
		dayEnd: 22
	});

	// Sync status
	#syncStatus = $state<SyncStatus>('synced');

	get syncStatus(): SyncStatus {
		return this.#syncStatus;
	}

	constructor() {
		this.#initState();
	}

	// Private helpers

	#debounce(
		timerRef: { value: ReturnType<typeof setTimeout> | null },
		delayMs: number,
		fn: () => void
	) {
		if (timerRef.value) clearTimeout(timerRef.value);
		timerRef.value = setTimeout(() => {
			fn();
			timerRef.value = null;
		}, delayMs);
	}

	/**
	 * Pushes snapshot to Firebase.
	 */
	async #pushToFirebase(date: ISODateString, tasks: Task[]): Promise<void> {
		if (!authService.user) return;

		try {
			this.#syncStatus = 'pending';
			// TODO: await db.collection('days').doc(date).set({ tasks });
			console.debug('[SyncService] Firebase push (stub):', date, tasks.length, 'tasks');
			this.#syncStatus = 'synced';
		} catch (error) {
			console.error('[SyncService] Firebase push failed:', error);
			toastService.showToast('Cloud sync failed – changes saved locally');
			this.#syncStatus = 'error';
		}
	}

	#writeSettings(): void {
		// Extract only the settings fields from appState – tasks are saved separately
		const { stepSize, theme, showTimeline, favourites } = this.appState;
		const settings: AppSettings = { stepSize, theme, showTimeline, favourites };

		this.#syncStatus = 'pending';
		try {
			setStorageItem<AppSettings>(this.SETTINGS_KEY, settings);
			this.#syncStatus = 'synced';
		} catch (error) {
			console.error('[SyncService] Failed to save settings:', error);
			toastService.showToast('Failed to save settings');
			this.#syncStatus = 'error';
		}
	}

	#initState(): void {
		const today = getTodayDateISO();

		const savedSettings = getStorageItem<Partial<AppSettings>>(this.SETTINGS_KEY);
		const savedData =
			this.loadDateState(today) ?? getStorageItem<Partial<AppDataState>>(this.STORAGE_KEY);

		this.appState = {
			tasks: savedData?.tasks ?? DEFAULT_TASKS,
			favourites: savedSettings?.favourites ?? [],
			stepSize: savedSettings?.stepSize ?? 15,
			theme: savedSettings?.theme ?? 'system',
			showTimeline: savedSettings?.showTimeline ?? true,
			dayStart: savedData?.dayStart ?? 8,
			dayEnd: savedData?.dayEnd ?? 22
		};

		taskService.init(this.appState.tasks);
	}

	//  Public API

	/**
	 * Persists a day's task list to localStorage immediately (no debounce).
	 * Called by startAutoSync – not typically needed directly.
	 */
	saveDayState(date: ISODateString, data: Partial<AppDataState>): void {
		const key = `${this.DAY_KEY_PREFIX}${date}`;
		this.#syncStatus = 'pending';
		try {
			setStorageItem(key, data);
			this.#syncStatus = 'synced';
		} catch (error) {
			console.error('[SyncService] Failed to save day state:', error);
			toastService.showToast('Failed to save – storage may be full');
			this.#syncStatus = 'error';
		}
	}

	/**
	 * Starts all reactive auto-sync loops. Call once from +page.svelte (top-level script,
	 * not inside $effect) so Svelte's reactive context is available.
	 *
	 * Registers two independent $effect pipelines:
	 *
	 *  1. Tasks pipeline  – watches taskService.tasks + activeDate
	 *     • localStorage write after LOCAL_DEBOUNCE_MS
	 *     • Firebase write  after CLOUD_DEBOUNCE_MS (only when authed)
	 *
	 *  2. Settings pipeline – watches the settings fields of appState
	 *     • localStorage write after SETTINGS_DEBOUNCE_MS
	 *     • These are deliberately separate so a theme change doesn't
	 *       reset the task-write debounce timer and vice versa.
	 *
	 * @param getDate  Reactive accessor for the currently active date.
	 */
	startAutoSync(getDate: () => ISODateString): void {
		const localRef = { value: this.#localTimer };
		const cloudRef = { value: this.#cloudTimer };
		const settingsRef = { value: this.#settingsTimer };

		// Pipeline 1: tasks
		$effect(() => {
			const tasks: Task[] = JSON.parse(JSON.stringify(taskService.tasks));
			const date = getDate();
			const { dayStart, dayEnd } = this.appState;

			if (this.#isSwitching) return;

			this.#debounce(localRef, this.LOCAL_DEBOUNCE_MS, () => {
				this.saveDayState(date, { tasks, dayStart, dayEnd });
			});

			this.#debounce(cloudRef, this.CLOUD_DEBOUNCE_MS, () => {
				void this.#pushToFirebase(date, tasks);
			});

			this.#localTimer = localRef.value;
			this.#cloudTimer = cloudRef.value;
		});

		// Pipeline 2: settings
		// Destructuring individual fields so Svelte tracks each one separately.
		// A single `appState` read would only re-run when the object reference
		// changes, not when its properties mutate.
		$effect(() => {
			// Reading these fields registers them as reactive dependencies.
			// Any change to any of them triggers a debounced settings write.
			void this.appState.stepSize;
			void this.appState.theme;
			void this.appState.showTimeline;
			void this.appState.favourites;

			this.#debounce(settingsRef, this.LOCAL_DEBOUNCE_MS, () => {
				this.#writeSettings();
			});

			this.#settingsTimer = settingsRef.value;
		});
	}

	beginSwitch() {
		this.#isSwitching = true;
	}
	endSwitch() {
		this.#isSwitching = false;
	}

	/**
	 * Loads structural tasks targeting specific days (ignoring settings properties).
	 */
	loadDateState(dateString: ISODateString): Partial<AppDataState> | null {
		const key = `${this.DAY_KEY_PREFIX}${dateString}`;
		const dailyData = getStorageItem<Partial<AppDataState>>(key);

		if (dailyData) return dailyData;

		if (dateString === getTodayDateISO()) {
			return getStorageItem<Partial<AppDataState>>(this.STORAGE_KEY);
		}

		return null;
	}

	/**
	 * Loads the current week structure from localStorage.
	 * Falls back to a blank 7-day week if nothing is stored yet.
	 */
	loadWeek(): Week {
		return (
			getStorageItem<Week>(this.WEEK_KEY) ??
			(Array.from({ length: 7 }, (_, i): WeekDay => ({
				dayIndex: i,
				tasks: [],
				note: ''
			})) as unknown as Week)
		);
	}

	/**
	 * Scans localStorage for all saved daily schedules.
	 * Returns a map of ISO date strings → task arrays, skipping empty days.
	 *
	 * @example
	 * getDatesWithTasks() // { "2026-06-24": [{ id: "1", name: "Gym", ... }] }
	 */
	getDatesWithTasks(): Record<ISODateString, Task[]> {
		const result: Record<ISODateString, Task[]> = {};

		try {
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (!key?.startsWith(this.DAY_KEY_PREFIX)) continue;

				const dayString = key.replace(this.DAY_KEY_PREFIX, '') as ISODateString;
				const data = getStorageItem<Day>(key);

				if (data?.tasks && data.tasks.length > 0) {
					result[dayString] = data.tasks;
				}
			}
		} catch (error) {
			console.error('[SyncService] Failed to read dates with tasks:', error);
		}

		return result;
	}

	#wipeLocalData(): void {
		try {
			const staticKeys = [this.STORAGE_KEY, this.SETTINGS_KEY, this.WEEK_KEY, this.USAGE_KEY];
			// Remove the static keys from localStorage
			for (const key of staticKeys) localStorage.removeItem(key);

			const keysToRemove: string[] = [];
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key?.startsWith(this.DAY_KEY_PREFIX)) keysToRemove.push(key);
			}
			for (const key of keysToRemove) localStorage.removeItem(key);

			console.log('[SyncService] localStorage cleared.');
		} catch (error) {
			console.error('[SyncService] Failed to clear localStorage:', error);
			toastService.showToast('Failed to clear localStorage');
		}
	}

	wipeData(): void {
		this.#wipeLocalData();
		toastService.showToast('Successfully wiped data');
		// Get fresh default state
		this.#initState();
	}
}

export const syncService = new SyncService();
