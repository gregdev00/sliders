import type { Task } from '$lib/types/task';
import { PALETTE } from '$lib/constants/colors';

class TaskService {
	readonly DEFAULT_TASKS: Task[] = [
		{
			id: 1,
			name: 'Sleep',
			hours: 8,
			originalHours: 8,
			color: PALETTE.lime,
			locked: false,
			actual: 0
		},
		{
			id: 2,
			name: 'Deep work',
			hours: 4,
			originalHours: 4,
			color: PALETTE.coral,
			locked: false,
			actual: 0
		},
		{
			id: 3,
			name: 'Movement',
			hours: 1,
			originalHours: 1,
			color: PALETTE.tiffanyBlue,
			locked: false,
			actual: 0
		}
	];

	async init() {
		this.#tasks = JSON.parse(JSON.stringify(this.DEFAULT_TASKS));
	}

	#tasks: Task[] = $state([]);

	get tasks() {
		return this.#tasks;
	}

	addTask(name: string) {
		const colorValues = Object.values(PALETTE);
		const color = colorValues[this.#tasks.length % colorValues.length];

		const task: Task = {
			id: Date.now() + Math.random(),
			name: name.trim(),
			hours: 1,
			originalHours: 1,
			color: color,
			locked: false,
			actual: 0
		};

		this.#tasks.push(task);
	}

	removeTask(id: number) {
		this.#tasks = this.#tasks.filter((task) => task.id !== id);
	}
}

export const taskService = new TaskService();
