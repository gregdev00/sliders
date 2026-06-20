<script lang="ts">
	import { syncService } from '$lib/services/SyncService.svelte';
	import type { SyncStatus } from '$lib/types/syncStatus';
	import clsx from 'clsx';

	interface Props {
		onlyCircle?: boolean;
		class?: string;
	}

	let { onlyCircle = false, class: className = '' }: Props = $props();

	const colors: Record<SyncStatus, string> = {
		synced: 'bg-success',
		pending: 'bg-accent-3',
		offline: 'bg-text-3',
		error: 'bg-danger'
	};

	const labels: Record<SyncStatus, string> = {
		synced: 'Synced',
		pending: 'Syncing…',
		offline: 'Offline',
		error: 'Sync error'
	};

	let color = $derived(colors[syncService.syncStatus]);
	let label = $derived(labels[syncService.syncStatus]);
</script>

{#if onlyCircle}
	<span
		title={label}
		class={clsx(
			'size-1.75 inline-block rounded-full',
			color,
			syncService.syncStatus === 'pending' && 'animate-pulse',
			className
		)}
	></span>
{:else}
	<div
		title={label}
		class={clsx(
			'inline-flex items-center gap-1.5 text-[11px] text-text-3 px-2 py-0.75 bg-bg-elev rounded-[99px] border border-border',
			className
		)}
	>
		<span
			class={clsx(
				'size-1.75 rounded-full',
				color,
				syncService.syncStatus === 'pending' && 'animate-pulse'
			)}
		></span>
		{label}
	</div>
{/if}
