<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { clsx } from 'clsx';
	import Label from './Label.svelte';

	interface Props extends HTMLInputAttributes {
		value?: string | number;
		label?: string | number;
	}

	let {
		class: className = '',
		type = 'text',
		label,
		value = $bindable(''),
		id,
		...restProps
	}: Props = $props();

	const stableFallbackId =
		typeof crypto !== 'undefined' && crypto.randomUUID
			? `input-${crypto.randomUUID()}`
			: `input-${Math.random().toString(36).substring(2, 9)}`;

	const finalId = $derived(id ?? stableFallbackId);

	const computedClasses = $derived(
		clsx(
			'w-full bg-bg-input min-h-tap text-[15px] py-0 px-4 text-text rounded-main-sm',

			'border border-border transition-[border-color_0.15s_ease] outline-none',

			'focus:border-accent',

			className
		)
	);
</script>

{#if label}
	<Label for={finalId}>
		{label}
	</Label>
{/if}
<input {type} id={finalId} bind:value class={computedClasses} {...restProps} />
