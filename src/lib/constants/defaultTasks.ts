import type { Task } from '$lib/types/task';
import { PALETTE } from '$lib/constants/colors';

export const DEFAULT_TASKS: Task[] = [
	{
		id: '1',
		name: 'Sleep',
		hours: 8,
		originalHours: 8,
		color: PALETTE.lime,
		locked: false,
		actual: 0
	},
	{
		id: '2',
		name: 'Deep work',
		hours: 4,
		originalHours: 4,
		color: PALETTE.coral,
		locked: false,
		actual: 0
	},
	{
		id: '3',
		name: 'Movement',
		hours: 1,
		originalHours: 1,
		color: PALETTE.tiffanyBlue,
		locked: false,
		actual: 0
	}
] as const;
