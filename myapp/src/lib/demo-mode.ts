const DEMO_MODE_KEY = "asset72_demo_mode";
const isBrowser = typeof window !== "undefined";

export const isDemoMode = (): boolean =>
  isBrowser && window.localStorage.getItem(DEMO_MODE_KEY) === "true";

export const setDemoMode = (enabled: boolean): void => {
  if (!isBrowser) return;

  if (enabled) {
    window.localStorage.setItem(DEMO_MODE_KEY, "true");
    return;
  }

  window.localStorage.removeItem(DEMO_MODE_KEY);
};
