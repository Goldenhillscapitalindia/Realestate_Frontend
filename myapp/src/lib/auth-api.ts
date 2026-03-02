import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const authClient = axios.create({
  baseURL: API_URL,
});

type RawAuthResponse = {
  access_token?: string;
  token?: string;
  access?: string;
  jwt?: string;
  session_id?: string;
  sessionId?: string;
  user?: Record<string, unknown>;
  profile?: Record<string, unknown>;
  [key: string]: unknown;
};

export type AuthResult = {
  accessToken: string;
  sessionId?: string | null;
  user?: Record<string, unknown> | null;
};

const parseAuthResponse = (payload: RawAuthResponse): AuthResult => {
  const accessToken =
    payload.access_token ?? payload.token ?? payload.access ?? payload.jwt ?? "";
  const sessionId = payload.session_id ?? payload.sessionId ?? null;
  const user = payload.user ?? payload.profile ?? null;

  if (!accessToken) {
    throw new Error("Auth token was not returned by server.");
  }

  return { accessToken, sessionId, user };
};

export const signupRequest = async (params: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<AuthResult> => {
  const response = await authClient.post<RawAuthResponse>("/api/auth/signup/", {
    // Backend signup serializer requires both name and username.
    name: params.username,
    username: params.username,
    email: params.email,
    password: params.password,
    reenter_password: params.confirmPassword,
  });

  return parseAuthResponse(response.data);
};

export const loginRequest = async (params: {
  email: string;
  password: string;
}): Promise<AuthResult> => {
  const response = await authClient.post<RawAuthResponse>("/api/auth/login/", {
    // Backend login expects `identifier` (email or username).
    identifier: params.email,
    password: params.password,
  });

  return parseAuthResponse(response.data);
};

export const googleLoginRequest = async (idToken: string): Promise<AuthResult> => {
  const response = await authClient.post<RawAuthResponse>("/api/auth/google/", {
    id_token: idToken,
  });
  return parseAuthResponse(response.data);
};

export const logoutRequest = async (token: string): Promise<void> => {
  await authClient.post(
    "/api/auth/logout/",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const meRequest = async (params: {
  token: string;
  sessionId?: string | null;
}): Promise<Record<string, unknown>> => {
  const response = await authClient.get<Record<string, unknown>>("/api/auth/me/", {
    headers: {
      Authorization: `Bearer ${params.token}`,
      ...(params.sessionId ? { "X-Session-Id": params.sessionId } : {}),
    },
  });

  return response.data;
};
