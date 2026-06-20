export const DONUT_CONFIG = {
	R: 72,
	CX: 120,
	CY: 120,
	INNER: 50
} as const;

export const DONUT_ANIMATION_CONFIG = {
	LERP: 0.22,
	/**
	 * Micro-radian threshold to stop the donut chart slice animation loop.
	 * 0.001 radians is roughly ~0.057 degrees. Once a slice gets this close
	 * to its final position, the loop stops to save CPU cycles.
	 */
	ANGULAR_SNAP_TOLERANCE: 0.001
} as const;
