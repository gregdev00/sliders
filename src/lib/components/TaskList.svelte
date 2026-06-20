<script lang="ts">
	import { taskService } from '$lib/services/TaskService.svelte';
	import Button from './Button.svelte';
	import Input from './Input.svelte';
	import TaskItem from './TaskItem.svelte';

	let taskName = $state('');

	function handleTaskAdd(): void {
		if (taskName && taskName.trim() !== '') {
			taskService.addTask(taskName);
			taskName = '';
		}
	}

	function handleOnKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') handleTaskAdd();
	}

	interface Props {
		taskStart: number;
		dayLen: number;
		stepMinutes: number;
	}

	let { taskStart, dayLen, stepMinutes }: Props = $props();
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
		{#each taskService.tasks as task (task.id)}
			<TaskItem
				{...task}
				{taskStart}
				{stepMinutes}
				{dayLen}
				onDelete={(id: string) => taskService.removeTask(id)}
			/>
		{:else}
			<div class="text-center py-10 px-5 border border-dashed border-border rounded-main">
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
