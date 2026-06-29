<script lang="ts">
	import type { Task } from '$lib/types/task';
	import { formatHours } from '$lib/utils/formatUtils';
	import Button from './Button.svelte';
	import TimeSlider from './TimeSlider.svelte';

	interface Props {
		task: Task;
		snapSize: number;
		onHoursChange: (hour: number) => void;
		onDelete: (id: string) => void;
	}

	let { task, snapSize, onHoursChange, onDelete }: Props = $props();
</script>

<div class="mb-2">
	<div class="flex items-center gap-2 mb-1.25">
		<div class="size-2 rounded-full shrink-0" style:background={task.color}></div>
		<span class="text-[13px] text-text flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
			>{task.name}</span
		>
		<span class="font-mono text-[11px] font-medium shrink-0 tabular-nums" style:color={task.color}
			>{formatHours(task.hours)}</span
		>
		<Button onclick={() => onDelete(task.id)} iconOnly outline size="sm"
			><svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg
			></Button
		>
	</div>
	<TimeSlider
		color={task.color}
		value={task.hours}
		max={Math.max(task.hours, 12)}
		step={snapSize}
		locked={false}
		onChange={onHoursChange}
	/>
</div>
