import type { Task } from '$lib/types/task';
import { PALETTE } from '$lib/constants/colors';
import { DEFAULT_TASKS } from '$lib/constants/defaultTasks';
import type { PaletteColor } from '$lib/types/paletteColor';
import type { HexColor } from '$lib/types/hexColor';
import { toastService } from './ToastService.svelte';

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
		const normalizedInputName = normalizeName(trimmedName);

		// Check if a task with this exact name already exists in the active list
		const nameExists = this.#tasks.some((t) => normalizeName(t.name) === normalizedInputName);

		if (nameExists) {
			toastService.showToast(`Task "${trimmedName}" already exists!`, 'error');
			return false;
		}

		// Find if this task is a favorite/pre-existing task (fav)
		const fav = this.#favourites.find((f) => normalizeName(f.name) === normalizeName(trimmedName));

		// Calculate remaining hours left in the day (rem)
		const usedHours = this.#tasks.reduce((sum, t) => sum + (t.hours || 0), 0);
		const rem = Math.max(0, dl - usedHours);

		// Checks passed hours -> fallback to favorite hours -> fallback to 1 grid step size
		const defaultFallback = this.#snapToStep(Math.min(stepHours, rem), stepMinutes);
		const preferredHours = hoursParam ?? fav?.hours ?? defaultFallback;

		// Clamp it so it doesn't overshoot remaining time, or defaults to step size if day is full
		const h = Math.max(0, Math.min(preferredHours, rem || stepHours));

		// Resolve fallback color
		const paletteArray: PaletteColor[] = Array.isArray(PALETTE) ? PALETTE : Object.values(PALETTE);
		const fallbackColor: HexColor = paletteArray[this.#tasks.length % paletteArray.length].color;
		const resolvedColor = colorParam || fav?.color || fallbackColor;

		const newTask: Task = {
			id: String(Date.now() + Math.random()),
			name: trimmedName,
			hours: h,
			originalHours: h,
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

	scaleToDayLen(newDayLen: number, oldDayLen: number): void {
		const expanding = newDayLen > oldDayLen;

		const base = expanding
			? this.#tasks.map((t) => ({ ...t, hours: t.originalHours ?? t.hours }))
			: this.#tasks;

		const total = base.reduce((sum, t) => sum + t.hours, 0);
		if (total === 0) return;

		const scale = newDayLen / total;
		this.#tasks = base.map((t) => ({ ...t, hours: t.hours * scale }));
	}
}

export const taskService = new TaskService();
