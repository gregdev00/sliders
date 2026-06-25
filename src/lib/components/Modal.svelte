<script lang="ts">
	import type { Snippet } from 'svelte';
	import { clsx } from 'clsx';
	import Button from './Button.svelte';

	interface Props {
		isOpen: boolean;
		onClose?: () => void;
		closeOnOutsideClick?: boolean;
		closeOnEscape?: boolean;
		size?: 'sm' | 'md' | 'lg' | 'xl';
		header?: Snippet;
		children?: Snippet;
		footer?: Snippet;
	}

	let {
		isOpen = $bindable(),
		onClose,
		closeOnOutsideClick = true,
		closeOnEscape = true,
		size = 'md',
		header,
		children,
		footer
	}: Props = $props();

	function handleClose() {
		isOpen = false;
		onClose?.();
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (isOpen && closeOnEscape && e.key === 'Escape') {
			handleClose();
		}
	}

	const sizeClasses = {
		sm: 'max-w-sm',
		md: 'max-w-md min-[600px]:max-w-[480px]',
		lg: 'max-w-lg',
		xl: 'max-w-2xl'
	};
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if isOpen}
	<div
		class="fixed inset-0 z-100 flex items-end justify-center bg-[#08090f]/65 [backdrop-filter:blur(12px)] [-webkit-backdrop-filter:blur(12px)] transition-opacity duration-150 min-[600px]:items-center min-[600px]:p-6"
		onclick={() => {
			if (closeOnOutsideClick) handleClose();
		}}
		onkeydown={(e) => e.preventDefault()}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div
			class={clsx(
				'w-full bg-bg-elev border border-border text-text shadow-lg flex flex-col max-h-[92dvh]',
				'rounded-t-main min-[600px]:rounded-main',
				'animate-slide-up min-[600px]:transform-none',
				sizeClasses[size]
			)}
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="presentation"
		>
			<div class="px-6 pt-6 pb-4 flex items-center justify-between gap-4 shrink-0">
				{#if header}
					{@render header()}
				{:else}
					<div></div>
				{/if}
				<Button iconOnly outline onclick={handleClose} aria-label="Bezárás"
					><svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg></Button
				>
			</div>

			<div class="text-sm text-text-2 leading-relaxed px-6 overflow-y-auto flex-1 min-h-0 pb-6">
				{@render children?.()}
			</div>

			{#if footer}
				<div class="px-6 pb-6 pt-2 flex items-center justify-end gap-2 shrink-0">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}
