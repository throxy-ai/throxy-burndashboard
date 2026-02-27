export const ROLES = ["user", "admin"] as const;

export type AppRole = (typeof ROLES)[number];

const DEFAULT_ROLE: AppRole = "user";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getAdminEmailSet(): Set<string> {
  const raw = process.env.AUTH_ADMIN_EMAILS || "";

  return new Set(
    raw
      .split(",")
      .map((value) => normalizeEmail(value))
      .filter(Boolean),
  );
}

export function getRoleForEmail(email: string): AppRole {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return DEFAULT_ROLE;
  }

  return getAdminEmailSet().has(normalized) ? "admin" : DEFAULT_ROLE;
}

export function getUserRole(user: Record<string, unknown> | null | undefined): AppRole {
  return user?.["role"] === "admin" ? "admin" : DEFAULT_ROLE;
}

export function isAdminRole(role: unknown): role is "admin" {
  return role === "admin";
}
