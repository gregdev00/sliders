<script lang="ts">
	import { taskService } from '$lib/services/TaskService.svelte';
	import type { Task } from '$lib/types/task';
	import Button from './Button.svelte';
	import Input from './Input.svelte';
	import TaskItem from './TaskItem.svelte';

	import { flip } from 'svelte/animate';
	import { fade, slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { toastService } from '$lib/services/ToastService.svelte';

	let taskName = $state('');

	function handleTaskAdd(): void {
		if (!taskName && taskName.trim() === '') {
			return;
		}

		const success = taskService.addTask(taskName, { dayLen, stepMinutes });

		if (success) {
			taskName = '';
		}
	}

	function handleDistribute(): void {
		taskService.distributeTasks(dayLen, stepMinutes);
		toastService.showToast('Distributed evenly');
	}

	function handleOnKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') handleTaskAdd();
	}

	function handleOnChange(id: string, updatedFields: Partial<Task>) {
		taskService.updateTask(id, updatedFields);
	}

	function handleOnLock(id: string, updatedFields: Partial<Task>) {
		taskService.updateTask(id, updatedFields);
	}

	function handleOnFavourite(id: string) {}

	function startLongPress(index: number, e: PointerEvent) {
		const cx = e.clientX;
		const cy = e.clientY;

		if (longPressTimer) clearTimeout(longPressTimer);

		longPressTimer = setTimeout(() => {
			try {
				navigator.vibrate?.([10, 30, 10]);
			} catch {}

			longDragIdx = index;
			dragPos = { x: cx, y: cy };

			bindDragListeners();
		}, LONG_PRESS_MS);
	}

	function cancelLongPress() {
		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
	}

	function bindDragListeners() {
		document.body.style.overflow = 'hidden';

		const preventScroll = (e: TouchEvent) => {
			if (e.cancelable) e.preventDefault();
		};
		window.addEventListener('touchmove', preventScroll, { passive: false });

		function onMove(e: PointerEvent) {
			dragPos = { x: e.clientX, y: e.clientY };

			if (!taskListEl) return;
			const cards = taskListEl.querySelectorAll<HTMLElement>('[data-taskcard]');
			let found: number | null = null;

			for (let i = 0; i < cards.length; i++) {
				const r = cards[i].getBoundingClientRect();
				if (e.clientY >= r.top && e.clientY <= r.bottom) {
					found = i;
					break;
				}
			}
			dragOver = found !== null && found !== longDragIdx ? found : null;
		}

		function onUp() {
			if (dragOver !== null && longDragIdx !== null && dragOver !== longDragIdx) {
				taskService.reorderTask(longDragIdx, dragOver);
			}
			longDragIdx = null;
			dragOver = null;
			document.body.style.overflow = '';

			window.removeEventListener('touchmove', preventScroll);
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
		}

		window.addEventListener('pointermove', onMove, { passive: true });
		window.addEventListener('pointerup', onUp);
	}

	interface Props {
		isToday: boolean;
		activeIndex: number;
		activeProgress: number;
		dayStart: number;
		dayLen: number;
		stepMinutes: number;
		handleOnEdit: (task: Task) => void;
	}

	let { isToday, activeIndex, activeProgress, dayStart, dayLen, stepMinutes, handleOnEdit }: Props =
		$props();

	const LONG_PRESS_MS = 300;

	let longDragIdx = $state<number | null>(null);
	let dragOver = $state<number | null>(null);
	let dragPos = $state({ x: 0, y: 0 });
	let taskListEl = $state<HTMLElement | null>(null);
	let longPressTimer: ReturnType<typeof setTimeout> | null = null;

	const tasksWithStartTimes = $derived.by(() => {
		let currentAccumulator = dayStart;

		return taskService.tasks.map((task) => {
			const taskStart = currentAccumulator;
			currentAccumulator += task.hours || 0;

			return {
				...task,
				taskStart
			};
		});
	});
