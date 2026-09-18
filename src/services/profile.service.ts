import { supabase } from "@/integrations/supabase/client";
import type { AppRole, Profile, ProfileUpdate, ProfileWithRoles } from "@/types";

export const profileService = {
  /** Creates the profile + default citizen role if missing. Safe to call on every sign-in. */
  async ensureProfile(): Promise<void> {
    const { error } = await supabase.rpc("ensure_profile");
    if (error) throw error;
  },

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error) throw error;
    return data;
  },

  async getRoles(userId: string): Promise<AppRole[]> {
    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    if (error) throw error;
    return (data ?? []).map((r) => r.role);
  },

  async updateProfile(userId: string, patch: ProfileUpdate): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  /** All profiles with their roles. RLS restricts this to authority/admin users. */
  async listUsersWithRoles(): Promise<ProfileWithRoles[]> {
    const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    if (pErr) throw pErr;
    if (rErr) throw rErr;
    const roleMap = new Map<string, AppRole[]>();
    for (const r of roles ?? []) {
      roleMap.set(r.user_id, [...(roleMap.get(r.user_id) ?? []), r.role]);
    }
    return (profiles ?? []).map((p) => ({ ...p, roles: roleMap.get(p.id) ?? [] }));
  },

  /** Field workers available for assignment. */
  async listFieldWorkers(): Promise<ProfileWithRoles[]> {
    const users = await this.listUsersWithRoles();
    return users.filter((u) => u.roles.includes("field_worker"));
  },
};
