import { supabase } from "@/integrations/supabase/client";
import type {
  Report,
  ReportPriority,
  ReportStatus,
  ReportStatusHistory,
  ReportUpdate,
} from "@/types";

const REPORT_COLUMNS =
  "id, reference_code, reporter_id, category, title, description, status, priority, latitude, longitude, address, assigned_to, department, ai_analysis, ai_analyzed_at, resolved_at, closed_at, created_at, updated_at";

export interface ReportFilters {
  status?: ReportStatus | "open";
  category?: Report["category"];
}

export const reportsService = {
  async create(input: {
    category: Report["category"];
    title: string;
    description: string;
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    reporterId: string;
  }): Promise<Report> {
    const { data, error } = await supabase
      .from("reports")
      .insert({
        reporter_id: input.reporterId,
        category: input.category,
        title: input.title,
        description: input.description,
        latitude: input.latitude,
        longitude: input.longitude,
        address: input.address,
      })
      .select(REPORT_COLUMNS)
      .single();
    if (error) throw error;
    return data as Report;
  },

  async listMine(userId: string): Promise<Report[]> {
    const { data, error } = await supabase
      .from("reports")
      .select(REPORT_COLUMNS)
      .eq("reporter_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Report[];
  },

  async listAssigned(userId: string): Promise<Report[]> {
    const { data, error } = await supabase
      .from("reports")
      .select(REPORT_COLUMNS)
      .eq("assigned_to", userId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Report[];
  },

  /** Every report visible to the caller — authority/admin see all via RLS. */
  async listAll(filters: ReportFilters = {}): Promise<Report[]> {
    let query = supabase
      .from("reports")
      .select(REPORT_COLUMNS)
      .order("created_at", { ascending: false });
    if (filters.status === "open") query = query.neq("status", "closed");
    else if (filters.status) query = query.eq("status", filters.status);
    if (filters.category) query = query.eq("category", filters.category);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Report[];
  },

  async getById(id: string): Promise<Report | null> {
    const { data, error } = await supabase
      .from("reports")
      .select(REPORT_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data as Report | null;
  },

  async getHistory(reportId: string): Promise<ReportStatusHistory[]> {
    const { data, error } = await supabase
      .from("report_status_history")
      .select("*")
      .eq("report_id", reportId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async updateStatus(id: string, status: ReportStatus): Promise<Report> {
    const { data, error } = await supabase
      .from("reports")
      .update({ status })
      .eq("id", id)
      .select(REPORT_COLUMNS)
      .single();
    if (error) throw error;
    return data as Report;
  },

  /** Authority action: assign a field worker (and optionally set priority). */
  async assign(
    id: string,
    input: { assignedTo: string; priority?: ReportPriority | null; department?: string | null },
  ): Promise<Report> {
    const patch: ReportUpdate = { assigned_to: input.assignedTo, status: "assigned" };
    if (input.priority !== undefined) patch.priority = input.priority;
    if (input.department !== undefined) patch.department = input.department;
    const { data, error } = await supabase
      .from("reports")
      .update(patch)
      .eq("id", id)
      .select(REPORT_COLUMNS)
      .single();
    if (error) throw error;
    return data as Report;
  },

  async setPriority(id: string, priority: ReportPriority | null): Promise<Report> {
    const { data, error } = await supabase
      .from("reports")
      .update({ priority })
      .eq("id", id)
      .select(REPORT_COLUMNS)
      .single();
    if (error) throw error;
    return data as Report;
  },

  /** Subscribe to live changes on reports visible to the current user. */
  subscribe(onChange: () => void) {
    const channel = supabase
      .channel("reports-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, onChange)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  },
};
