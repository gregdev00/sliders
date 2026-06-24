import type { Task } from './task';

export interface Day {
	tasks: Task[];
	// TODO: maybe just the taskId is enough?
	favourites: Task[];
	dayStart: number;
	dayEnd: number;
}
