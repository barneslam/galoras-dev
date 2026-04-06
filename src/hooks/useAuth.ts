import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type UserProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  subscription_status: string | null;
  subscription_tier: string | null;
  linkedin_url: string | null;
  user_role: string | null;
  industry: string | null;
  goals: string[] | null;
  coaching_areas: string[] | null;
  challenges: string | null;
  onboarding_complete: boolean;
};

type AuthState = {
  user: User | null;
  profile: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
};

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select(
        "id, full_name, email, avatar_url, subscription_status, subscription_tier, linkedin_url, user_role, industry, goals, coaching_areas, challenges, onboarding_complete"
      )
      .eq("id", userId)
      .maybeSingle();
    setProfile((data as UserProfile) ?? null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    profile,
    isLoggedIn: !!user,
    isLoading,
  };
}
