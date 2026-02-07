import type { StateCreator, StoreMutatorIdentifier } from 'zustand';

type PersistOptions = {
  name: string;
  debounceMs?: number;
};

// Simple localStorage persistence that debounces writes
export function createLocalStoragePersistence<T>(
  options: PersistOptions
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const debounceMs = options.debounceMs ?? 500;

  return {
    save(state: T) {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        try {
          const serialized = JSON.stringify(state);
          localStorage.setItem(options.name, serialized);
        } catch {
          console.warn(`Failed to save state to localStorage key: ${options.name}`);
        }
      }, debounceMs);
    },

    load(): T | null {
      try {
        const raw = localStorage.getItem(options.name);
        if (!raw) return null;
        return JSON.parse(raw) as T;
      } catch {
        console.warn(`Failed to load state from localStorage key: ${options.name}`);
        return null;
      }
    },

    clear() {
      localStorage.removeItem(options.name);
    },
  };
}
