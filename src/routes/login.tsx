import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — CivicEye" },
      { name: "description", content: "Sign in to CivicEye to report civic issues and track their resolution." },
      { property: "og:title", content: "Log in — CivicEye" },
      { property: "og:description", content: "Sign in to report civic issues and track their resolution." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [loading, user, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await authService.signInWithEmail({ email, password });
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    if (!email) {
      setError("Enter your email above, then choose reset again.");
      return;
    }
    try {
      await authService.resetPassword(email);
      toast.success("Password reset email sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reset email.");
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to track your reports or manage your workload."
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="font-semibold text-civic hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <GoogleButton />
      <div className="my-5 flex items-center gap-3 text-xs text-ink/45">
        <span className="h-px flex-1 bg-black/10" />
        or with email
        <span className="h-px flex-1 bg-black/10" />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button type="button" onClick={handleReset} className="text-xs font-medium text-civic hover:underline">
              Forgot password?
            </button>
          </div>
          <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && (
          <p className="rounded-lg bg-alert-soft px-3 py-2 text-sm text-alert ring-1 ring-alert/20" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
}
