/**
 * LocalStorage utility functions
 */

/**
 * Get value from localStorage
 */
export function getStorageItem<T = string>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

/**
 * Save value to localStorage
 */
export function setStorageItem<T = string>(key: string, value: T | null): void {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
  } catch (error) {
    console.warn(`Failed to save to localStorage: ${key}`, error);
  }
}

/**
 * Remove value from localStorage
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove from localStorage: ${key}`, error);
  }
}
