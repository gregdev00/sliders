import type { Task } from './task';

export interface Day {
	tasks: Task[];
	// TODO: maybe just the taskId is enough?
	favourites: Task[];
	stepSize: number;
	dayStart: number;
	dayEnd: number;
}
