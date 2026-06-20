<script lang="ts">
	import CircularSlider from '$lib/components/CircularSlider.svelte';
	import Donut from '$lib/components/Donut.svelte';
	import Header from '$lib/components/Header.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import ShortcutItem from '$lib/components/ShortcutItem.svelte';
	import TaskList from '$lib/components/TaskList.svelte';
	import Button from '$lib/components/Button.svelte';

	import { CIRCULAR_SLIDER_CONFIG } from '$lib/constants/sliderConfig';
	import { taskService } from '$lib/services/TaskService.svelte';
	import { settingsService } from '$lib/services/SettingsService.svelte';
	import { toastService } from '$lib/services/ToastService.svelte';

	import { formatTime, formatHours } from '$lib/utils/formatUtils';
	import Toast from '$lib/components/Toast.svelte';
	import ToastList from '$lib/components/ToastList.svelte';

	let helpModalOpen = $state(false);

	let globalShortcutItems = [
		{ shortcut: '/', description: 'Focus Add-task' },
		{ shortcut: 'N', description: 'Set day start = now' },
		{ shortcut: 'D', description: 'Distribute evenly' },
		{ shortcut: 'T', description: 'Jump to today' },
		{ shortcut: 'W', description: 'Toggle Today / Week' },
		{ shortcut: '?', description: 'This help' },
		{ shortcut: 'Esc', description: 'Close any sheet' }
	];

	let sliderShortcutItems = [
		{ shortcut: 'Drag', description: 'Adjust hours' },
		{ shortcut: 'Click track', description: 'Snap to position' },
		{ shortcut: 'Wheel', description: 'Fine-tune (Shift = x4)' },
		{ shortcut: '← →', description: 'Step by snap' },
		{ shortcut: 'Shift +←/→', description: 'Big step' },
		{ shortcut: 'Home / End', description: '0 / max' }
	];

	// TODO: change to null
	let selectedTaskId: string | null = $state('1');
	let dayStart = $state(2);
	let dayEnd = $state(5);
	let nowHour = $state(3);
	let dayLen = $state(4);

	function handleDaySliderChange(start: number, end: number): void {
		dayStart = start;
		dayEnd = end;
	}

	function onSelectTask(id: string | null) {
		selectedTaskId = id;
	}

	function setDayWindow(start: number, end: number) {
		dayStart = start;
		dayEnd = end;
	}
</script>

<Header onHelpClick={() => (helpModalOpen = true)} />

<div class="grid desktop:grid-cols-[380px_1fr] gap-6 items-start px-5 py-4">
	<div class="desktop:sticky desktop:top-32.5 desktop:self-start">
		<div
			class="flex flex-col items-center gap-2 bg-bg-elev border border-border rounded-main p-5 mb-4"
		>
			<div
				class="relative"
				style={`width: ${CIRCULAR_SLIDER_CONFIG.RING_SIZE}px; height: ${CIRCULAR_SLIDER_CONFIG.RING_SIZE}px;`}
			>
				<CircularSlider {dayStart} {dayEnd} {nowHour} onChange={handleDaySliderChange} />
				<Donut
					tasks={taskService.tasks}
					{dayStart}
					{dayLen}
					selectedId={selectedTaskId}
					{onSelectTask}
				/>
			</div>
			<div class="flex items-center gap-2.5 mt-1.5 flex-wrap justify-center">
				<div
					class="font-mono text-[11px] font-medium text-text-3 bg-bg-elev-2 border border-border rounded-md px-1.5 py-0.5"
				>
					{formatTime(dayStart)} → {formatTime(dayEnd)}
				</div>
				<div class="text-[12px] text-text-3">·</div>
				<div class="text-[13px] text-text-2">
					{formatHours(dayLen)}
				</div>
				<div class="text-[12px] text-text-3">·</div>
				<Button
					size="sm"
					outline
					onclick={() => {
						const now = new Date(),
							m = now.getHours() * 60 + now.getMinutes();
						const newStart = Math.min(
							(Math.ceil(m / settingsService.snapSize) * settingsService.snapSize) / 60,
							23.5
						);
						setDayWindow(newStart, dayEnd);
						toastService.showToast('Start = now');
					}}
					class="min-h-32"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg
					>
					Start now
				</Button>
			</div>
		</div>
	</div>
	<div>
		<div class="mb-3.5">
			<Settings />
		</div>
		<div class="mb-3.5">
			<TaskList />
		</div>
	</div>
</div>

<Modal bind:isOpen={helpModalOpen}>
	{#snippet header()}
		<h2 class="text-[20px] font-semibold tracking-[-0.02em]">Shortcuts</h2>
	{/snippet}
	<div class="font-mono text-[11px] text-text-3 tracking-[0.06em] uppercase font-medium">
		Anywhere
	</div>

	<div class="flex flex-col gap-1.5 mb-4.5">
		{#each globalShortcutItems as shortcutItem}
			<ShortcutItem shortcut={shortcutItem.shortcut} description={shortcutItem.description} />
		{/each}
	</div>

	<div class="font-mono text-[11px] text-text-3 tracking-[0.06em] uppercase font-medium">
		On any slider (hover or focus)
	</div>

	<div class="flex flex-col gap-1.5 mb-4.5">
		{#each sliderShortcutItems as shortcutItem}
			<ShortcutItem shortcut={shortcutItem.shortcut} description={shortcutItem.description} />
		{/each}
	</div>
</Modal>

<ToastList />
