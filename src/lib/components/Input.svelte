<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		value?: string | number;
	}

	let {
		class: className = '',
		type = 'text',
		value = $bindable(''),
		...restProps
	}: Props = $props();
</script>

<input
	{type}
	bind:value
	class="w-full bg-bg-input min-h-tap border border-border text-[15px] transition-[border-color_0.15s_ease] rounded-main-sm py-0 px-4 text-text outline-none focus:border-accent {className}"
	{...restProps}
/>
