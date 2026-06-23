/**
 * Safely retrieves and parses a JSON value from localStorage.
 * If the key does not exist or the JSON is corrupted, it returns the provided default value.
 *
 * @template T - The expected type of the parsed data.
 * @param {string} key - The localStorage key to look up.
 * @param {T | null} [defaultValue=null] - The fallback value to return if the key is missing or invalid.
 * @returns {T | null} The parsed object/value of type T, or the defaultValue.
 * * @example
 * interface Settings { theme: Theme; stepSize: number; }
 * const settings = getStorageItem<Settings>('settings', { theme: "dark", stepSize: 15 });
 */
export function getStorageItem<T>(key: string, defaultValue: T | null = null): T | null {
	try {
		const storedValue = localStorage.getItem(key);
		if (storedValue === null) {
			return defaultValue;
		}
		return JSON.parse(storedValue) as T;
	} catch (error) {
		console.warn(`Failed to read or parse localStorage key "${key}":`, error);
		return defaultValue;
	}
}

/**
 * Safely converts a value to a JSON string and saves it to localStorage.
 * Catches any potential storage errors (e.g., localStorage quota exceeded).
 *
 * @template T - The type of the value being stored.
 * @param {string} key - The localStorage key under which the data will be stored.
 * @param {T} value - The value to serialize and store.
 * @returns {boolean} True if the operation succeeded, false if an error occurred.
 *
 * @example
 * const settings = { theme: "dark", stepSize: 15 };
 * setStorageItem('settings', settings);
 */
export function setStorageItem<T>(key: string, value: T): boolean {
	try {
		const serializedValue = JSON.stringify(value);
		localStorage.setItem(key, serializedValue);
		return true;
	} catch (error) {
		console.warn(`Failed to write to localStorage for key "${key}":`, error);
		return false;
	}
}
