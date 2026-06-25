import type { Task } from '$lib/types/task';
import { PALETTE } from '$lib/constants/colors';
import { DEFAULT_TASKS } from '$lib/constants/defaultTasks';
import type { PaletteColor } from '$lib/types/paletteColor';
import type { HexColor } from '$lib/types/hexColor';
import { toastService } from './ToastService.svelte';
import { TIME_PRECISION_CONFIG } from '$lib/constants/timePrecisionConfig';

const normalizeName = (name: string) => name.trim().toLowerCase();

class TaskService {
	async init() {
		this.#tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
	}

	#tasks: Task[] = $state([]);
	#favourites: Task[] = $state([]);

	/**
	 * Helper to snap values to grid constraints
	 */
	#snapToStep(value: number, stepMinutes: number): number {
		const stepHours = stepMinutes / 60;
		return Math.round(value / stepHours) * stepHours;
	}

	get tasks() {
		return this.#tasks;
	}

	addTask(
		name: string,
		options?: {
			hours?: number;
			color?: HexColor;
			dayLen?: number;
			stepMinutes?: number;
		}
	): boolean {
		// Extract parameters with sensible baseline defaults if not passed
		const hoursParam = options?.hours;
		const colorParam = options?.color;
		const dl = options?.dayLen ?? 24;
		const stepMinutes = options?.stepMinutes ?? 30;
		const stepHours = stepMinutes / 60;

		const trimmedName = name.trim();
		if (!trimmedName) return false; // Prevent adding empty task names

		const normalizedInputName = normalizeName(trimmedName);

		// Check if a task with this exact name already exists in the active list
		const nameExists = this.#tasks.some((t) => normalizeName(t.name) === normalizedInputName);
		if (nameExists) {
			toastService.showToast(`Task "${trimmedName}" already exists!`, 'error');
			return false;
		}

		// Find if this task is a favorite/pre-existing task (fav)
		const fav = this.#favourites.find((f) => normalizeName(f.name) === normalizedInputName);

		// Calculate remaining hours left in the day (rem)
		const usedHours = this.#tasks.reduce((sum, t) => sum + (t.hours || 0), 0);
		const rem = Math.max(0, dl - usedHours);

		// Calculate safe fallback hours snapped to the grid constraints
		const snappedStep = this.#snapToStep(Math.min(stepHours, rem), stepMinutes);
		const defaultFallback = Math.min(rem, snappedStep);

		// Resolve preferred hours hierarchy (parameter -> favorite hours -> grid fallback)
		const preferredHours = hoursParam ?? fav?.hours ?? defaultFallback;

		// Strict boundary control: If the day is full (rem === 0), hours must be 0.
		// This guarantees total task hours never exceed the allocated day length.
		const h = Math.max(0, Math.min(preferredHours, rem));

		// Resolve fallback color from palette
		const paletteArray: PaletteColor[] = Array.isArray(PALETTE) ? PALETTE : Object.values(PALETTE);
		const fallbackColor: HexColor = paletteArray[this.#tasks.length % paletteArray.length].color;
		const resolvedColor = colorParam || fav?.color || fallbackColor;

		// Construct the new task object
		const newTask: Task = {
			id: String(Date.now() + Math.random()),
			name: trimmedName,
			hours: h,
			originalHours: h, // Crucial baseline reference for scaling down the road
			color: resolvedColor,
			locked: false,
			actual: 0
		};

		this.#tasks.push(newTask);
		return true;
	}

	updateTask(id: string, patch: Partial<Task>): boolean {
		const index = this.#tasks.findIndex((t) => t.id === id);
		if (index === -1) return false;

		const updatedTask = {
			...this.#tasks[index],
			...patch
		};

		if (patch.hours !== undefined) {
			updatedTask.originalHours = patch.hours;
		}

		this.#tasks[index] = updatedTask;
		return true;
	}

	removeTask(id: string) {
		this.#tasks = this.#tasks.filter((task) => task.id !== id);
	}

	distributeTasks(dayLen: number, stepMinutes: number): boolean {
		// Filter out locked tasks
		const unlockedTasks = this.#tasks.filter((task) => !task.locked);
		if (!unlockedTasks.length) return false;

		// Sum up hours consumed by locked tasks
		const lockedHours = this.#tasks
			.filter((task) => task.locked)
			.reduce((sum, task) => sum + task.hours, 0);

		// Calculate remaining available hours to split among unlocked tasks
		const availableHours = Math.max(0, dayLen - lockedHours);

		// Calculate the raw split and snap it to step configurations
		const rawSplit = availableHours / unlockedTasks.length;
		const snappedHours = this.#snapToStep(rawSplit, stepMinutes);

		// Mutate the unlocked tasks directly in place
		for (const task of unlockedTasks) {
			task.hours = snappedHours;
			task.originalHours = snappedHours;
		}

		return true;
	}

	scaleToDayLen(newDayLen: number, oldDayLen: number): void {
		const expanding = newDayLen > oldDayLen;

		const base = expanding
			? this.#tasks.map((t) => ({ ...t, hours: t.originalHours ?? t.hours }))
			: this.#tasks;

		const total = base.reduce((sum, t) => sum + t.hours, 0);
		if (total === 0) return;

		if (newDayLen >= total - TIME_PRECISION_CONFIG.HOUR_MATCH_TOLERANCE) {
			this.#tasks = base;
			return;
		}

		const tMin = Math.round(newDayLen * 60);
		let used = 0;
		this.#tasks = base.map((t, i) => {
			const mins =
				i === base.length - 1 ? Math.max(0, tMin - used) : Math.round((t.hours / total) * tMin);
			used += mins;
			return { ...t, hours: Math.max(0, mins / 60) };
		});
	}
}

export const taskService = new TaskService();
