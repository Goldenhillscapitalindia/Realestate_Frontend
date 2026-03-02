export type GoogleIdTokenPayload = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  exp?: number;
  iat?: number;
};

export const decodeGoogleIdToken = (token: string): GoogleIdTokenPayload => {
  const payloadPart = token.split(".")[1] ?? "";
  const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = JSON.parse(atob(normalized));
  return decoded as GoogleIdTokenPayload;
};

export const requestGoogleAccessToken = async (): Promise<string | null> => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId || !window.google?.accounts?.oauth2) {
    return null;
  }

  return new Promise((resolve) => {
    const tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: (response) => {
        if (response.error || !response.access_token) {
          resolve(null);
          return;
        }
        resolve(response.access_token);
      },
    });

    tokenClient.requestAccessToken({ prompt: "" });
  });
};

export const createNonce = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
