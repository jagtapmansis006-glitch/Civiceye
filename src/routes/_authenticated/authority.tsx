import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { RoleGate } from "@/components/layout/RoleGate";
import { EmptyState, ErrorState, LoadingState } from "@/components/layout/EmptyState";
import { StatCard } from "@/components/dashboard/StatCard";
import { ReportList } from "@/components/reports/ReportList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAllReports, useReportsRealtime } from "@/hooks/useReports";
import { REPORT_CATEGORIES } from "@/lib/report-categories";
import { REPORT_STATUS, REPORT_STATUS_ORDER } from "@/lib/report-status";
import type { ReportCategory, ReportStatus } from "@/types";

export const Route = createFileRoute("/_authenticated/authority")({
  head: () => ({ meta: [{ title: "Authority desk — CivicEye" }] }),
  component: () => (
    <RoleGate allow={["authority", "admin"]}>
      <AuthorityDashboard />
    </RoleGate>
  ),
});

function AuthorityDashboard() {
  const [status, setStatus] = useState<ReportStatus | "open" | "all">("open");
  const [category, setCategory] = useState<ReportCategory | "all">("all");
  useReportsRealtime();

  const filters = {
    ...(status !== "all" ? { status } : {}),
    ...(category !== "all" ? { category } : {}),
  };
  const reports = useAllReports(filters);
  const overview = useAllReports({});
  const all = overview.data ?? [];

  const needsVerification = all.filter((r) => r.status === "submitted" || r.status === "ai_analysis").length;
  const unassigned = all.filter((r) => r.status === "verified").length;
  const active = all.filter((r) => r.status === "assigned" || r.status === "in_progress").length;
  const awaitingHandoff = all.filter((r) => r.status === "resolved").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Authority desk"
        title="Incoming reports"
        description="Verify new reports, assign field teams, and hand resolved work back to citizens."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Needs verification" value={needsVerification} />
        <StatCard label="Verified, unassigned" value={unassigned} tone="signal" />
        <StatCard label="In the field" value={active} tone="signal" />
        <StatCard label="Awaiting handoff" value={awaitingHandoff} tone="verd" />
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-56" aria-label="Status filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">All open</SelectItem>
            <SelectItem value="all">Everything</SelectItem>
            {REPORT_STATUS_ORDER.map((s) => (
              <SelectItem key={s} value={s}>
                {REPORT_STATUS[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
          <SelectTrigger className="w-64" aria-label="Category filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {REPORT_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {reports.isPending && <LoadingState />}
      {reports.isError && <ErrorState error={reports.error} />}
      {reports.isSuccess && reports.data.length === 0 && (
        <EmptyState title="No reports match" description="Try widening the status or category filter." />
      )}
      {reports.isSuccess && reports.data.length > 0 && <ReportList reports={reports.data} />}
    </div>
  );
}
