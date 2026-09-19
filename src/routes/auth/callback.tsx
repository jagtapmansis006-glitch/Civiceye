import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { authService } from "@/services/auth.service";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [
      { title: "Confirming your account — CivicEye" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthCallbackPage,
});

/**
 * Landing target for email confirmation links. Waits for Supabase to
 * exchange the link token into a session, then forwards to the dashboard.
 */
function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let done = false;
    const finish = (to: "/dashboard" | "/login") => {
      if (done) return;
      done = true;
      navigate({ to, replace: true });
    };

    const { data: subscription } = authService.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        finish("/dashboard");
      }
    });

    // If the session already exists (link exchange raced ahead of the listener),
    // go straight through.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) finish("/dashboard");
    });

    // Fallback: no session after 8s means a bad/expired link — back to login.
    const timeout = window.setTimeout(() => finish("/login"), 8000);

    return () => {
      subscription.subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-ink">
      <Loader2 className="h-6 w-6 animate-spin text-civic" />
      <p className="text-sm font-medium">Confirming your account…</p>
    </div>
  );
}
