<script lang="ts">
	import Tabs from './Tabs.svelte';
	import TabList from './TabList.svelte';
	import Tab from './Tab.svelte';
	import TabPanel from './TabPanel.svelte';
	import { weekTotalHours } from '$lib/utils/dateUtils';
	import type { Week } from '$lib/types/week';
	import { syncService } from '$lib/services/SyncService.svelte';
	import { formatHours } from '$lib/utils/formatUtils';
	import DayCard from './DayCard.svelte';
	import type { Task } from '$lib/types/task';

	interface Props {
		todayTasks: Task[];
		snapSize: number;
	}

	let { todayTasks, snapSize }: Props = $props();

	let week: Week = $state(syncService.loadWeek());
	const todayDowRaw = new Date().getDay();
	const todayDow = todayDowRaw === 0 ? 6 : todayDowRaw - 1;
	const weekTotal = week.reduce((sum, weekday) => sum + weekTotalHours(weekday), 0);
	const filledDays = week.filter((weekday) => weekday.tasks.length > 0).length;
</script>

<Tabs defaultTab="week">
	<TabList>
		<Tab id="week">Week</Tab>
		<Tab id="month">Month</Tab>
	</TabList>

	<TabPanel id="week">
		<div class="p-4">
			<div
				class="flex px-4 py-3.5 bg-bg-elev border border-border rounded-main items-center gap-3.5 mb-3.5"
			>
				<div>
					<div
						class="tabular-nums text-[22px] font-semibold text-accent leading-none tracking-[-0.02em]"
					>
						{formatHours(weekTotal)}
					</div>
					<div class="font-mono mt-0.75 text-[10px] text-text-3 tracking-[0.06em] uppercase">
						Week
					</div>
				</div>
				<div class="flex-1 h-2 rounded-[4px] overflow-hidden flex bg-bg-track">
					{#each week as weekday, i (weekday.dayIndex)}
						{@const totalHours = weekTotalHours(weekday)}
						{@const width = weekTotal > 0 ? (totalHours / weekTotal) * 100 : 100 / 7}
						{@const color = weekday.tasks[0]?.color || 'var(--bg-track)'}
						<div
							style:width="{width}%"
							style:background={totalHours > 0 ? color : 'var(--bg-track)'}
							style:border-right={i < 6 ? '1px solid var(--bg-elev)' : 'none'}
							style:opacity={totalHours > 0 ? 1 : 0.3}
							class="h-full"
						></div>
					{/each}
				</div>
				<div class="text-right">
					<div class="tabular-nums text-[14px] font-semibold">
						{filledDays}
						<span class="text-text-4 font-normal">/7</span>
					</div>
					<div class="text-[10px] text-text-3 font-mono tracking-[0.06em] uppercase">Days</div>
				</div>
			</div>
			<div class="flex flex-col gap-2">
				{#each week as weekday (weekday.dayIndex)}
					<DayCard
						dayData={weekday}
						dayIndex={weekday.dayIndex}
						{todayTasks}
						{snapSize}
						isToday={weekday.dayIndex === todayDow}
					/>
				{/each}
			</div>
		</div>
	</TabPanel>
</Tabs>
