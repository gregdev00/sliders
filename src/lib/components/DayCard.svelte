<script lang="ts">
	import { DAYS } from '$lib/constants/days';
	import type { Task } from '$lib/types/task';
	import type { WeekDay } from '$lib/types/week';
	import { weekTotalHours } from '$lib/utils/dateUtils';
	import { formatHours } from '$lib/utils/formatUtils';
	import Accordion from './Accordion.svelte';
	import Button from './Button.svelte';
	import Input from './Input.svelte';
	import WeekTaskRow from './WeekTaskRow.svelte';

	interface Props {
		dayData: WeekDay;
		dayIndex: number;
		snapSize: number;
		todayTasks: Task[];
		isToday: boolean;
		onUpdate: (patch) => void;
	}

	let { dayData, dayIndex, snapSize, todayTasks, isToday = false, onUpdate }: Props = $props();

	const total = $derived(weekTotalHours(dayData));
	const taskCount = $derived(dayData.tasks.length);
	const hasNote = $derived(dayData.note && dayData.note.trim().length > 0);

	const segments = $derived(dayData.tasks.filter((task) => task.hours > 0));
	const segmentsTotal = $derived(segments.reduce((sum, task) => sum + task.hours, 0));
</script>

<div
	class="bg-bg-elev border border-border rounded-main overflow-hidden transition-colors duration-200"
	class:border-border={!isToday}
	class:border-accent={isToday}
>
	<Accordion>
		{#snippet header({ toggle, isOpen })}
			<button
				onclick={toggle}
				class="flex w-full bg-transparent border-none px-4 py-3.5 items-center gap-3.5 cursor-pointer text-left min-h-15"
			>
				<div class="shrink-0 w-20">
					<div
						class="text-[14px] font-semibold tracking-[-0.01em]"
						class:text-accent={isToday}
						class:text-text={!isToday}
					>
						{DAYS[dayIndex]}
					</div>
					{#if isToday}
						<div class="text-[10px] text-accent font-mono tracking-[0.08em] mt-0.5 uppercase">
							Today
						</div>
					{/if}
				</div>
				<div class="relative flex-1 h-1.5 rounded-[3px] bg-bg-track overflow-hidden">
					{#if segmentsTotal > 0}
						{#each segments as task, i (task.id)}
							{@const previousSegments = segments.slice(0, i)}
							{@const leftHours = previousSegments.reduce((sum, x) => sum + x.hours, 0)}
							{@const leftPercent = (leftHours / segmentsTotal) * 100}
							{@const widthPercent = (task.hours / segmentsTotal) * 100}

							<div
								style:left="{leftPercent}%"
								style:width="{widthPercent}%"
								style:background={task.color}
								class="absolute top-0 bottom-0"
							></div>
						{/each}
					{/if}
				</div>
				<div class="shrink-0 text-right min-w-15">
					{#if total > 0}
						<div class="tabular-nums text-[13px] font-semibold text-accent">
							{formatHours(total)}
						</div>
					{:else}
						<div class="text-[13px] text-text-4">—</div>
					{/if}
					{#if taskCount > 0}
						<div class="font-mono text-[10px] text-text-3">
							{taskCount} task{taskCount > 1 ? 's' : ''}
						</div>
					{/if}
				</div>
				{#if hasNote}
					<div class="shrink-0 text-text-3">
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							><path
								d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
							/></svg
						>
					</div>
				{/if}
				<svg
					class="shrink-0 text-text-3 transition-transform duration-200"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					style="transform: {isOpen ? 'rotate(180deg)' : 'none'};"
				>
					<polyline points="6 9 12 15 18 9" />
				</svg>
			</button>
		{/snippet}
		{#snippet content()}
			<div class="border-t border-border px-4 py-3.5 animate-fadeUp">
				{#if taskCount > 0}
					<div class="mb-3">
						{#each dayData.tasks as task (task.id)}
							<WeekTaskRow {task} {snapSize} />
						{/each}
					</div>
				{/if}
				<div class="flex gap-2 mb-2.5">
					<Input class="min-h-10.5 text-[14px]" placeholder="Add a task..." />
					<Button color="accent">Add</Button>
				</div>
				<div class="flex gap-1.5 flex-wrap mb-2.5">
					{#if todayTasks.length > 0}
						<Button>Copy from today</Button>
					{/if}
					{#if taskCount > 0}
						<Button>Clear all</Button>
					{/if}
				</div>
				<textarea
					class="w-full bg-bg-input border border-border rounded-sm text-text tracking-[-0.01em] px-3.5 py-2.5 text-[13px] leading-normal min-h-15 resize-none transition-[border-color_0.15s_ease] outline-none focus:border-accent"
					bind:value={dayData.note}
					rows="2"
					placeholder="Note for the day..."></textarea>
			</div>
		{/snippet}
	</Accordion>
</div>
