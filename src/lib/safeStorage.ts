/**
 * Safe localStorage operations with validation and size limits
 */

const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit per key

function getStorageSize(key: string, value: string): number {
  return key.length + value.length + 2; // Rough estimation (key + value + overhead)
}

function checkStorageQuota(size: number): boolean {
  return size <= MAX_STORAGE_SIZE;
}

export function safeSetItem(key: string, value: string): boolean {
  try {
    const size = getStorageSize(key, value);
    if (!checkStorageQuota(size)) {
      console.error(
        `[safeStorage] Quota exceeded for key "${key}". Size: ${size} bytes, Max: ${MAX_STORAGE_SIZE} bytes`,
      );
      return false;
    }
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === "QuotaExceededError") {
      console.error(`[safeStorage] localStorage quota exceeded for key "${key}"`);
    } else {
      console.error(`[safeStorage] Failed to set item "${key}":`, error);
    }
    return false;
  }
}

export function safeGetItem(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.error(`[safeStorage] Failed to get item "${key}":`, error);
    return null;
  }
}

export function safeRemoveItem(key: string): boolean {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[safeStorage] Failed to remove item "${key}":`, error);
    return false;
  }
}

export function safeClear(): boolean {
  try {
    window.localStorage.clear();
    return true;
  } catch (error) {
    console.error(`[safeStorage] Failed to clear localStorage:`, error);
    return false;
  }
}

/**
 * Attempts to free up space by removing items until size is acceptable
 * Removes items in order: skipKeys are preserved
 */
export function tryFreeUpSpace(requiredSize: number, skipKeys: string[] = []): boolean {
  try {
    if (requiredSize <= MAX_STORAGE_SIZE) return true;

    const keys = Object.keys(window.localStorage).filter((k) => !skipKeys.includes(k));
    for (const key of keys) {
      if (requiredSize <= MAX_STORAGE_SIZE) return true;
      const value = window.localStorage.getItem(key);
      if (value) {
        requiredSize -= value.length + key.length;
        window.localStorage.removeItem(key);
      }
    }

    return requiredSize <= MAX_STORAGE_SIZE;
  } catch (error) {
    console.error("[safeStorage] Failed to free up space:", error);
    return false;
  }
}
