/**
 * Webbläsarlagring för React-appen, med SAMMA nycklar som Vue-appens
 * useGredorStorage — så att utkast och inställningar överlever övergången
 * mellan apparna (hårt krav i migrationsplanen).
 */

// localStorage-nycklar (identiska med Vue-appen).
export const LOCAL_KEYS = [
  "AppShowFirstLaunchScreen",
  "AppTourTooltipHasBeenDisplayed",
  "AppAutosaveArsredovisning",
  "FinalizeCallBolagsverket",
] as const;

// sessionStorage-nycklar (identiska med Vue-appen).
export const SESSION_KEYS = [
  "UserPersonalNumber",
  "UserNotificationEmail",
] as const;

export type LocalKey = (typeof LOCAL_KEYS)[number];
export type SessionKey = (typeof SESSION_KEYS)[number];
export type StorageKey = LocalKey | SessionKey;

function storageFor(key: StorageKey): Storage {
  if ((LOCAL_KEYS as readonly string[]).includes(key)) return localStorage;
  if ((SESSION_KEYS as readonly string[]).includes(key)) return sessionStorage;
  throw new Error(`Unknown store: ${key}`);
}

export function readStorage<T>(key: StorageKey, defaultValue: T): T {
  const raw = storageFor(key).getItem(key);
  if (raw == null) return defaultValue;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export function writeStorage<T>(key: StorageKey, value: T): void {
  storageFor(key).setItem(key, JSON.stringify(value));
}

/** Finns det en autosparad årsredovisning att fortsätta på? */
export function hasAutosavedArsredovisning(): boolean {
  return localStorage.getItem("AppAutosaveArsredovisning") != null;
}
