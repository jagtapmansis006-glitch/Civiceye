import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/layout/EmptyState";
import { ROLE_LABEL } from "@/lib/roles";
import type { AppRole } from "@/types";

/**
 * UI-level gate for role-specific pages. Data access is enforced by RLS;
 * this only prevents showing a workspace the user cannot use.
 */
export function RoleGate({ allow, children }: { allow: AppRole[]; children: ReactNode }) {
  const { roles, profileLoading } = useAuth();
  if (profileLoading) return <LoadingState label="Checking your access…" />;
  const permitted = allow.some((r) => roles.includes(r));
  if (!permitted) {
    return (
      <EmptyState
        title="This area is restricted"
        description={`Only ${allow.map((r) => ROLE_LABEL[r]).join(" or ")} accounts can open this workspace. Roles are granted by an administrator.`}
        action={
          <Button asChild variant="soft">
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        }
      />
    );
  }
  return <>{children}</>;
}
