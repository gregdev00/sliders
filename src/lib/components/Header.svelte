<script lang="ts">
	import { onMount } from 'svelte';
	import ThemeSwitcher from './ThemeSwitcher.svelte';
	import Button from './Button.svelte';
	import { settingsService } from '$lib/services/SettingsService.svelte';

	interface Props {
		onHelpClick: () => void;
	}

	let { onHelpClick }: Props = $props();

	// Helper function to grab the formatted time string
	function getFormattedTime() {
		const now = new Date();
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		return `${hours}:${minutes}`;
	}

	// Set the initial state to the exact current time immediately
	let currentTime = $state(getFormattedTime());

	function updateClock() {
		currentTime = getFormattedTime();
	}

	onMount(() => {
		const interval = setInterval(updateClock, 1000);

		return () => clearInterval(interval);
	});
</script>

<header
	class="sticky top-0 z-20 bg-bg border-b border-border transition-colors duration-300 ease-out"
>
	<div class="pt-4 px-5 pb-3 flex items-center justify-between gap-3">
		<div class="flex items-center gap-2.5">
			<div class="w-2 h-6 rounded-xs bg-accent-glow"></div>
			<div>
				<div class="text-lg font-semibold leading-none tracking-[-0.02em]">Sliders</div>
				<div class="flex gap-2 items-center text-[11px] text-text-3 mt-0.5 font-mono">
					<span class="tabular-nums">{currentTime}</span>
					<span class="opacity-40">·</span>
					<span>{settingsService.snapSize}m</span>
				</div>
			</div>
		</div>
		<div class="flex items-center gap-2.5">
			<div class="text-right">
				<div class="text-text tabular-nums text-lg font-semibold leading-none tracking-[-0.01em]">
					6h
				</div>
				<div class="text-[10px] font-mono text-text-3 tracking-[0.06em] mt-0.75">FREE</div>
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
		value="92.8571"
		max="100"
		class="block w-full h-0.5 appearance-none bg-bg-track
	[&::-webkit-progress-bar]:bg-bg-track
	[&::-webkit-progress-value]:bg-accent
	[&::-moz-progress-bar]:bg-accent"
	></progress>
</header>
