import type { Step } from '$lib/types/step';

export const STEPS: Step[] = [
	{ label: '5m', minute: 5 },
	{ label: '10m', minute: 10 },
	{ label: '15m', minute: 15 },
	{ label: '30m', minute: 30 }
] as const;
