import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { profileService } from "@/services/profile.service";

export function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("Verifying your account…");

  useEffect(() => {
    let active = true;

    async function handleAuth() {
      try {
        // Check for error parameters in search params (e.g. expired link)
        const params = new URLSearchParams(window.location.search);
        const error = params.get("error");
        const errorDesc = params.get("error_description");
        const code = params.get("code");

        if (error || errorDesc) {
          const message = errorDesc || error || "Authentication failed";
          toast.error(message);
          if (active) navigate({ to: "/login", replace: true });
          return;
        }

        // PKCE Flow: exchange code for session
        if (code) {
          setStatus("Confirming your email and activating session…");
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error("Code exchange failed:", exchangeError);
            toast.error(exchangeError.message || "Failed to confirm email link.");
            if (active) navigate({ to: "/login", replace: true });
            return;
          }

          if (data?.session) {
            await profileService.ensureProfile();
            toast.success("Email verified successfully! Welcome to CivicEye.");
            if (active) navigate({ to: "/dashboard", replace: true });
            return;
          }
        }

        // Implicit flow or active session
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          await profileService.ensureProfile();
          if (active) navigate({ to: "/dashboard", replace: true });
          return;
        }

        // If URL has hash with access_token
        if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
          setStatus("Completing sign in…");
          const { data: authSub } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "SIGNED_IN" && session) {
              authSub.subscription.unsubscribe();
              await profileService.ensureProfile();
              toast.success("Signed in successfully.");
              if (active) navigate({ to: "/dashboard", replace: true });
            }
          });
          return;
        }

        // If no credentials or code present, fallback to login
        if (active) navigate({ to: "/login", replace: true });
      } catch (err) {
        console.error("Auth callback exception:", err);
        toast.error("An unexpected error occurred during authentication.");
        if (active) navigate({ to: "/login", replace: true });
      }
    }

    handleAuth();

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6 text-center">
      <div className="glass-panel max-w-sm p-8 space-y-4">
        <div className="mx-auto size-8 animate-spin rounded-full border-2 border-civic border-t-transparent" />
        <p className="text-sm font-medium text-ink/70">{status}</p>
      </div>
    </div>
  );
}
