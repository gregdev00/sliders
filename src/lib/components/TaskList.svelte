<script lang="ts">
	import Button from './Button.svelte';
	import Input from './Input.svelte';
	import TaskItem from './TaskItem.svelte';

	let taskName = $state('');
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
	<TaskItem name="Sleep" />
</div>
<div class="relative flex gap-2 mb-6">
	<Input bind:value={taskName} placeholder="Add a task..." />
	<Button color="danger" onclick={() => {}}>Add</Button>
</div>
