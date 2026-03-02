const ACCESS_TOKEN_KEY = "auth_access_token";
const SESSION_ID_KEY = "auth_session_id";
const USER_KEY = "auth_user";

export type AuthUser = {
  id?: string | number;
  email?: string;
  username?: string;
  name?: string;
  [key: string]: unknown;
};

export const getAccessToken = (): string | null =>
  window.sessionStorage.getItem(ACCESS_TOKEN_KEY);

export const getSessionId = (): string | null =>
  window.sessionStorage.getItem(SESSION_ID_KEY);

export const getAuthUser = (): AuthUser | null => {
  const raw = window.sessionStorage.getItem(USER_KEY);
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
  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, params.accessToken);

  if (params.sessionId) {
    window.sessionStorage.setItem(SESSION_ID_KEY, params.sessionId);
  } else {
    window.sessionStorage.removeItem(SESSION_ID_KEY);
  }

  if (params.user) {
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(params.user));
  } else {
    window.sessionStorage.removeItem(USER_KEY);
  }
};

export const setAuthUser = (user: AuthUser | null) => {
  if (user) {
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    return;
  }
  window.sessionStorage.removeItem(USER_KEY);
};

export const clearUserLogin = (): void => {
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(SESSION_ID_KEY);
  window.sessionStorage.removeItem(USER_KEY);
  window.sessionStorage.removeItem("google_id_token");
  window.sessionStorage.removeItem("google_access_token");
  window.sessionStorage.removeItem("google_user_profile");
};
