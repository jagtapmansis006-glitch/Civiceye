import type { Database, Tables, Enums } from "@/integrations/supabase/types";

export type AppRole = Enums<"app_role">;
export type ReportCategory = Enums<"report_category">;
export type ReportStatus = Enums<"report_status">;
export type ReportPriority = Enums<"report_priority">;

export type Profile = Tables<"profiles">;
export type UserRole = Tables<"user_roles">;
export type Report = Tables<"reports">;
export type ReportMedia = Tables<"report_media">;
export type ReportStatusHistory = Tables<"report_status_history">;

export type ReportInsert = Database["public"]["Tables"]["reports"]["Insert"];
export type ReportUpdate = Database["public"]["Tables"]["reports"]["Update"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

/** Profile joined with its roles — used in staff directories and admin views. */
export interface ProfileWithRoles extends Profile {
  roles: AppRole[];
}

export interface CreateReportInput {
  category: ReportCategory;
  title: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  files: File[];
}
