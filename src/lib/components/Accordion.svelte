<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fly } from 'svelte/transition';
	import { expoOut, quadIn } from 'svelte/easing';

	interface Props {
		isDefaultOpen?: boolean;
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
		<div
			in:fly={{ y: 10, duration: 50, easing: expoOut }}
			out:fly={{ y: -5, duration: 50, easing: quadIn }}
			class="origin-top"
		>
			{@render content()}
		</div>
	{/if}
</div>
