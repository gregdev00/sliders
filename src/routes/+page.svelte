<script lang="ts">
	import CircularSlider from '$lib/components/CircularSlider.svelte';
	import Donut from '$lib/components/Donut.svelte';
	import Tabs from '$lib/components/Tabs.svelte';
	import TabPanel from '$lib/components/TabPanel.svelte';
	import Tab, { type TabClickEvent } from '$lib/components/Tab.svelte';
	import TabList from '$lib/components/TabList.svelte';
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

	import {
		formatTime,
		formatHours,
		getTodayDateISO,
		formatDateToShortLabel,
		getTomorrowDateISO,
		formatDateToUltraShortLabel
	} from '$lib/utils/formatUtils';
	import ToastList from '$lib/components/ToastList.svelte';
	import Input from '$lib/components/Input.svelte';
	import type { Task } from '$lib/types/task';
	import ColorPicker from '$lib/components/ColorPicker.svelte';
	import { TIME_PRECISION_CONFIG } from '$lib/constants/timePrecisionConfig';
	import Timeline from '$lib/components/Timeline.svelte';
	import WeekView from '$lib/components/WeekView.svelte';
	import type { ISODateString } from '$lib/types/isoDateString';
	import Accordion from '$lib/components/Accordion.svelte';
	import clsx from 'clsx';

	let helpModalOpen = $state(false);
	let editModalOpen = $state(false);

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

	let currentDateTime = $state(new Date());

	// Update clock in 1s intervals
	$effect(() => {
		const interval = setInterval(() => {
			currentDateTime = new Date();
		}, 1000);

		return () => clearInterval(interval);
	});

	let selectedTaskId: string | null = $state(null);
	let dayStart = $state(8);
	let dayEnd = $state(22);
	let nowHour = $derived(currentDateTime.getHours());
	let dayLen = $derived(calculateDayLen(dayStart, dayEnd));
	const total = $derived(taskService.tasks.reduce((sum, task) => sum + task.hours, 0));
	const remaining = $derived(dayLen - total);
	const over = $derived(remaining < -TIME_PRECISION_CONFIG.HOUR_MATCH_TOLERANCE);
	const perfect = $derived(Math.abs(remaining) < TIME_PRECISION_CONFIG.HOUR_MATCH_TOLERANCE);
	let scheduleDate = $state(getTomorrowDateISO());

	let editTask = $state<Task | null>(null);

	let activeView = $state('today');
	let activeDate: ISODateString = $state(getTodayDateISO());
	const isToday = $derived(activeDate === getTodayDateISO());

	const inWindow = $derived(
		(() => {
			if (!isToday) return false;
			if (dayEnd >= dayStart) return nowHour >= dayStart && nowHour < dayEnd;
			return nowHour >= dayStart || nowHour < dayEnd;
		})()
	);

	const activeIndex = $derived(
		(() => {
			if (!inWindow || !taskService.tasks.length) return -1;
			let cursor = dayStart;
			for (let i = 0; i < taskService.tasks.length; i++) {
				const next = cursor + (taskService.tasks[i].hours || 0);
				const within =
					dayEnd >= dayStart
						? nowHour >= cursor && nowHour < next
						: (nowHour - cursor + 24) % 24 < (taskService.tasks[i].hours || 0);
				if (within) return i;
				cursor = next;
			}
			return -1;
		})()
	);

	const activeProgress = $derived.by(() => {
		if (activeIndex < 0) return 0;
		let cursor = dayStart;
		for (let i = 0; i < activeIndex; i++) cursor += taskService.tasks[i].hours || 0;
		const len = taskService.tasks[activeIndex].hours || 0;
		if (len <= 0) return 0;
		const into = dayEnd >= dayStart ? nowHour - cursor : (nowHour - cursor + 24) % 24;
		return Math.max(0, Math.min(1, into / len));
	});

	const dayLabel = $derived(isToday ? 'Today' : formatDateToShortLabel(activeDate));

	const todayTasks: Task[] = [];

	function calculateDayLen(start: number, end: number) {
		return (((end - start) % 24) + 24) % 24;
	}

	function startNow() {
		const now = new Date(),
			m = now.getHours() * 60 + now.getMinutes();
		const newStart = Math.min(
			(Math.ceil(m / settingsService.snapSize) * settingsService.snapSize) / 60,
			23.5
		);
		setDayWindow(newStart, dayEnd);
		toastService.showToast('Start = now');
	}

	function goToToday(e: TabClickEvent) {
		e.preventDefault();
		switchDate(getTodayDateISO(), true);
	}

	function onSelectTask(id: string | null) {
		console.log(id);
		selectedTaskId = id;
	}

	function handleOnEdit(task: Task) {
		editTask = task;
		editModalOpen = true;
	}

	function onSchedule() {
		console.log(`Scheduled to ${scheduleDate}`);
	}

	function setDayWindow(start: number, end: number) {
		const newDayLen = calculateDayLen(start, end);
		if (newDayLen < 0.5) return;

		const oldDayLen = calculateDayLen(dayStart, dayEnd);
		console.log({ dayStart, dayEnd, oldDayLen, newDayLen });
		taskService.scaleToDayLen(newDayLen, oldDayLen);

		dayStart = start;
		dayEnd = end;
	}

	function switchDate(dateString: ISODateString, isToday: boolean = false) {
		activeDate = dateString;
		activeView = isToday ? 'today' : 'custom-day';
		editTask = null;
		selectedTaskId = null;
	}

	function saveEditModal() {
		if (editTask === null) return;

		taskService.updateTask(editTask.id, { name: editTask.name, color: editTask.color });
		toastService.showToast('Task updated');

		editTask = null;
		editModalOpen = false;
	}
