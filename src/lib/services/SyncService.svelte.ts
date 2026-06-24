import type { Day } from '$lib/types/day';
import type { ISODateString } from '$lib/types/isoDateString';
import type { SyncStatus } from '$lib/types/syncStatus';
import type { Task } from '$lib/types/task';
import type { Week, WeekDay } from '$lib/types/week';
import { getStorageItem } from '$lib/utils/storageUtils';

/**
 * Service responsible for managing application data persistence,
 * state synchronization, and storage keys.
 */
class SyncService {
	readonly DAY_KEY_PREFIX = 'sliders_day_' as const;
	readonly STORAGE_KEY = 'sliders_data' as const;
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
