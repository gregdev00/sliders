import type { ISODateString } from '$lib/types/isoDateString';

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
 * Formats either a decimal hour or a native Date object into a standardized 24-hour time clock string (HH:MM).
 * Safely handles negative hours or values exceeding 24 for numeric inputs via a modulo operation.
 * * @example
 * formatTime(new Date()) => "16:45"
 * formatTime(2)         => "02:00"
 * formatTime(14.5)      => "14:30"
 * formatTime(-1)        => "23:00"
 */
export function formatTime(input: number | Date): string {
	// If a Date object is passed in
	if (input instanceof Date) {
		const hh = String(input.getHours()).padStart(2, '0');
		const mm = String(input.getMinutes()).padStart(2, '0');
		return `${hh}:${mm}`;
	}

	// Fallback to original decimal hour math logic
	const totalMinutes = Math.round((((input % 24) + 24) % 24) * 60);
	const hh = Math.floor(totalMinutes / 60) % 24;
	const mm = totalMinutes % 60;

	return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/**
 * Formats a native Date object, a timestamp, or a valid date string into a standardized date string (YYYY-MM-DD).
 * Safely parses string or numeric inputs into a valid Date object before formatting.
 * * @example
 * formatDateISO(new Date('2026-06-24')) => "2026-06-24"
 * formatDateISO(1719223200000)         => "2024-06-24"
 * formatDateISO("2026-06-24T10:42:00")  => "2026-06-24"
 */
export function formatDateISO(input: Date | string | number): ISODateString {
	const date = input instanceof Date ? input : new Date(input);

	// Handle Invalid Date
	if (isNaN(date.getTime())) {
		throw new Error('Invalid date provided to formatDateISO');
	}

	const yyyy = String(date.getFullYear());
	const mm = String(date.getMonth() + 1).padStart(2, '0');
	const dd = String(date.getDate()).padStart(2, '0');

	return `${yyyy}-${mm}-${dd}`;
}

/**
 * Generates a standardized date string (YYYY-MM-DD) for the current date and time.
 * Internally leverages `formatDateISO` to maintain consistent format formatting.
 * * @example
 * getTodayDateISO() => "2026-06-24"
 */
export function getTodayDateISO(): ISODateString {
	return formatDateISO(new Date());
}

/**
 * Generates a standardized date string (YYYY-MM-DD) for tomorrow's date.
 * Safely handles month/year rollovers (e.g., Dec 31 -> Jan 01) using native Date mutation.
 * * @example
 * getTomorrowDateISO() => "2026-06-25"
 */
export function getTomorrowDateISO(): ISODateString {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);

	return formatDateISO(tomorrow);
}
