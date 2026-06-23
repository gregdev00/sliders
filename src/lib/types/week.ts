import type { Task } from './task';

export interface WeekDay {
	/** The day index (0 for Monday through 6 for Sunday) */
	dayIndex: number;
	/** List of tasks assigned to this specific day */
	tasks: Task[];
	/** Optional or empty daily note/memo */
	note: string;
}

/**
 * A full 7-day schedule containing WeekDay objects.
 */
export type Week = WeekDay[];
