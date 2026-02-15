/**
 * Safe wrapper around localStorage for SSR and non-standard environments.
 * Node.js experimental --localstorage-file provides a localStorage object
 * without the standard getItem/setItem/removeItem methods, which crashes
 * client components during server-side rendering.
 */

function isLocalStorageAvailable(): boolean {
  try {
    if (typeof globalThis.localStorage === 'undefined') return false;
    if (typeof globalThis.localStorage.getItem !== 'function') return false;
    if (typeof globalThis.localStorage.setItem !== 'function') return false;
    if (typeof globalThis.localStorage.removeItem !== 'function') return false;
    // Test that it actually works
    const testKey = '__storage_test__';
    globalThis.localStorage.setItem(testKey, 'test');
    globalThis.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export const safeLocalStorage: Storage = {
  get length(): number {
    if (!isLocalStorageAvailable()) return 0;
    return globalThis.localStorage.length;
  },
  key(index: number): string | null {
    if (!isLocalStorageAvailable()) return null;
    return globalThis.localStorage.key(index);
  },
  getItem(key: string): string | null {
    if (!isLocalStorageAvailable()) return null;
    try {
      return globalThis.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    if (!isLocalStorageAvailable()) return;
    try {
      globalThis.localStorage.setItem(key, value);
    } catch {
      // silently fail (e.g. quota exceeded)
    }
  },
  removeItem(key: string): void {
    if (!isLocalStorageAvailable()) return;
    try {
      globalThis.localStorage.removeItem(key);
    } catch {
      // silently fail
    }
  },
  clear(): void {
    if (!isLocalStorageAvailable()) return;
    try {
      globalThis.localStorage.clear();
    } catch {
      // silently fail
    }
  },
};
