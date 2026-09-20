import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/profile.service";
import { adminService } from "@/services/admin.service";
import { queryKeys } from "@/lib/query-keys";
import type { AppRole } from "@/types";

export function useUsersWithRoles() {
  return useQuery({
    queryKey: queryKeys.users(),
    queryFn: () => profileService.listUsersWithRoles(),
  });
}

export function useRoleMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users() });
    queryClient.invalidateQueries({ queryKey: queryKeys.staffDirectory() });
  };
  const grant = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: AppRole }) =>
      adminService.grantRole(userId, role),
    onSuccess: invalidate,
  });
  const revoke = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: AppRole }) =>
      adminService.revokeRole(userId, role),
    onSuccess: invalidate,
  });
  return { grant, revoke };
}
