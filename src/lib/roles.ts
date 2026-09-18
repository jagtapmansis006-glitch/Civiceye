import type { AppRole } from "@/types";

export const ROLE_LABEL: Record<AppRole, string> = {
  citizen: "Citizen",
  field_worker: "Field Worker",
  authority: "Authority",
  admin: "Admin",
};

export const ALL_ROLES: AppRole[] = ["citizen", "field_worker", "authority", "admin"];

export function isStaff(roles: AppRole[]): boolean {
  return roles.includes("authority") || roles.includes("admin");
}

export function hasRole(roles: AppRole[], role: AppRole): boolean {
  return roles.includes(role);
}
