import { createFileRoute, redirect } from "@tanstack/react-router";

/** The protected-area gate redirects here; forward to the login page. */
export const Route = createFileRoute("/auth")({
  beforeLoad: ({ location }) => {
    // Only forward the bare /auth path — child routes such as
    // /auth/callback must stay reachable for email confirmation links.
    if (location.pathname === "/auth") {
      throw redirect({ to: "/login" });
    }
  },
});
