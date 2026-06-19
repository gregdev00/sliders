import type { Task } from '$lib/types/task';
import { PALETTE } from '$lib/constants/colors';
import { DEFAULT_TASKS } from '$lib/constants/defaultTasks';

class TaskService {
	async init() {
		this.#tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
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
