/**
 * Next.js instrumentation file - runs before the application starts.
 * 
 * Polyfills the broken `localStorage` global in Node.js v25+.
 * Node.js provides a `localStorage` global object when `--localstorage-file`
 * is set (even without a valid path), but the methods like `getItem`,
 * `setItem`, and `removeItem` are undefined, causing runtime crashes
 * in client components during SSR.
 */
export async function register() {
  if (typeof window === 'undefined') {
    // Running on the server - fix the broken localStorage
    const g = globalThis as Record<string, unknown>;
    if (
      g.localStorage &&
      typeof (g.localStorage as Record<string, unknown>).getItem !== 'function'
    ) {
      // Replace with a no-op in-memory implementation for SSR
      const store = new Map<string, string>();
      g.localStorage = {
        get length() {
          return store.size;
        },
        key(index: number) {
          return [...store.keys()][index] ?? null;
        },
        getItem(key: string) {
          return store.get(key) ?? null;
        },
        setItem(key: string, value: string) {
          store.set(key, String(value));
        },
        removeItem(key: string) {
          store.delete(key);
        },
        clear() {
          store.clear();
        },
      };
    }
  }
}
