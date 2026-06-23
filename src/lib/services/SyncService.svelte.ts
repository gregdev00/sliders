import type { Day } from '$lib/types/day';
import type { SyncStatus } from '$lib/types/syncStatus';
import type { Week, WeekDay } from '$lib/types/week';
import { getStorageItem } from '$lib/utils/storageUtils';

/**
 * Service responsible for managing application data persistence,
 * state synchronization, and storage keys.
 */
class SyncService {
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
}

export const syncService = new SyncService();
