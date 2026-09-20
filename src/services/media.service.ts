import { supabase } from "@/integrations/supabase/client";
import type { ReportMedia } from "@/types";

export const REPORT_MEDIA_BUCKET = "report-media";
export const MAX_MEDIA_FILES = 4;
export const ACCEPTED_MEDIA_TYPES =
  "image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm";

export interface ReportMediaWithUrl extends ReportMedia {
  url: string | null;
}

function mediaTypeFor(file: File): "image" | "video" {
  return file.type.startsWith("video/") ? "video" : "image";
}

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}

export const mediaService = {
  /** Uploads one file to Storage under <userId>/<reportId>/ and records it in report_media. */
  async attachToReport(file: File, userId: string, reportId: string): Promise<ReportMedia> {
    const path = `${userId}/${reportId}/${Date.now()}-${safeName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from(REPORT_MEDIA_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;

    const { data, error } = await supabase
      .from("report_media")
      .insert({
        report_id: reportId,
        uploaded_by: userId,
        storage_path: path,
        media_type: mediaTypeFor(file),
        mime_type: file.type,
        size_bytes: file.size,
      })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async attachMany(files: File[], userId: string, reportId: string) {
    const results: ReportMedia[] = [];
    for (const file of files) {
      results.push(await this.attachToReport(file, userId, reportId));
    }
    return results;
  },

  /** Lists media for a report with short-lived signed URLs (bucket is private). */
  async listForReport(reportId: string): Promise<ReportMediaWithUrl[]> {
    const { data, error } = await supabase
      .from("report_media")
      .select("*")
      .eq("report_id", reportId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    const rows = data ?? [];
    if (rows.length === 0) return [];

    const { data: signed, error: signError } = await supabase.storage
      .from(REPORT_MEDIA_BUCKET)
      .createSignedUrls(
        rows.map((r) => r.storage_path),
        60 * 60,
      );
    if (signError) throw signError;
    const urlByPath = new Map(signed?.map((s) => [s.path, s.signedUrl]) ?? []);
    return rows.map((r) => ({ ...r, url: urlByPath.get(r.storage_path) ?? null }));
  },
};
