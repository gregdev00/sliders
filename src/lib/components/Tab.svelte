<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	export interface TabClickEvent {
		preventDefault: () => void;
	}

	interface Props {
		id: string;
		onclick?: (event: TabClickEvent) => void;
		children: import('svelte').Snippet;
	}

	let { id, onclick, children }: Props = $props();

	const tabs = getContext<{
		activeTab: string | null;
		setActive: (id: string) => void;
		registerTab: (id: string) => void;
	}>('tabs');

	onMount(() => {
		tabs.registerTab(id);
	});

	let isActive = $derived(tabs.activeTab === id);

	function handleTabClick() {
		let isDefaultPrevented = false;
		if (onclick) {
			onclick({
				preventDefault: () => {
					isDefaultPrevented = true;
				}
			});
		}
		if (isDefaultPrevented) return;

		tabs.setActive(id);
	}
</script>

<button
	role="tab"
	aria-selected={isActive}
	aria-controls="panel-{id}"
	id="tab-{id}"
	onclick={handleTabClick}
	class="relative flex flex-1 items-center gap-1.5 tracking-[-0.01em] justify-center min-h-tap px-3 py-0 bg-transparent border-none hover:text-text-2 text-[13px] font-medium transition-colors duration-150 cursor-pointer"
	class:text-text-2={isActive}
	class:text-text-3={!isActive}
>
	{#if isActive}
		<div
			class="absolute left-3 right-3 -bottom-px h-0.5 bg-accent rounded-t-xs"
			transition:fade={{ duration: 150 }}
		></div>
	{/if}
	{@render children()}
</button>
