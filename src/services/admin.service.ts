import { grantRole, revokeRole } from "@/lib/admin.functions";
import type { AppRole } from "@/types";

/** Client-side wrapper around privileged server functions. */
export const adminService = {
  grantRole(userId: string, role: AppRole) {
    return grantRole({ data: { userId, role } });
  },
  revokeRole(userId: string, role: AppRole) {
    return revokeRole({ data: { userId, role } });
  },
};
