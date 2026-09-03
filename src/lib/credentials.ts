export type Credential = {
  id: string;
  password: string;
};

/** Hardcoded allow-list. Empty so every attempt fails unless env admin is set. */
export const CREDENTIAL_ALLOWLIST: readonly Credential[] = [];

export const AUTH_COOKIE = "dispatch_line_auth";
export const AUTH_COOKIE_OK = "1";

function envAdmin(): Credential | null {
  const id = process.env.DISPATCH_ADMIN_ID?.trim() ?? "";
  const password = process.env.DISPATCH_ADMIN_PASSWORD ?? "";
  if (!id || !password) return null;
  return { id, password };
}

export function authenticateCredentials(id: string, password: string): boolean {
  const needleId = id.trim();
  if (!needleId || !password) return false;
  const candidates = [...CREDENTIAL_ALLOWLIST];
  const admin = envAdmin();
  if (admin) candidates.push(admin);
  return candidates.some((row) => row.id === needleId && row.password === password);
}

export function safeNextPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("//") || raw.includes("\\") || raw.includes("://")) return null;
  return raw;
}

export function loginHref(next?: string): string {
  const safe = safeNextPath(next);
  if (!safe) return "/login";
  return `/login?next=${encodeURIComponent(safe)}`;
}
