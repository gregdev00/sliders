import type { SyncStatus } from '$lib/types/syncStatus';

class SyncService {
	STORAGE_KEY = 'sliders_data' as const;
	WEEK_KEY = 'sliders_week_v1' as const;
	USAGE_KEY = 'sliders_task_usage' as const;
	TWEAK_KEY = 'sliders_tweaks_v1' as const;

	#syncStatus = $state<SyncStatus>('synced');

	get syncStatus(): SyncStatus {
		return this.#syncStatus;
	}
}

export const syncService = new SyncService();
