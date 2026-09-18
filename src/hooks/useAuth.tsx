import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session, User } from "@supabase/supabase-js";
import { authService } from "@/services/auth.service";
import { profileService } from "@/services/profile.service";
import { queryKeys } from "@/lib/query-keys";
import { isStaff as computeIsStaff } from "@/lib/roles";
import type { AppRole, Profile } from "@/types";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  /** True while the initial session is being resolved. */
  loading: boolean;
  /** True while profile/roles are loading for a signed-in user. */
  profileLoading: boolean;
  isStaff: boolean;
  hasRole: (role: AppRole) => boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const { data: subscription } = authService.onAuthStateChange(async (_event, next) => {
      if (!mounted) return;
      setSession(next);
      setLoading(false);
    });
    authService
      .getSession()
      .then((s) => {
        if (!mounted) return;
        setSession(s);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user.id;

  const meQuery = useQuery({
    queryKey: queryKeys.me(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      await profileService.ensureProfile();
      const [profile, roles] = await Promise.all([
        profileService.getProfile(userId!),
        profileService.getRoles(userId!),
      ]);
      return { profile, roles };
    },
  });

  const roles = meQuery.data?.roles ?? [];

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    profile: meQuery.data?.profile ?? null,
    roles,
    loading,
    profileLoading: !!userId && meQuery.isPending,
    isStaff: computeIsStaff(roles),
    hasRole: (role) => roles.includes(role),
    signOut: async () => {
      await queryClient.cancelQueries();
      queryClient.clear();
      await authService.signOut();
    },
    refreshProfile: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.me(userId) });
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
