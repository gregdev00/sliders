import { DEFAULT_TASKS } from '$lib/constants/defaultTasks';
import type { Day } from '$lib/types/day';
import type { ISODateString } from '$lib/types/isoDateString';
import type { SyncStatus } from '$lib/types/syncStatus';
import type { Task } from '$lib/types/task';
import type { Week, WeekDay } from '$lib/types/week';
import { getTodayDateISO } from '$lib/utils/formatUtils';
import { getStorageItem, setStorageItem } from '$lib/utils/storageUtils';
import { toastService } from './ToastService.svelte';

export interface AppSettings {
	stepSize: number;
	theme: string;
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
 */
class SyncService {
	readonly DAY_KEY_PREFIX = 'sliders_day_' as const;
	readonly STORAGE_KEY = 'sliders_data' as const;
	readonly SETTINGS_KEY = 'sliders_settings_v1' as const;
	readonly WEEK_KEY = 'sliders_week_v1' as const;
	readonly USAGE_KEY = 'sliders_task_usage' as const;
	readonly TWEAK_KEY = 'sliders_tweaks_v1' as const;

	#syncStatus = $state<SyncStatus>('synced');

	/**
	 * Gets the current synchronization status of the application data.
	 */
	get syncStatus(): SyncStatus {
		return this.#syncStatus;
	}

	/**
	 * Loads structural tasks targeting specific days (ignoring settings properties)
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
	 * Initializes the state components cleanly.
	 * Pulls configuration parameters from SETTINGS_KEY and structural data from daily/fallback sources.
	 */
	initState(): AppSettings & AppDataState {
		const today = getTodayDateISO();

		// Load settings from the dedicated settings key, falling back to legacy storage if needed
		const savedSettings = getStorageItem<Partial<AppSettings>>(this.SETTINGS_KEY);

		// Load current tasks from daily schedule or legacy fallback
		const savedData =
			this.loadDateState(today) || getStorageItem<Partial<AppDataState>>(this.STORAGE_KEY);

		return {
			// Data
			tasks: savedData?.tasks ?? DEFAULT_TASKS,
			// Settings
			favourites: savedSettings?.favourites ?? [],
			stepSize: savedSettings?.stepSize ?? 15,
			theme: savedSettings?.theme ?? '',
			showTimeline: savedSettings?.showTimeline ?? true,
			dayStart: savedSettings?.dayStart ?? 8,
			dayEnd: savedSettings?.dayEnd ?? 22
		};
	}

	/**
	 * Dedicated method to save UI/App preferences to local storage
	 */
	saveSettings(settings: AppSettings): void {
		this.#syncStatus = 'pending';
		try {
			setStorageItem<AppSettings>(this.SETTINGS_KEY, settings);
			this.#syncStatus = 'synced';
		} catch (error) {
			console.error('Failed to save settings configurations:', error);
			toastService.showToast('Failed to save settings configurations');
			this.#syncStatus = 'error';
		}
	}

	/**
	 * Loads the current week data from localStorage.
	 * If no existing data is found, initializes and returns a blank 7-day week structure.
	 * * @returns {Week} The current week state containing task configurations for all 7 days.
	 */
	loadWeek(): Week {
		const storedWeek = getStorageItem<Week>(this.WEEK_KEY);

		if (storedWeek) {
			return storedWeek;
		}

		// Fallback array (default empty state)
		return Array.from(
			{ length: 7 },
			(_, i): WeekDay => ({
				dayIndex: i,
				tasks: [],
				note: ''
			})
		) as unknown as Week;
	}

	/**
	 * Scans localStorage for saved daily schedules and compiles an object mapping
	 * ISO date strings to their respective active task lists.
	 * Filters out any days containing empty task configurations.
	 * * @returns {Record<ISODateString, Task[]>} An object dictionary containing task arrays keyed by "YYYY-MM-DD" strings.
	 * * @example
	 * getDatesWithTasks() => { "2026-06-24": [{ id: 1, name: "Gym", color: "#ff0000" }] }
	 */
	getDatesWithTasks(): Record<ISODateString, Task[]> {
		const result: Record<ISODateString, Task[]> = {};

		try {
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);

				if (key?.startsWith(this.DAY_KEY_PREFIX)) {
					// Safely isolate the date string payload part
					const dayString = key.replace(this.DAY_KEY_PREFIX, '') as ISODateString;
					const data = getStorageItem<Day>(key);

					if (data?.tasks && data.tasks.length > 0) {
						result[dayString] = data.tasks;
					}
				}
			}
		} catch (error) {
			console.error('Failed to read dates with tasks from storage:', error);
		}

		return result;
	}
}

export const syncService = new SyncService();
