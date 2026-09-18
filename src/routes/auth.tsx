import { createFileRoute, redirect } from "@tanstack/react-router";

/** The protected-area gate redirects here; forward to the login page. */
export const Route = createFileRoute("/auth")({
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
});
