import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { profileService } from "@/services/profile.service";
import { ROLE_LABEL } from "@/lib/roles";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Profile & settings — CivicEye" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, profile, roles, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [ward, setWard] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
    setWard(profile?.ward ?? "");
  }, [profile]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      await profileService.updateProfile(user.id, {
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        ward: ward.trim() || null,
      });
      await refreshProfile();
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Profile & settings"
        description="How you appear on reports and how we can reach you."
      />

      <form onSubmit={handleSubmit} className="glass-panel space-y-5 p-5 md:p-6">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user?.email ?? ""} disabled />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ward">Ward / area</Label>
            <Input id="ward" value={ward} onChange={(e) => setWard(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>

      <section className="glass-panel p-5 md:p-6">
        <h2 className="font-serif text-lg font-semibold text-ink">Access</h2>
        <p className="mt-1 text-sm text-ink/60">Roles are assigned by an administrator.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(roles.length ? roles : (["citizen"] as const)).map((r) => (
            <span
              key={r}
              className="rounded-full bg-civic/5 px-3 py-1 text-xs font-semibold text-civic ring-1 ring-civic/15"
            >
              {ROLE_LABEL[r]}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
