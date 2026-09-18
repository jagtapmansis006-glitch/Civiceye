import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reportsService, type ReportFilters } from "@/services/reports.service";
import { mediaService } from "@/services/media.service";
import { profileService } from "@/services/profile.service";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/hooks/useAuth";
import type { CreateReportInput, ReportPriority, ReportStatus } from "@/types";

export function useMyReports() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.myReports(user?.id),
    enabled: !!user,
    queryFn: () => reportsService.listMine(user!.id),
  });
}

export function useAssignedReports() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.assignedReports(user?.id),
    enabled: !!user,
    queryFn: () => reportsService.listAssigned(user!.id),
  });
}

export function useAllReports(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: [...queryKeys.allReports(), filters],
    queryFn: () => reportsService.listAll(filters),
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: queryKeys.report(id),
    queryFn: () => reportsService.getById(id),
  });
}

export function useReportHistory(id: string) {
  return useQuery({
    queryKey: queryKeys.reportHistory(id),
    queryFn: () => reportsService.getHistory(id),
  });
}

export function useReportMedia(id: string) {
  return useQuery({
    queryKey: queryKeys.reportMedia(id),
    queryFn: () => mediaService.listForReport(id),
  });
}

export function useFieldWorkers() {
  return useQuery({
    queryKey: queryKeys.staffDirectory(),
    queryFn: () => profileService.listFieldWorkers(),
  });
}

export function useCreateReport() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateReportInput) => {
      if (!user) throw new Error("You must be signed in to submit a report");
      const report = await reportsService.create({
        category: input.category,
        title: input.title,
        description: input.description,
        latitude: input.latitude,
        longitude: input.longitude,
        address: input.address,
        reporterId: user.id,
      });
      if (input.files.length > 0) {
        await mediaService.attachMany(input.files, user.id, report.id);
      }
      return report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useUpdateReportStatus(reportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: ReportStatus) => reportsService.updateStatus(reportId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useAssignReport(reportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { assignedTo: string; priority?: ReportPriority | null }) =>
      reportsService.assign(reportId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

/** Keeps report queries fresh via Realtime while the component is mounted. */
export function useReportsRealtime(enabled = true) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!enabled) return;
    return reportsService.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    });
  }, [enabled, queryClient]);
}
