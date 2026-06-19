import type { SyncStatus } from '$lib/types/syncStatus';

class SyncService {
	#syncStatus = $state<SyncStatus>('synced');

	get syncStatus(): SyncStatus {
		return this.#syncStatus;
	}
}

export const syncService = new SyncService();
