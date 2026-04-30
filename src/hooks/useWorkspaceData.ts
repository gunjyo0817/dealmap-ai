import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useStartups() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["startups", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("startups")
        .select("*, segment:market_segments(id, name, trend)")
        .order("last_interaction_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSegments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["segments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("market_segments")
        .select("*, startups(id, name, stage, priority, status)")
        .order("opportunity_score", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useNotes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notes", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*, startup:startups(id, name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useInsights() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["insights", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insights")
        .select("*, startup:startups(id, name), segment:market_segments(id, name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useFollowUps() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["followups", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("follow_up_questions")
        .select("*, startup:startups(id, name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}