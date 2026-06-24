<script lang="ts">
	import type { Task } from '$lib/types/task';

	interface Props {
		tasks: Task[];
		dayLen: number;
		dayStart: number;
	}

	let { tasks, dayLen, dayStart }: Props = $props();

	const segments = $derived.by(() => {
		let cursor = 0;

		return tasks
			.filter((task: Task) => task.hours > 0.02)
			.map((task: Task) => {
				const startTime = cursor;
				cursor += task.hours;
				return { ...task, start: startTime };
			});
	});

	const ticks = [0, 0.25, 0.5, 0.75, 1].map(
		(fraction) => Math.round((dayStart + fraction * dayLen) * 2) / 2
	);
</script>

<div class="flex relative h-8 rounded-[8px] overflow-hidden mb-2 bg-bg-track">
	{#each segments as segment}
		{@const w = (segment.hours / dayLen) * 100}
		<div
			class="flex h-full items-center justify-start overflow-hidden border-r border-bg-elev"
			title={`${segment.name} · ${segment.hours}h`}
			style:width="{w}%;"
			style:background={segment.color}
		>
			{#if w > 10}
				<span
					class="px-2 text-[11px] font-semibold text-black/70 whitespace-nowrap overflow-hidden text-ellipsis"
				>
					{segment.name}
				</span>
			{/if}
		</div>
	{/each}
</div>
<div class="flex justify-between font-mono text-[10px] text-text-4">
	{#each ticks as tick}
		<span class="tabular-nums"
			>{String(Math.floor(tick)).padStart(2, '0')}:{tick % 1 ? '30' : '00'}</span
		>
	{/each}
</div>
