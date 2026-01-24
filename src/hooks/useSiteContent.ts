import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteContent {
  id: string;
  section_key: string;
  content: Record<string, string>;
  updated_at: string;
  updated_by: string | null;
}

export function useSiteContent(sectionKey: string) {
  return useQuery({
    queryKey: ["site-content", sectionKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .eq("section_key", sectionKey)
        .single();

      if (error) throw error;
      return data as SiteContent;
    },
  });
}

export function useAllSiteContent() {
  return useQuery({
    queryKey: ["site-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .order("section_key");

      if (error) throw error;
      return data as SiteContent[];
    },
  });
}

export function useUpdateSiteContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sectionKey,
      content,
    }: {
      sectionKey: string;
      content: Record<string, string>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("site_content")
        .update({
          content,
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq("section_key", sectionKey)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
      queryClient.invalidateQueries({ queryKey: ["site-content", variables.sectionKey] });
    },
  });
}
