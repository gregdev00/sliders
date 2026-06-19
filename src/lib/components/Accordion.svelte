<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		isDefaultOpen?: boolean;
		// Define two separate layout blocks
		header: Snippet<[{ toggle: () => void; isOpen: boolean }]>;
		content: Snippet;
	}

	let { isDefaultOpen = false, header, content }: Props = $props();
	let isOpen = $derived(isDefaultOpen);

	function toggle() {
		isOpen = !isOpen;
	}
</script>

<div class="w-full space-y-4">
	{@render header({ toggle, isOpen })}

	{#if isOpen}
		{@render content()}
	{/if}
</div>
