import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

/**
 * Authentication service — the only place that talks to Supabase Auth.
 */
export const authService = {
  async signUpWithEmail(input: { email: string; password: string; fullName: string }) {
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
<<<<<<< Updated upstream
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: input.fullName },
=======
        emailRedirectTo: redirectTo,
        data: {
          full_name: input.fullName,
          name: input.fullName,
          email: input.email,
        },
>>>>>>> Stashed changes
      },
    });

    if (error) {
      throw error;
    }

    return data;
  },

  async signInWithEmail(input: { email: string; password: string }) {
    const { data, error } = await supabase.auth.signInWithPassword(input);
    if (error) throw error;
    return data;
  },

  async signInWithGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) throw new Error(result.error.message ?? "Google sign-in failed");
    return result;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
