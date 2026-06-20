/**
 * Formats a decimal hour value into a clean, compact string representation.
 * @example
 * formatHours(0.5)  => "30m"
 * formatHours(2.0)  => "2h"
 * formatHours(2.25) => "2h 15m"
 */
export function formatHours(hours: number): string {
	const totalMinutes = Math.round(hours * 60);
	const hh = Math.floor(totalMinutes / 60);
	const mm = totalMinutes % 60;

	if (hh === 0) return `${mm}m`;
	if (mm === 0) return `${hh}h`;
	return `${hh}h ${mm}m`;
}

/**
 * Formats a decimal hour into a standardized 24-hour time clock string (HH:MM).
 * Safely handles negative hours or values exceeding 24 via a modulo operation.
 * @example
 * formatTime(2)    => "02:00"
 * formatTime(14.5) => "14:30"
 * formatTime(-1)   => "23:00"
 */
export function formatTime(hours: number): string {
	const totalMinutes = Math.round((((hours % 24) + 24) % 24) * 60);
	const hh = Math.floor(totalMinutes / 60) % 24;
	const mm = totalMinutes % 60;

	return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}
