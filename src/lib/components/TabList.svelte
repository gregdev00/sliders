<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="flex gap-0.5 py-0 px-2" role="tablist">
	{@render children()}
</div>
