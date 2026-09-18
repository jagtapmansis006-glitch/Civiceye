import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { RoleGate } from "@/components/layout/RoleGate";
import { EmptyState, ErrorState, LoadingState } from "@/components/layout/EmptyState";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { useAllReports } from "@/hooks/useReports";
import { useRoleMutations, useUsersWithRoles } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { ALL_ROLES, ROLE_LABEL } from "@/lib/roles";
import { cn } from "@/lib/utils";
import type { AppRole } from "@/types";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Administration — CivicEye" }] }),
  component: () => (
    <RoleGate allow={["admin"]}>
      <AdminDashboard />
    </RoleGate>
  ),
});

function AdminDashboard() {
  const { user, refreshProfile } = useAuth();
  const users = useUsersWithRoles();
  const reports = useAllReports({});
  const { grant, revoke } = useRoleMutations();

  const all = reports.data ?? [];
  const list = users.data ?? [];

  async function toggleRole(userId: string, role: AppRole, has: boolean) {
    try {
      if (has) await revoke.mutateAsync({ userId, role });
      else await grant.mutateAsync({ userId, role });
      toast.success(`${ROLE_LABEL[role]} ${has ? "removed" : "granted"}`);
      if (userId === user?.id) await refreshProfile();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update role");
    }
  }

  const busy = grant.isPending || revoke.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Users & roles"
        description="Grant field worker, authority and admin access. Everyone starts as a citizen."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Registered users" value={list.length} />
        <StatCard label="Field workers" value={list.filter((u) => u.roles.includes("field_worker")).length} tone="signal" />
        <StatCard label="Authorities" value={list.filter((u) => u.roles.includes("authority")).length} />
        <StatCard label="Total reports" value={all.length} tone="verd" />
      </div>

      {users.isPending && <LoadingState label="Loading users…" />}
      {users.isError && <ErrorState error={users.error} />}
      {users.isSuccess && list.length === 0 && <EmptyState title="No users yet" />}
      {users.isSuccess && list.length > 0 && (
        <div className="glass-panel-strong overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-black/5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/45">
                <th className="px-4 py-2.5">User</th>
                <th className="px-4 py-2.5">Roles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {list.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 align-top">
                    <p className="font-semibold text-ink">{u.full_name || "Unnamed"}</p>
                    <p className="text-xs text-ink/55">{u.email ?? u.id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_ROLES.map((role) => {
                        const has = u.roles.includes(role);
                        return (
                          <Button
                            key={role}
                            size="sm"
                            variant={has ? "default" : "outline"}
                            disabled={busy}
                            aria-pressed={has}
                            onClick={() => toggleRole(u.id, role, has)}
                            className={cn(!has && "text-ink/65")}
                          >
                            {ROLE_LABEL[role]}
                          </Button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
