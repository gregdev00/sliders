<script lang="ts">
	import { getContext } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	interface Props {
		id: string;
		children: import('svelte').Snippet;
	}

	let { id, children }: Props = $props();

	const tabs = getContext<{ activeTab: string | null }>('tabs');

	let isActive = $derived(tabs.activeTab === id);
</script>

{#if isActive}
	<div
		role="tabpanel"
		id="panel-{id}"
		aria-labelledby="tab-{id}"
		in:fly={{ y: 16, duration: 350, opacity: 0, easing: cubicOut }}
	>
		{@render children()}
	</div>
{/if}
