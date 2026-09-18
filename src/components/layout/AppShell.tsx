import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  ShieldCheck,
  Wrench,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { Brand } from "@/components/layout/Brand";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABEL } from "@/lib/roles";
import type { AppRole } from "@/types";

interface NavItem {
  to: "/dashboard" | "/reports/new" | "/reports" | "/authority" | "/field" | "/admin" | "/settings";
  label: string;
  icon: typeof LayoutDashboard;
  roles?: AppRole[];
}

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/reports/new", label: "Create report", icon: PlusCircle },
  { to: "/reports", label: "My reports", icon: FileText },
  { to: "/authority", label: "Authority desk", icon: ShieldCheck, roles: ["authority", "admin"] },
  { to: "/field", label: "Field work", icon: Wrench, roles: ["field_worker"] },
  { to: "/admin", label: "Administration", icon: Users, roles: ["admin"] },
  { to: "/settings", label: "Profile & settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, user, roles, signOut } = useAuth();
  const navigate = useNavigate();

  const items = NAV.filter((item) => !item.roles || item.roles.some((r) => roles.includes(r)));
  const displayName = profile?.full_name || user?.email || "Account";

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col md:flex-row">
      <aside className="border-b border-black/5 bg-glass backdrop-blur-md md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-r md:border-b-0">
        <div className="flex h-16 items-center px-5">
          <Brand />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:overflow-visible md:pb-0" aria-label="Main">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/reports" }}
              className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-accent hover:text-civic"
              activeProps={{ className: "bg-civic text-primary-foreground hover:bg-civic hover:text-primary-foreground" }}
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden border-t border-black/5 p-4 md:block">
          <p className="truncate text-sm font-semibold text-ink">{displayName}</p>
          <p className="mt-0.5 text-xs text-ink/55">
            {roles.length ? roles.map((r) => ROLE_LABEL[r]).join(" · ") : "Citizen"}
          </p>
          <Button variant="ghost" size="sm" className="mt-3 w-full justify-start px-2" onClick={handleSignOut}>
            <LogOut /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 px-5 py-8 md:px-10">
        <div className="mb-4 flex items-center justify-end md:hidden">
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut /> Sign out
          </Button>
        </div>
        {children}
      </main>
    </div>
  );
}
