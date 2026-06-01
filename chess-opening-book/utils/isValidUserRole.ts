import type { SessionWithUser, UserRole } from "@/content/database_types/auth";

const validRoles: UserRole[] = ["admin", "driver", "customer"];

export function isValidUserRole(role: unknown): role is UserRole {
  return typeof role === "string" && validRoles.includes(role as UserRole);
}

export function getValidatedRole(session: SessionWithUser | null): UserRole {
  const role = session?.user?.role;
  return isValidUserRole(role) ? role : "customer";
}