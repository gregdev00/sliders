<script lang="ts">
	import { type Snippet } from 'svelte';
	import ThemeSwitcher from './ThemeSwitcher.svelte';
	import Button from './Button.svelte';
	import { settingsService } from '$lib/services/SettingsService.svelte';
	import SyncBadge from './SyncBadge.svelte';
	import { authService } from '$lib/services/AuthService.svelte';
	import { formatHours, formatTime } from '$lib/utils/formatUtils';

	interface Props {
		currentTime: Date;
		total: number;
		dayLen: number;
		remaining: number;
		over: boolean;
		perfect: boolean;
		onHelpClick: () => void;
		tabList?: Snippet;
	}

	let { currentTime, total, dayLen, remaining, over, perfect, onHelpClick, tabList }: Props =
		$props();
	const formattedTotal = $derived(perfect ? formatHours(dayLen) : formatHours(Math.abs(remaining)));
	const progress = $derived(Math.min(100, (total / dayLen) * 100));
</script>

<header class="sticky top-0 z-20 bg-bg transition-colors duration-300 ease-out">
	<div class="pt-4 px-5 pb-3 flex items-center justify-between gap-3">
		<div class="flex items-center gap-2.5">
			<div class="w-2 h-6 rounded-xs bg-accent-glow"></div>
			<div>
				<div class="text-lg font-semibold leading-none tracking-[-0.02em]">Sliders</div>
				<div class="flex gap-2 items-center text-[11px] text-text-3 mt-0.5 font-mono">
					<span class="tabular-nums">{formatTime(currentTime)}</span>
					<span class="opacity-40 select-none">·</span>
					<span>{settingsService.snapSize}m</span>
					{#if authService.isAuthenticated}
						<SyncBadge class="ml-0.75" onlyCircle />
					{/if}
				</div>
			</div>
		</div>
		<div class="flex items-center gap-2.5">
			<div class="text-right">
				<div
					class="tabular-nums text-lg font-semibold leading-none tracking-[-0.01em]"
					class:text-danger={over}
					class:text-accent-2={!over && perfect}
					class:text-text={!over && !perfect}
				>
					{formattedTotal}
				</div>
				<div class="text-[10px] font-mono text-text-3 tracking-[0.06em] mt-0.75">
					{over ? 'OVER' : perfect ? 'FULL' : 'FREE'}
				</div>
			</div>
			<ThemeSwitcher />
			<Button iconOnly outline aria-label="Keyboard shortcuts" onclick={onHelpClick}
				><svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
					></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg
				></Button
			>
		</div>
	</div>
	<progress
		value={progress}
		max="100"
		class="block w-full h-0.5 appearance-none bg-bg-track [&::-webkit-progress-bar]:bg-bg-track"
		class:[&::-webkit-progress-value]:bg-danger={over}
		class:[&::-moz-progress-bar]:bg-danger={over}
		class:[&::-webkit-progress-value]:bg-accent-2={!over && perfect}
		class:[&::-moz-progress-bar]:bg-accent-2={!over && perfect}
		class:[&::-webkit-progress-value]:bg-accent={!over && !perfect}
		class:[&::-moz-progress-bar]:bg-accent={!over && !perfect}
	></progress>
	{@render tabList?.()}
</header>
