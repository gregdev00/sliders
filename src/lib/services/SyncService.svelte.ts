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
	dayStart: number;
	dayEnd: number;
	favourites: any[];
}

export interface AppDataState {
	tasks: Task[];
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
	// ─── Storage keys ─────────────────────────────────────────────────────────
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

	// This serves as the single source of truth for app state defaults
	appState = $state<AppSettings & AppDataState>({
		tasks: DEFAULT_TASKS,
		favourites: [],
		stepSize: 15,
		theme: 'system',
		showTimeline: true,
		dayStart: 8,
		dayEnd: 22
	});

	// Reactive state
	#syncStatus = $state<SyncStatus>('synced');

	get syncStatus(): SyncStatus {
		return this.#syncStatus;
	}

	constructor() {
		// Hydration
		this.appState = this.initState();
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
	 * Pushes a day's task snapshot to Firebase.
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
			toastService.showToast('Cloud sync failed - changes saved locally');
			this.#syncStatus = 'error';
		}
	}

	// Public API

	/**
	 * Persists a day's task list to localStorage.
	 * Debounced separately from Firebase so local saves stay fast.
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
	 * Starts a reactive auto-sync loop tied to taskService.tasks.
	 *
	 * Must be called inside a Svelte component or reactive root so $effect works.
	 * Typically called once in +page.svelte on mount.
	 *
	 * Writes are split into two debounced pipelines:
	 *  1. localStorage  – 300 ms after the last change
	 *  2. Firebase      – 2 s   after the last change (only when authed)
	 *
	 * @param getDate  Reactive accessor returning the currently active date.
	 *                 Called inside $effect so it participates in tracking.
	 */
	startAutoSync(getDate: () => ISODateString): void {
		// Wrapper objects so #debounce can mutate the timer reference
		const localRef = { value: this.#localTimer };
		const cloudRef = { value: this.#cloudTimer };

		$effect(() => {
			// Reading taskService.tasks here registers this effect as a dependent –
			// any mutation to tasks will re-run the effect automatically.
			const tasks: Task[] = JSON.parse(JSON.stringify(taskService.tasks));
			const date = getDate();

			// localStorage write (fast)
			this.#debounce(localRef, this.LOCAL_DEBOUNCE_MS, () => {
				this.saveDayState(date, { tasks });
			});

			// Firebase write (slow, only when authed)
			this.#debounce(cloudRef, this.CLOUD_DEBOUNCE_MS, () => {
				void this.#pushToFirebase(date, tasks);
			});

			// Sync timer refs back so future calls share the same handles
			this.#localTimer = localRef.value;
			this.#cloudTimer = cloudRef.value;
		});
	}

	/**
	 * Loads structural tasks targeting specific days (ignoring settings properties).
	 */
	loadDateState(dateString: ISODateString): Partial<AppDataState> | null {
		const key = `${this.DAY_KEY_PREFIX}${dateString}`;
		const dailyData = getStorageItem<Partial<AppDataState>>(key);

		if (dailyData) return dailyData;

		// Legacy fallback: today's tasks may still be under the old flat key
		if (dateString === getTodayDateISO()) {
			return getStorageItem<Partial<AppDataState>>(this.STORAGE_KEY);
		}

		return null;
	}

	/**
	 * Initializes the full app state on first load.
	 * Settings come from SETTINGS_KEY; task data from the day key (or legacy fallback).
	 */
	initState(): AppSettings & AppDataState {
		const today = getTodayDateISO();

		const savedSettings = getStorageItem<Partial<AppSettings>>(this.SETTINGS_KEY);
		const savedData =
			this.loadDateState(today) ?? getStorageItem<Partial<AppDataState>>(this.STORAGE_KEY);

		return {
			tasks: savedData?.tasks ?? DEFAULT_TASKS,
			favourites: savedSettings?.favourites ?? [],
			stepSize: savedSettings?.stepSize ?? 15,
			theme: savedSettings?.theme ?? 'system',
			showTimeline: savedSettings?.showTimeline ?? true,
			dayStart: savedSettings?.dayStart ?? 8,
			dayEnd: savedSettings?.dayEnd ?? 22
		};
	}

	/**
	 * Saves UI/app preferences to localStorage.
	 * Debounced to avoid hammering storage on rapid setting changes
	 * (e.g. the user dragging a theme or step-size picker).
	 */
	saveSettings(settings: AppSettings): void {
		const settingsRef = { value: this.#settingsTimer };

		this.#debounce(settingsRef, this.LOCAL_DEBOUNCE_MS, () => {
			this.#syncStatus = 'pending';
			try {
				setStorageItem<AppSettings>(this.SETTINGS_KEY, settings);
				this.#syncStatus = 'synced';
			} catch (error) {
				console.error('[SyncService] Failed to save settings:', error);
				toastService.showToast('Failed to save settings');
				this.#syncStatus = 'error';
			}
		});

		this.#settingsTimer = settingsRef.value;
	}

	/**
	 * Loads the current week structure from localStorage.
	 * Falls back to a blank 7-day week if nothing is stored yet.
	 */
	loadWeek(): Week {
		return (
			getStorageItem<Week>(this.WEEK_KEY) ??
			(Array.from(
				{ length: 7 },
				(_, i): WeekDay => ({ dayIndex: i, tasks: [], note: '' })
			) as unknown as Week)
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

	#wipeLocalData() {
		try {
			// Collect exact keys defined as properties in this class
			const staticKeys = [this.STORAGE_KEY, this.SETTINGS_KEY, this.WEEK_KEY, this.USAGE_KEY];

			// Remove the static keys from localStorage
			for (const key of staticKeys) {
				localStorage.removeItem(key);
			}

			// Scan and remove any dynamic day keys matching the prefix
			const dynamicPrefix = this.DAY_KEY_PREFIX;

			// Collect keys first to avoid mutating keys array mid-iteration
			const keysToRemove: string[] = [];
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key && key.startsWith(dynamicPrefix)) {
					keysToRemove.push(key);
				}
			}

			// Purge matching dynamic keys
			for (const key of keysToRemove) {
				localStorage.removeItem(key);
			}

			console.log('[SyncService] LocalStorage keys cleared successfully.');
		} catch (error) {
			console.error('[SyncService] Failed to clear localStorage items:', error);
			toastService.showToast('Failed clear localStorage items');
		}
	}

	wipeData() {
		this.#wipeLocalData();
		toastService.showToast('Successfully wiped data');

		// Get fresh default state
		this.appState = this.initState();
	}
}

export const syncService = new SyncService();
