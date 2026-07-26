export const safeToLower = (val: unknown): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val.toLowerCase();
  try {
    return String(val).toLowerCase();
  } catch {
    return '';
  }
};

// Safe localStorage wrapper to prevent crashes in private browsing, in-app mobile browsers, and iframe environments.
const memoryStorage: Record<string, string> = {};

export const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`localStorage.getItem failed for key "${key}":`, e);
      return memoryStorage[key] || null;
    }
  },

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`localStorage.setItem failed for key "${key}":`, e);
      memoryStorage[key] = value;
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`localStorage.removeItem failed for key "${key}":`, e);
      delete memoryStorage[key];
    }
  },

  // Helper to safely parse JSON from localStorage with fallbacks
  getJSON<T>(key: string, fallback: T): T {
    const value = this.getItem(key);
    if (!value || value === 'undefined') {
      return fallback;
    }
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      console.error(`JSON parse error in safeLocalStorage for key "${key}":`, e);
      return fallback;
    }
  }
};
