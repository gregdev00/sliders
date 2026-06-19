import type { HexColor } from './hexColor';

export interface Task {
	id?: number;
	name: string;
	hours: number;
	originalHours: number;
	color: HexColor;
	locked: boolean;
	actual: number;
}
