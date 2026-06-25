<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { clsx } from 'clsx';

	interface Props extends HTMLButtonAttributes {
		outline?: boolean;
		ghost?: boolean;
		iconOnly?: boolean;
		size?: 'sm' | 'md' | 'lg';
		color?: 'base' | 'accent' | 'danger';
		children?: Snippet;
	}

	let {
		outline = false,
		ghost = false,
		iconOnly = false,
		size = 'md',
		color = 'base',
		children,
		class: className = '',
		type = 'button',
		...restProps
	}: Props = $props();

	const sizeSpecs = {
		sm: 'text-xs',
		md: 'text-sm',
		lg: 'text-base'
	};

	// Square sizes for iconOnly — explicit w + h so aspect ratio is always 1:1
	const iconSizes = {
		sm: 'w-8 h-8',
		md: 'w-[var(--tap)] h-[var(--tap)]',
		lg: 'w-12 h-12'
	};

	// Min-height only for regular (non-icon) buttons
	const minHeights = {
		sm: 'min-h-[32px]',
		md: 'min-h-[var(--tap)]',
		lg: 'min-h-[48px]'
	};

	const paddings = {
		sm: 'px-3',
		md: 'px-[18px]',
		lg: 'px-6'
	};

	let computedClasses = $derived(
		clsx(
			'inline-flex items-center gap-2 rounded-main-sm',
			'font-medium text-sm tracking-tight transition-all duration-150 ease-out',
			'cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:border-accent',

			!className?.includes('justify-') && 'justify-center',

			sizeSpecs[size],

			iconOnly ? ['p-0 shrink-0', iconSizes[size]] : [minHeights[size], paddings[size]],

			// Ghost variant — no border, no background, just a hover fill
			ghost && {
				'bg-transparent border-transparent': true,
				'hover:bg-bg-elev-2': true,
				'text-text': color === 'base',
				'text-accent': color === 'accent',
				'text-danger': color === 'danger'
			},

			// Standard color matrix (skipped when ghost)
			!ghost && {
				// BASE
				'border border-border text-text': color === 'base',
				'bg-bg-elev-2 hover:bg-bg-elev-2 hover:border-border-strong': color === 'base' && !outline,
				'bg-transparent hover:bg-bg-elev-2 hover:border-border-strong': color === 'base' && outline,

				// ACCENT
				'text-bg bg-accent border border-transparent hover:brightness-110':
					color === 'accent' && !outline,
				'text-accent bg-transparent border border-accent/30 hover:border-accent hover:bg-accent/5':
					color === 'accent' && outline,

				// DANGER
				'text-text bg-danger border border-transparent hover:bg-danger/90':
					color === 'danger' && !outline,
				'text-danger bg-transparent border border-danger/30 hover:border-danger hover:bg-danger/5':
					color === 'danger' && outline
			},

			className
		)
	);
</script>

<button {type} class={computedClasses} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</button>
