import { createMiddleware } from "@tanstack/react-start";

export const STAFF_TOKEN_KEY = "trazos-staff-token";
export const STAFF_TOKEN_HEADER = "x-trazos-staff";

/** Sends the staff token on every server function call (cookie-less fallback). */
export const attachStaffToken = createMiddleware({ type: "function" }).client(async ({ next }) => {
  let token: string | null = null;
  try {
    token = typeof localStorage !== "undefined" ? localStorage.getItem(STAFF_TOKEN_KEY) : null;
  } catch {
    token = null;
  }
  return next({ headers: token ? { [STAFF_TOKEN_HEADER]: token } : {} });
});
