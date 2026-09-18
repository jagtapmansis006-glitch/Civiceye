import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const roleSchema = z.enum(["citizen", "field_worker", "authority", "admin"]);

const roleInput = z.object({
  userId: z.string().uuid(),
  role: roleSchema,
});

/**
 * Admin-only: grant a role to a user. The caller's admin status is checked
 * through their own RLS-scoped client before the privileged write runs.
 */
export const grantRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => roleInput.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) throw new Error(error.message);
    if (!isAdmin) throw new Error("Forbidden: admin role required");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: writeError } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
    if (writeError) throw new Error(writeError.message);
    return { ok: true as const };
  });

/** Admin-only: revoke a role from a user. */
export const revokeRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => roleInput.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) throw new Error(error.message);
    if (!isAdmin) throw new Error("Forbidden: admin role required");
    if (data.userId === context.userId && data.role === "admin") {
      throw new Error("You cannot remove your own admin role");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: writeError } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", data.role);
    if (writeError) throw new Error(writeError.message);
    return { ok: true as const };
  });
