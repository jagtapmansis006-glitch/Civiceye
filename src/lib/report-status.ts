import type { ReportStatus } from "@/types";

export type StatusTone = "neutral" | "civic" | "signal" | "verd";

export interface StatusMeta {
  value: ReportStatus;
  label: string;
  shortLabel: string;
  description: string;
  tone: StatusTone;
}

/** Ordered pipeline. Index = step number - 1. */
export const REPORT_STATUS_ORDER: ReportStatus[] = [
  "submitted",
  "ai_analysis",
  "verified",
  "assigned",
  "in_progress",
  "resolved",
  "citizen_verification",
  "closed",
];

export const REPORT_STATUS: Record<ReportStatus, StatusMeta> = {
  submitted: {
    value: "submitted",
    label: "Submitted",
    shortLabel: "Submitted",
    description: "Your report has been received.",
    tone: "civic",
  },
  ai_analysis: {
    value: "ai_analysis",
    label: "AI Analysis",
    shortLabel: "AI Analysis",
    description: "Automated review of the photo and description.",
    tone: "civic",
  },
  verified: {
    value: "verified",
    label: "Verified",
    shortLabel: "Verified",
    description: "An authority has confirmed the issue.",
    tone: "civic",
  },
  assigned: {
    value: "assigned",
    label: "Assigned",
    shortLabel: "Assigned",
    description: "A field team has been assigned.",
    tone: "signal",
  },
  in_progress: {
    value: "in_progress",
    label: "In Progress",
    shortLabel: "In Progress",
    description: "Work is underway on site.",
    tone: "signal",
  },
  resolved: {
    value: "resolved",
    label: "Resolved",
    shortLabel: "Resolved",
    description: "The field team has marked this fixed.",
    tone: "verd",
  },
  citizen_verification: {
    value: "citizen_verification",
    label: "Citizen Verification",
    shortLabel: "Citizen Verify",
    description: "Waiting for you to confirm the fix.",
    tone: "verd",
  },
  closed: {
    value: "closed",
    label: "Closed",
    shortLabel: "Closed",
    description: "This report is complete.",
    tone: "neutral",
  },
};

export function statusIndex(status: ReportStatus): number {
  return REPORT_STATUS_ORDER.indexOf(status);
}

export const OPEN_STATUSES: ReportStatus[] = REPORT_STATUS_ORDER.filter((s) => s !== "closed");
