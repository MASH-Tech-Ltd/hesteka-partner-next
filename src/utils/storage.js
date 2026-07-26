const isBrowser = typeof window !== "undefined" && typeof window.localStorage !== "undefined" && typeof window.localStorage.getItem === "function";

export const getStorageItem = (key, fallback = null) => {
  if (!isBrowser) return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item !== null ? item : fallback;
  } catch {
    return fallback;
  }
};

export const setStorageItem = (key, value) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {}
};

export const removeStorageItem = (key) => {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(key);
  } catch {}
};
