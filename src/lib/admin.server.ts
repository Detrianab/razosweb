import { useSession, getRequestHeader } from "@tanstack/react-start/server";

import { STAFF_TOKEN_HEADER } from "@/lib/staff-token";

const ADMIN_CODE = process.env["ADMIN_CODE"] ?? "1010";

type AdminSession = { staff?: boolean };

function sessionPassword() {
  const value =
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ??
    process.env["SUPABASE_URL"] ??
    "trazos-panel-fallback-password-32chars";
  return (value + value).slice(0, 48);
}

export async function adminSession() {
  return useSession<AdminSession>({
    name: "trazos_staff",
    password: sessionPassword(),
    cookie: { sameSite: "none", secure: true, httpOnly: true, path: "/", maxAge: 60 * 60 * 8 },
  });
}

/** Opaque token handed to the browser so the panel also works without cookies. */
export async function staffToken() {
  const secret = sessionPassword() + ADMIN_CODE;
  const bytes = new TextEncoder().encode(secret);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isStaff() {
  let header: string | undefined;
  try {
    header = getRequestHeader(STAFF_TOKEN_HEADER) ?? undefined;
  } catch {
    header = undefined;
  }
  if (header && header === (await staffToken())) return true;

  try {
    const session = await adminSession();
    return session.data.staff === true;
  } catch {
    return false;
  }
}

export async function requireStaff() {
  if (!(await isStaff())) {
    throw new Error("Necesitas el código del personal para continuar.");
  }
}

export function checkCode(code: string) {
  return code.trim() === ADMIN_CODE;
}
