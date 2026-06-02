const ACCESS_TOKEN_KEY = "auth_access_token";
const SESSION_ID_KEY = "auth_session_id";
const USER_KEY = "auth_user";
const API_BASE = import.meta.env.VITE_API_URL;

const isBrowser = typeof window !== "undefined";
export type AuthUser = {
  id?: string | number;
  email?: string;
  username?: string;
  name?: string;
  [key: string]: unknown;
};

export const getAccessToken = (): string | null =>
  isBrowser ? window.localStorage.getItem(ACCESS_TOKEN_KEY) : null;

export const getSessionId = (): string | null =>
  isBrowser ? window.localStorage.getItem(SESSION_ID_KEY) : null;

export const getAuthUser = (): AuthUser | null => {
  if (!isBrowser) return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const isUserLoggedIn = (): boolean => Boolean(getAccessToken());

export const setAuthSession = (params: {
  accessToken: string;
  sessionId?: string | null;
  user?: AuthUser | null;
}) => {
  if (!isBrowser) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, params.accessToken);

  if (params.sessionId) {
    window.localStorage.setItem(SESSION_ID_KEY, params.sessionId);
  } else {
    window.localStorage.removeItem(SESSION_ID_KEY);
  }

  if (params.user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(params.user));
  } else {
    window.localStorage.removeItem(USER_KEY);
  }
};

export const setAuthUser = (user: AuthUser | null) => {
  if (!isBrowser) return;
  if (user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    return;
  }
  window.localStorage.removeItem(USER_KEY);
};

export const clearUserLogin = (): void => {
  if (!isBrowser) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(SESSION_ID_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem("google_id_token");
  window.localStorage.removeItem("google_access_token");
  window.localStorage.removeItem("google_user_profile");
};
export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login/`, {
    method: "POST",
    credentials: "include",   // IMPORTANT for refresh cookie
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  const data = await res.json();

  const accessToken = data.tokens?.access;
  const sessionId = data.session_id;
  const user = data.user;

  setAuthSession({
    accessToken,
    sessionId,
    user
  });

  return user;
}
