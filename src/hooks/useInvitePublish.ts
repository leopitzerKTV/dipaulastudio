import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";

type SavedInviteInsert = TablesInsert<"saved_invites">;

export function useInvitePublish() {
  const [publishing, setPublishing] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);

  const generateSlug = useCallback((brideName: string, groomName: string): string => {
    const normalize = (name: string) =>
      name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    const base = `${normalize(brideName)}-${normalize(groomName)}`;
    const suffix = Math.random().toString(36).slice(2, 7);
    return `${base}-${suffix}`;
  }, []);

  const publishInvite = useCallback(
    async (inviteId: string, brideName: string, groomName: string): Promise<string | null> => {
      setPublishing(true);
      try {
        const slug = generateSlug(brideName, groomName);
        const { error } = await supabase
          .from("saved_invites")
          .update({
            is_published: true,
            published_url: slug,
            updated_at: new Date().toISOString(),
          })
          .eq("id", inviteId);
        if (error) throw error;
        toast.success("✨ Convite publicado! Link gerado para compartilhamento.");
        return slug;
      } catch (error) {
        console.error("Erro ao publicar convite", error);
        toast.error("Não foi possível publicar o convite.");
        return null;
      } finally {
        setPublishing(false);
      }
    },
    [generateSlug]
  );

  const unpublishInvite = useCallback(async (inviteId: string): Promise<boolean> => {
    setUnpublishing(true);
    try {
      const { error } = await supabase
        .from("saved_invites")
        .update({
          is_published: false,
          published_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", inviteId);
      if (error) throw error;
      toast.success("🔒 Convite despublicado. O link não estará mais acessível.");
      return true;
    } catch (error) {
      console.error("Erro ao despublicar convite", error);
      toast.error("Não foi possível despublicar o convite.");
      return false;
    } finally {
      setUnpublishing(false);
    }
  }, []);

  const getPublicUrl = useCallback((slug: string): string => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/convite/${slug}`;
  }, []);

  const incrementShareCount = useCallback(async (inviteId: string): Promise<void> => {
    try {
      await supabase.rpc("increment_share_count", { invite_id: inviteId });
    } catch {
      // silently ignore share count errors
    }
  }, []);

  return {
    publishing,
    unpublishing,
    publishInvite,
    unpublishInvite,
    getPublicUrl,
    incrementShareCount,
  };
}
