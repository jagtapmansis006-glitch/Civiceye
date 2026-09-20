import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/layout/EmptyState";
import { ReportList } from "@/components/reports/ReportList";
import { Button } from "@/components/ui/button";
import { useMyReports, useReportsRealtime } from "@/hooks/useReports";
import { cn } from "@/lib/utils";

type Filter = "all" | "open" | "closed";

export const Route = createFileRoute("/_authenticated/reports/")({
  head: () => ({ meta: [{ title: "My reports — CivicEye" }] }),
  component: MyReportsPage,
});

function MyReportsPage() {
  const reports = useMyReports();
  const [filter, setFilter] = useState<Filter>("all");
  useReportsRealtime();

  const list = (reports.data ?? []).filter((r) =>
    filter === "all" ? true : filter === "open" ? r.status !== "closed" : r.status === "closed",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Citizen"
        title="My reports"
        description="Everything you've filed, newest first."
        actions={
          <Button asChild>
            <Link to="/reports/new">New report</Link>
          </Button>
        }
      />
      <div
        role="tablist"
        aria-label="Filter reports"
        className="inline-flex gap-1 rounded-lg bg-glass p-1 ring-1 ring-black/5"
      >
        {(["all", "open", "closed"] as Filter[]).map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors",
              filter === f ? "bg-civic text-primary-foreground" : "text-ink/65 hover:text-civic",
            )}
          >
            {f}
          </button>
        ))}
      </div>
      {reports.isPending && <LoadingState />}
      {reports.isError && <ErrorState error={reports.error} />}
      {reports.isSuccess && list.length === 0 && (
        <EmptyState title="Nothing here" description="No reports match this filter." />
      )}
      {reports.isSuccess && list.length > 0 && <ReportList reports={list} />}
    </div>
  );
}
