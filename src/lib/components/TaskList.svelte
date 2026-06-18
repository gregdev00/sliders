<script lang="ts">
	import Button from './Button.svelte';
	import Input from './Input.svelte';
	import TaskItem from './TaskItem.svelte';

	let taskName = $state('');

	const PALETTE = [
		'#ff7a5c',
		'#5dd6c5',
		'#ffd166',
		'#a78bfa',
		'#06b6d4',
		'#f472b6',
		'#84cc16',
		'#fb923c',
		'#60a5fa',
		'#c084fc',
		'#34d399',
		'#fbbf24',
		'#f87171'
	];

	const DEFAULT_TASKS = [
		{
			id: 1,
			name: 'Sleep',
			hours: 8,
			originalHours: 8,
			color: PALETTE[6],
			locked: false,
			actual: 0
		},
		{
			id: 2,
			name: 'Deep work',
			hours: 4,
			originalHours: 4,
			color: PALETTE[0],
			locked: false,
			actual: 0
		},
		{
			id: 3,
			name: 'Movement',
			hours: 1,
			originalHours: 1,
			color: PALETTE[1],
			locked: false,
			actual: 0
		}
	];
</script>

<div class="flex items-center justify-between mb-2.5">
	<div class="font-mono text-[11px] text-text-3 uppercase -tracking[0.06em] font-medium">Tasks</div>
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
</div>
<div class="opacity-100 transition-opacity duration-200">
	{#each DEFAULT_TASKS as task}
		<TaskItem
			id={task.id}
			name={task.name}
			hours={task.hours}
			originalHours={task.originalHours}
			color={task.color}
			locked={task.locked}
			actual={task.actual}
		/>
	{/each}
</div>
<div class="relative flex gap-2 mb-6">
	<Input bind:value={taskName} name="taskName" placeholder="Add a task..." />
	<Button color="danger" onclick={() => {}}>Add</Button>
</div>
