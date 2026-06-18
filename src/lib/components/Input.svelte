<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { clsx } from 'clsx';

	interface Props extends HTMLInputAttributes {
		value?: string | number;
	}

	let {
		class: className = '',
		type = 'text',
		value = $bindable(''),
		...restProps
	}: Props = $props();

	let computedClasses = $derived(
		clsx(
			'w-full bg-bg-input min-h-tap text-[15px] py-0 px-4 text-text rounded-main-sm',

			'border border-border transition-[border-color_0.15s_ease] outline-none',

			'focus:border-accent',

			className
		)
	);
</script>

<input {type} bind:value class={computedClasses} {...restProps} />
