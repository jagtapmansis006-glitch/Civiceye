import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthCard } from "@/components/auth/AuthCard";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create an account — CivicEye" },
      { name: "description", content: "Register with CivicEye to report civic problems in your area and follow their resolution." },
      { property: "og:title", content: "Create an account — CivicEye" },
      { property: "og:description", content: "Register to report civic problems and follow their resolution." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [loading, user, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const data = await authService.signUpWithEmail({ email, password, fullName });
      if (data.session) navigate({ to: "/dashboard" });
      else setCheckEmail(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account.");
    } finally {
      setBusy(false);
    }
  }

  if (checkEmail) {
    return (
      <AuthCard title="Check your inbox" description={`We sent a confirmation link to ${email}. Open it to activate your account.`}>
        <Button asChild variant="soft" className="w-full">
          <Link to="/login">Back to sign in</Link>
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      description="Citizens can report issues right away. Staff roles are granted by an administrator."
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-civic hover:underline">
            Sign in
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
          <Label htmlFor="name">Full name</Label>
          <Input id="name" autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
          <p className="text-xs text-ink/50">At least 8 characters.</p>
        </div>
        {error && (
          <p className="rounded-lg bg-alert-soft px-3 py-2 text-sm text-alert ring-1 ring-alert/20" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
}
