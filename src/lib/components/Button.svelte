<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { clsx } from 'clsx';

	interface Props extends HTMLButtonAttributes {
		outline?: boolean;
		iconOnly?: boolean;
		size?: 'sm' | 'md' | 'lg';
		color?: 'base' | 'accent' | 'danger';
		children?: Snippet;
	}

	let {
		outline = false,
		iconOnly = false,
		size = 'md',
		color = 'base',
		children,
		class: className = '',
		type = 'button',
		...restProps
	}: Props = $props();

	// Define our scale tokens
	const sizes = {
		sm: 'px-3 text-xs min-h-[32px]',
		md: 'px-[18px] text-sm',
		lg: 'px-6 text-base min-h-[48px]'
	};

	// Use clsx to construct state profiles incrementally
	let computedClasses = $derived(
		clsx(
			// Core structural configurations
			'inline-flex items-center justify-center gap-2 min-h-[var(--tap)] rounded-main-sm',
			'font-medium text-sm tracking-tight transition-all duration-150 ease-out',
			'cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed',

			// Spatial dimensions (Square vs Regular padding scale)
			iconOnly ? 'p-0 w-[var(--tap)]' : sizes[size],

			// Dynamic Color Matrix mapped dynamically with the Outline flag
			{
				// --- BASE COLOR PALETTE ---
				'border border-border text-text': color === 'base',
				'bg-bg-elev-2 hover:bg-bg-elev-2 hover:border-border-strong': color === 'base' && !outline,
				'bg-transparent hover:bg-bg-elev-2 hover:border-border-strong': color === 'base' && outline,

				// --- ACCENT COLOR PALETTE ---
				'text-bg bg-accent border border-transparent hover:brightness-110':
					color === 'accent' && !outline,
				'text-accent bg-transparent border border-accent/30 hover:border-accent hover:bg-accent/5':
					color === 'accent' && outline,

				// --- DANGER COLOR PALETTE ---
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
