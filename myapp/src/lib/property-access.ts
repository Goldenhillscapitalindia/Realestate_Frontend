import { getAuthUser } from "@/lib/auth";

const ADD_PROPERTY_BLOCKED_EMAILS = new Set([
  "tejaswi.indukuri@gmail.com",
]);

export const isAddPropertyBlockedForCurrentUser = () => {
  const email = getAuthUser()?.email?.trim().toLowerCase();
  return email ? ADD_PROPERTY_BLOCKED_EMAILS.has(email) : false;
};