</script>

<div class="mb-3.5">
	<div class="flex items-center justify-between mb-2.5">
		<div class="font-mono text-[11px] text-text-3 uppercase -tracking[0.06em] font-medium">
			Tasks
		</div>
		{#if taskService.tasks.length > 1}
			<Button onclick={handleDistribute} class="text-text-3" outline size="sm"
				><svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"
					></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"
					></path></svg
				>
				Distribute evenly
			</Button>
		{/if}
	</div>
	<div
		bind:this={taskListEl}
		class="transition-opacity duration-200"
		style:opacity={longDragIdx !== null ? 0.92 : 1}
	>
		{#each tasksWithStartTimes as item, index (item.id)}
			{@const isFloating = longDragIdx === index}
			{@const isDragTarget = dragOver === index}
			<div
				role="listitem"
				data-taskcard={index}
				onpointerdown={(e) => startLongPress(index, e)}
				onpointerup={cancelLongPress}
				onpointercancel={cancelLongPress}
				oncontextmenu={(e) => e.preventDefault()}
				style:opacity={isFloating ? 0.25 : 1}
				style:transform={isDragTarget ? 'translateY(-3px)' : isFloating ? 'scale(0.98)' : 'none'}
				style:touch-action={isFloating ? 'none' : 'pan-y'}
				style:user-select={isFloating ? 'none' : 'auto'}
				style:-webkit-user-select={isFloating ? 'none' : 'auto'}
				animate:flip={{ duration: 200, easing: cubicOut }}
				transition:slide={{ duration: 150, easing: cubicOut }}
			>
				<TaskItem
					task={item}
					taskStart={item.taskStart}
					{stepMinutes}
					{dayLen}
					isActive={isToday && activeIndex === index}
					progress={isToday && activeIndex === index ? activeProgress : undefined}
					onFavourite={(id) => handleOnFavourite(id)}
					onEdit={(task) => handleOnEdit(task)}
					onLock={(id: string, updatedFields: Partial<Task>) => handleOnLock(id, updatedFields)}
					onChange={(id: string, updatedFields: Partial<Task>) => handleOnChange(id, updatedFields)}
					onDelete={(id: string) => taskService.removeTask(id)}
				/>
			</div>
		{:else}
			<div
				in:fade={{ duration: 100, delay: 200 }}
				class="text-center py-10 px-5 border border-dashed border-border rounded-main"
			>
				<div class="text-[14px] text-text-2 mb-1.5 font-medium">No tasks yet</div>
				<div class="text-[13px] text-text-3">Add one below to start sliding</div>
			</div>
		{/each}
	</div>
</div>

<!-- Floating drag ghost -->
{#if longDragIdx !== null && taskService.tasks[longDragIdx]}
	{@const task = taskService.tasks[longDragIdx]}
	<div
		class="fixed z-300 w-70 pointer-events-none"
		style:left="{dragPos.x - 140}px"
		style:top="{dragPos.y - 28}px"
		style:filter="drop-shadow(0 12px 32px {task.color}66)"
	>
		<div
			class="flex items-center gap-2.5 px-4 py-3 bg-bg-elev border rounded-main"
			style:border-color={task.color}
			style:transform="rotate(-1deg) scale(1.04)"
		>
			<div class="w-2.5 h-2.5 rounded-full shrink-0" style:background={task.color}></div>
			<span class="text-[14px] text-text flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
				{task.name}
			</span>
			<span class="font-mono text-[12px] font-semibold tabular-nums" style:color={task.color}>
				{task.hours}h
			</span>
		</div>
	</div>
{/if}

<div class="relative flex gap-2 mb-6">
	<Input
		bind:value={taskName}
		onkeydown={handleOnKeyDown}
		name="taskName"
		placeholder="Add a task..."
	/>
	<Button color="danger" onclick={handleTaskAdd}>Add</Button>
</div>
