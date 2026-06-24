<script lang="ts">
	import { DAYS_SHORT } from '$lib/constants/days';
	import { MONTH_NAMES } from '$lib/constants/months';
	import type { ISODateString } from '$lib/types/isoDateString';
	import { getTodayDateISO } from '$lib/utils/formatUtils';
	import Button from './Button.svelte';
	import { syncService } from '$lib/services/SyncService.svelte';

	interface Props {
		activeDate: ISODateString;
		onDateSelect?: (dateString: string) => void;
	}

	let { activeDate, onDateSelect }: Props = $props();

	const currentDateTime = new Date();

	const today = getTodayDateISO();

	let viewYear = $state(currentDateTime.getFullYear());
	let viewMonth = $state(currentDateTime.getMonth());

	const daysInMonth = $derived(new Date(viewYear, viewMonth + 1, 0).getDate());
	const startDow = $derived.by(() => {
		const firstDay = new Date(viewYear, viewMonth, 1);
		const dow = firstDay.getDay() - 1; // Adjust for Monday start
		return dow < 0 ? 6 : dow;
	});

	const days = $derived.by(() => {
		const list: (number | null)[] = [];

		// Pad previous month's empty days
		for (let i = 0; i < startDow; i++) {
			list.push(null);
		}

		// Fill current month's days
		for (let d = 1; d <= daysInMonth; d++) {
			list.push(d);
		}

		// Pad next month's empty days to complete the week row
		while (list.length % 7 !== 0) {
			list.push(null);
		}

		return list;
	});

	function previousMonth() {
		if (viewMonth === 0) {
			viewYear -= 1;
			viewMonth = 11;
		} else {
			viewMonth -= 1;
		}
	}

	function nextMonth() {
		if (viewMonth === 11) {
			viewYear += 1;
			viewMonth = 0;
		} else {
			viewMonth += 1;
		}
	}

	function getDayString(day: number): ISODateString {
		return `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
	}
</script>

<div class="p-4">
	<div class="flex items-center justify-between mb-4">
		<Button onclick={previousMonth} iconOnly outline aria-label="Previous month"
			><svg
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"><polyline points="15 18 9 12 15 6" /></svg
			></Button
		>
		<div class="text-[18px] font-semibold tracking-[-0.02em]">
			{MONTH_NAMES[viewMonth]}
			{viewYear}
		</div>
		<Button onclick={nextMonth} iconOnly outline aria-label="Next month"
			><svg
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"><polyline points="9 18 15 12 9 6" /></svg
			></Button
		>
	</div>
	<div class="grid grid-cols-7 gap-1 mb-1.5">
		{#each DAYS_SHORT as day}
			<div class="text-center font-mono text-[10px] text-text-4 tracking-[0.04em] px-0 py-1">
				{day}
			</div>
		{/each}
	</div>
	<div class="grid grid-cols-7 gap-1">
		{#each days as day, idx (day ? getDayString(day) : `empty-${idx}`)}
			{#if !day}
				<div style="min-height: 54px;"></div>
			{:else}
				{@const ds = getDayString(day)}
				{@const dayTasks = syncService.getDatesWithTasks()[ds] || []}
				{@const isToday = ds === today}
				{@const isActive = ds === activeDate}
				{@const hasTasks = dayTasks.length > 0}
				{@const isPast = ds < today}

				<button
					onclick={() => onDateSelect?.(ds)}
					class="flex flex-col items-center gap-1 min-h-13.5 transition-all duration-150 rounded-[10px] px-1 py-1.5 cursor-pointer"
					style:background={isActive
						? 'color-mix(in oklab, var(--accent) 25%, transparent)'
						: isToday
							? 'color-mix(in oklab, var(--accent) 12%, transparent)'
							: hasTasks
								? 'var(--bg-elev-2)'
								: 'transparent'}
					style:border={`1px solid ${isActive ? 'var(--accent)' : isToday ? 'color-mix(in oklab, var(--accent) 50%, transparent)' : hasTasks ? 'var(--border)' : 'transparent'}`}
					style:opacity={isPast && !hasTasks && !isToday ? 0.4 : 1}
				>
					<span
						class="tabular-nums text-[13px] transition-colors"
						class:text-[var(--accent)]={isActive || isToday}
						class:font-semibold={isActive || isToday}
						class:text-[var(--text)]={!isActive && !isToday && hasTasks}
						class:text-[var(--text-3)]={!isActive && !isToday && !hasTasks}
						class:font-normal={!isActive && !isToday}
					>
						{day}
					</span>

					<div class="flex justify-center gap-0.5 min-h-2 flex-wrap">
						{#each dayTasks.slice(0, 4) as task (task.id)}
							<div class="size-1.25 rounded-full" style:background={task.color}></div>
						{/each}

						{#if dayTasks.length > 4}
							<span class="text-[8px] text-text-4 font-mono leading-1.5"
								>+{dayTasks.length - 4}</span
							>
						{/if}
					</div>
				</button>
			{/if}
		{/each}
	</div>
</div>
