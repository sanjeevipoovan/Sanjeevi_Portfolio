const STORAGE_KEY = "sk-spider-cursor";
const CHANGE_EVENT = "spider-cursor-change";

export function readCursorEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === null ? true : value === "on";
  } catch {
    return true;
  }
}

export function writeCursorEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // Storage is optional; the event still updates the live cursor.
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: enabled }));
}

export { CHANGE_EVENT };
