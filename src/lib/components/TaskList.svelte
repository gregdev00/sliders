<script lang="ts">
	import { taskService } from '$lib/services/TaskService.svelte';
	import type { Task } from '$lib/types/task';
	import Button from './Button.svelte';
	import Input from './Input.svelte';
	import TaskItem from './TaskItem.svelte';

	import { flip } from 'svelte/animate';
	import { fade, slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { updated } from '$app/state';

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

	function handleOnKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') handleTaskAdd();
	}

	function handleOnChange(updatedFields) {
		console.log(updatedFields);
	}

	function handleOnLock(id: string) {}

	function handleOnFavourite(id: string) {}

	interface Props {
		dayStart: number;
		dayLen: number;
		stepMinutes: number;
		progress: number;
		handleOnEdit: (task: Task) => void;
	}

	let { dayStart, dayLen, stepMinutes, progress, handleOnEdit }: Props = $props();

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
			<Button class="text-text-3" outline size="sm"
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
	<div class="opacity-100 transition-opacity duration-200">
		{#each tasksWithStartTimes as item (item.id)}
			<div
				animate:flip={{ duration: 200, easing: cubicOut }}
				transition:slide={{ duration: 150, easing: cubicOut }}
			>
				<TaskItem
					task={item}
					taskStart={item.taskStart}
					{stepMinutes}
					{dayLen}
					{progress}
					onFavourite={(id) => handleOnFavourite(id)}
					onEdit={(task) => handleOnEdit(task)}
					onLock={(id) => handleOnLock(id)}
					onChange={(updatedFields) => handleOnChange(updatedFields)}
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
<div class="relative flex gap-2 mb-6">
	<Input
		bind:value={taskName}
		onkeydown={handleOnKeyDown}
		name="taskName"
		placeholder="Add a task..."
	/>
	<Button color="danger" onclick={handleTaskAdd}>Add</Button>
</div>
