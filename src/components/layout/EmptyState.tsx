import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="glass-panel flex flex-col items-center justify-center px-6 py-14 text-center">
      <p className="font-serif text-lg font-semibold text-civic-deep">{title}</p>
      {description && <p className="mt-1.5 max-w-[44ch] text-sm text-ink/60">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="glass-panel px-6 py-14 text-center text-sm text-ink/55" role="status" aria-live="polite">
      {label}
    </div>
  );
}

export function ErrorState({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  return (
    <div className="rounded-xl bg-alert-soft px-5 py-4 text-sm text-alert ring-1 ring-alert/20" role="alert">
      {message}
    </div>
  );
}
