import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CategoryPicker } from "@/components/reports/CategoryPicker";
import { MediaUpload } from "@/components/reports/MediaUpload";
import { LocationCapture, type LocationValue } from "@/components/reports/LocationCapture";
import { useCreateReport } from "@/hooks/useReports";
import type { ReportCategory } from "@/types";

function Section({
  step,
  title,
  hint,
  children,
}: {
  step: number;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-panel p-5 md:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-civic/8 font-serif font-semibold text-civic ring-1 ring-civic/15">
          {step}
        </span>
        <div>
          <h2 className="font-serif text-lg font-semibold text-ink">{title}</h2>
          <p className="text-sm text-ink/60">{hint}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function ReportForm() {
  const navigate = useNavigate();
  const create = useCreateReport();
  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [location, setLocation] = useState<LocationValue>({
    latitude: null,
    longitude: null,
    address: "",
  });
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!category) return setError("Please choose an issue category.");
    if (title.trim().length < 4) return setError("Please give the report a short title.");
    if (description.trim().length < 10)
      return setError("Please describe the problem in a sentence or two.");
    if (location.latitude == null || location.longitude == null) {
      return setError("Please capture or enter the location of the issue.");
    }
    try {
      const report = await create.mutateAsync({
        category,
        title: title.trim(),
        description: description.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address.trim() || null,
        files,
      });
      toast.success(`Report ${report.reference_code} submitted`);
      navigate({ to: "/reports/$id", params: { id: report.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit the report.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Section
        step={1}
        title="What kind of issue is it?"
        hint="Pick the closest match — it routes the report to the right team."
      >
        <CategoryPicker value={category} onChange={setCategory} />
      </Section>

      <Section
        step={2}
        title="Describe the problem"
        hint="A short title and enough detail for a crew to find and fix it."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep pothole outside bus stop"
              maxLength={120}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="How big is it? Since when? Is it a safety risk?"
              maxLength={2000}
              required
            />
          </div>
        </div>
      </Section>

      <Section
        step={3}
        title="Add a photo or video"
        hint="Optional, but strongly recommended — it speeds up verification."
      >
        <MediaUpload files={files} onChange={setFiles} />
      </Section>

      <Section
        step={4}
        title="Where is it?"
        hint="Use your device location or type the coordinates and a landmark."
      >
        <LocationCapture value={location} onChange={setLocation} />
      </Section>

      {error && (
        <p
          className="rounded-xl bg-alert-soft px-4 py-3 text-sm text-alert ring-1 ring-alert/20"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink/55">
          You'll receive a report ID and can track progress from your dashboard.
        </p>
        <Button type="submit" size="lg" disabled={create.isPending}>
          {create.isPending ? "Submitting…" : "Submit report"}
        </Button>
      </div>
    </form>
  );
}
