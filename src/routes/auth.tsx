import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AuthCallback } from "@/components/auth/AuthCallback";

export const Route = createFileRoute("/auth")({
<<<<<<< Updated upstream
  beforeLoad: ({ location }) => {
    // Only forward the bare /auth path — child routes such as
    // /auth/callback must stay reachable for email confirmation links.
    if (location.pathname === "/auth") {
      throw redirect({ to: "/login" });
    }
  },
=======
  component: AuthRouteComponent,
>>>>>>> Stashed changes
});

function AuthRouteComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/auth" || pathname === "/auth/") {
    return <AuthCallback />;
  }
  return <Outlet />;
}
