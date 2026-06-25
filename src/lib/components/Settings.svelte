<script lang="ts">
	import Accordion from '$lib/components/Accordion.svelte';
	import Button from '$lib/components/Button.svelte';
	import Switch from '$lib/components/Switch.svelte';
	import { STEPS } from '$lib/constants/stepSizes';

	import clsx from 'clsx';
	import Account from './Account.svelte';

	interface Props {
		stepSize: number;
		showTimeline: boolean;
	}

	let { stepSize = $bindable(), showTimeline = $bindable() }: Props = $props();
</script>

<Accordion>
	{#snippet header({ toggle, isOpen })}
		<Button
			onclick={toggle}
			class={clsx('w-full justify-between', {
				'border-accent': isOpen
			})}
		>
			<span class="flex items-center gap-2">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><circle cx="12" cy="12" r="3"></circle><path
						d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
					></path>
				</svg>
				Settings
			</span>
			<svg
				class="transition-transform duration-200"
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				style="transform: {isOpen ? 'rotate(180deg)' : 'none'};"
				><polyline points="6 9 12 15 18 9"></polyline></svg
			>
		</Button>
	{/snippet}

	{#snippet content()}
		<div
			class="mt-4 px-4.5 py-4 mb-3.5 bg-bg-elev border border-border rounded-main animate-fadeUp"
		>
			<div class="flex justify-between items-center py-1.5 border-b border-border mb-3.5">
				<div>
					<div class="text-[14px] font-medium">Show timeline</div>
					<div class="text-[12px] text-text-3 mt-0.5">Linear strip below the donut</div>
				</div>
				<Switch bind:checked={showTimeline} />
			</div>

			<div class="text-[11px] tracking-[0.06em] font-mono text-text-3 uppercase font-medium mb-2">
				Snap size
			</div>
			<div class="grid grid-cols-4 gap-1.5 mb-2">
				{#each STEPS as step}
					<Button
						color={stepSize === step.minute ? 'accent' : 'base'}
						onclick={() => (stepSize = step.minute)}>{step.label}</Button
					>
				{/each}
			</div>
			<div class="mb-4.5">
				<Account />
			</div>
			<div class="text-[11px] tracking-[0.06em] font-mono text-text-3 uppercase font-medium mb-2">
				Reset
			</div>
			<Button color="danger" outline class="w-full">Reset app data</Button>
		</div>
	{/snippet}
</Accordion>
