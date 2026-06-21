<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		for: string;
		children: Snippet;
	}

	let { for: htmlFor, children }: Props = $props();
</script>

<label
	for={htmlFor}
	class="font-mono mb-2 text-[11px] text-text-3 tracking-[0.06em] uppercase font-medium"
	>{@render children()}</label
>
