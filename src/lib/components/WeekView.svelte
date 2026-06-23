<script lang="ts">
	import Tabs from './Tabs.svelte';
	import TabList from './TabList.svelte';
	import Tab from './Tab.svelte';
	import TabPanel from './TabPanel.svelte';
	import { weekTotalHours } from '$lib/utils/dateUtils';
	import type { Week } from '$lib/types/week';
	import { syncService } from '$lib/services/SyncService.svelte';
	import { formatHours } from '$lib/utils/formatUtils';

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
			</div>
		</div>
	</TabPanel>
</Tabs>
