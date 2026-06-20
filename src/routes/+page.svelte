<script lang="ts">
	import CircularSlider from '$lib/components/CircularSlider.svelte';
	import Header from '$lib/components/Header.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import ShortcutItem from '$lib/components/ShortcutItem.svelte';
	import TaskList from '$lib/components/TaskList.svelte';

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

	let dayStart = $state(2);
	let dayEnd = $state(5);
	let nowHour = $state(3);

	function handleDaySliderChange(start: number, end: number): void {
		dayStart = start;
		dayEnd = end;
	}
</script>

<Header onHelpClick={() => (helpModalOpen = true)} />

<div class="grid desktop:grid-cols-[380px_1fr] gap-6 items-start px-5 py-4">
	<div class="desktop:sticky desktop:top-32.5 desktop:self-start">
		<CircularSlider {dayStart} {dayEnd} {nowHour} onChange={handleDaySliderChange} />
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