</script>

{#snippet dayLayoutContent()}
	<div class="grid desktop:grid-cols-[380px_1fr] desktop:gap-6 items-start px-5 py-4">
		<div class="max-desktop:top-32.5 max-desktop:self-start">
			<div
				class="flex flex-col items-center gap-2 bg-bg-elev border border-border rounded-main p-5 mb-4"
			>
				<div
					class="relative"
					style={`width: ${CIRCULAR_SLIDER_CONFIG.RING_SIZE}px; height: ${CIRCULAR_SLIDER_CONFIG.RING_SIZE}px;`}
				>
					<CircularSlider {dayStart} {dayEnd} {nowHour} onChange={setDayWindow} />
					<Donut
						tasks={taskService.tasks}
						{total}
						isOver={over}
						{dayStart}
						{dayLen}
						selectedId={selectedTaskId}
						{onSelectTask}
					/>
				</div>
				<div class="flex items-center gap-2.5 mt-1.5 flex-wrap justify-center">
					<div
						class="font-mono text-[11px] font-medium text-text-3 bg-bg-elev-2 border border-border rounded-md px-1.5 py-0.5 tabular-nums"
					>
						{formatTime(dayStart)} → {formatTime(dayEnd)}
					</div>
					<div class="text-[12px] text-text-3 w-1.5 text-center select-none">·</div>
					<div class="text-[13px] text-text-2 tabular-nums min-w-12.5 text-center">
						{formatHours(dayLen)}
					</div>
					<div class="text-[12px] text-text-3 w-1.5 text-center select-none">·</div>
					<Button size="sm" outline onclick={startNow} class="min-h-32">
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
			{#if settingsService.showTimeline && taskService.tasks.length > 0}
				<div class="bg-bg-elev border border-border rounded-main p-3.5 mb-4">
					<Timeline tasks={taskService.tasks} {dayLen} {dayStart} />
				</div>
			{/if}
		</div>
		<div>
			<div class="mb-3.5"><Settings /></div>
			<div class="mb-3.5">
				<TaskList
					{isToday}
					{activeIndex}
					{activeProgress}
					{dayStart}
					{dayLen}
					stepMinutes={settingsService.snapSize}
					{handleOnEdit}
				/>
			</div>
		</div>
	</div>
{/snippet}

<Tabs bind:activeTab={activeView}>
	<Header
		currentTime={currentDateTime}
		{total}
		{dayLen}
		{remaining}
		{over}
		{perfect}
		onHelpClick={() => (helpModalOpen = true)}
	>
		{#snippet tabList()}
			<TabList>
				<Tab id="today" onclick={goToToday}>Today</Tab>
				{#if !isToday}
					<Tab id="custom-day">{dayLabel}</Tab>
				{/if}
				<Tab id="week">Week</Tab>
			</TabList>
		{/snippet}
	</Header>

	<TabPanel id="today">
		{@render dayLayoutContent()}
	</TabPanel>

	<TabPanel id="custom-day">
		{@render dayLayoutContent()}
	</TabPanel>
	<TabPanel id="week">
		<WeekView
			{activeDate}
			{todayTasks}
			snapSize={settingsService.snapSize}
			onDateSelect={switchDate}
		/>
	</TabPanel>
</Tabs>

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

<Modal bind:isOpen={editModalOpen}>
	{#snippet header()}
		<h2 class="text-[20px] font-semibold tracking-[-0.02em]">Edit task</h2>
	{/snippet}
	{#if editTask}
		<Input class="mb-5" label="Name" name="Name" bind:value={editTask.name} placeholder="Name" />
		<div class="mb-6">
			<ColorPicker bind:selectedColor={editTask.color} />
		</div>
		<Accordion class="mb-6">
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
							><rect x="3" y="4" width="18" height="18" rx="2" /><line
								x1="16"
								y1="2"
								x2="16"
								y2="6"
							/><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg
						>
						Schedule for another day
					</span><svg
						class="transition-transform duration-200"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						style="transform: {isOpen ? 'rotate(180deg)' : 'none'};"
						><polyline points="6 9 12 15 18 9" /></svg
					></Button
				>
			{/snippet}
			{#snippet content()}
				<div class="mt-2 p-3.5 bg-bg-elev border border-border rounded-main">
					<div
						class="label font-mono text-[11px] text-text-3 mb-2 font-medium tacking-[0.06em] uppercase"
					>
						Target date
					</div>
					<Input
						bind:value={scheduleDate}
						onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && saveEditModal()}
						class="mb-3 font-mono [html[data-theme='light']_&]:scheme-light
         				[html[data-theme='dark']_&]:scheme-dark"
						type="date"
						min={getTomorrowDateISO()}
					/>
					<div class="text-[12px] text-text-3 mb-3 leading-[1.6]">
						Moves the task to <span
							class="font-medium"
							style:color={editTask?.color || 'transparent'}
							>{formatDateToUltraShortLabel(scheduleDate)}</span
						> with its current time and color.
					</div>
					<Button class="w-full" color="accent" onclick={onSchedule}>
						Move to {formatDateToUltraShortLabel(scheduleDate)}
					</Button>
				</div>
			{/snippet}
		</Accordion>
		<div class="w-full">
			<Button onclick={saveEditModal} class="w-full" color="accent">Save changes</Button>
			<div style="height: env(safe-area-inset-bottom,0px);"></div>
		</div>
	{:else}
		<span class="text-center">No task to edit</span>
	{/if}
</Modal>

<ToastList />
