import type { WeekDay } from '$lib/types/week';

export function weekTotalHours(day: WeekDay): number {
	return day.tasks.reduce((sum, task) => sum + (task.hours || 0), 0);
}
