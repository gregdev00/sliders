import type { HexColor } from './hexColor';

export interface Task {
	id: string;
	name: string;
	hours: number;
	originalHours: number;
	color: HexColor;
	locked: boolean;
	actual: number;
}
