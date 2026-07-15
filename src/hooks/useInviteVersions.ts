import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AUTOSAVE_LABEL,
  InviteDraft,
  MAX_VERSIONS,
  SavedVersion,
} from "@/lib/inviteTypes";
import {
  buildInvitePayload,
  persistVersionsLocally,
  rowToSavedVersion,
} from "@/lib/inviteUtils";

export function useInviteVersions(
  userId: string | null,
  draft: InviteDraft,
  draftRowId: string | null,
  setDraftRowId: (id: string | null) => void,
  onDraftChange?: (draft: InviteDraft) => void,
) {
  const [versions, setVersions] = useState<SavedVersion[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("nossahistoria.invite.versions");
      return raw ? (JSON.parse(raw) as SavedVersion[]) : [];
    } catch {
      return [];
    }
  });
  const [savingVersion, setSavingVersion] = useState(false);

  const fetchSavedInvites = useCallback(
    async ({ hydrateDraft = false }: { hydrateDraft?: boolean } = {}) => {
      if (!userId) return;
      const { data, error } = await supabase
        .from("saved_invites")
        .select("*")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false });
      if (error) {
        console.error("Erro ao sincronizar convites", error);
        toast.error("Não foi possível sincronizar seus convites");
        return;
      }
      if (!data) return;

      const autosave = data.find((row) => row.label === AUTOSAVE_LABEL);
      if (autosave) {
        setDraftRowId(autosave.id);
      }

      const nonDraftRows = data.filter((row) => row.label !== AUTOSAVE_LABEL);
      const remoteVersions = nonDraftRows.slice(0, MAX_VERSIONS).map((row) => ({
        ...rowToSavedVersion(row),
        publishedUrl: row.published_url ?? undefined,
      }));
      setVersions(remoteVersions);
      persistVersionsLocally(remoteVersions);

      const overflow = nonDraftRows.slice(MAX_VERSIONS);
      if (overflow.length > 0) {
        void supabase
          .from("saved_invites")
          .delete()
          .in(
            "id",
            overflow.map((row) => row.id),
          );
      }
    },
    [userId, setDraftRowId],
  );

  const saveVersion = useCallback(
    async (label: string) => {
      if (!userId) return;
      setSavingVersion(true);
      try {
        const payload = buildInvitePayload(draft, userId, {
          label,
          id: undefined,
        });
        const { error } = await supabase.from("saved_invites").insert(payload);
        if (error) throw error;
        toast.success("Versão salva com sucesso!");
        await fetchSavedInvites();
      } catch (error) {
        console.error("Erro ao salvar versão", error);
        toast.error("Erro ao salvar versão");
      } finally {
        setSavingVersion(false);
      }
    },
    [userId, draft, fetchSavedInvites],
  );

  const loadVersion = useCallback(
    (version: SavedVersion) => {
      onDraftChange?.(version);
      toast.success(`Versão "${version.label}" carregada!`);
    },
    [onDraftChange],
  );

  const deleteVersion = useCallback(
    async (versionId: string) => {
      try {
        const { error } = await supabase
          .from("saved_invites")
          .delete()
          .eq("id", versionId);
        if (error) throw error;
        toast.success("Versão deletada");
        setVersions((prev) => prev.filter((v) => v.id !== versionId));
        persistVersionsLocally(versions.filter((v) => v.id !== versionId));
      } catch (error) {
        console.error("Erro ao deletar versão", error);
        toast.error("Erro ao deletar versão");
      }
    },
    [versions],
  );

  return {
    versions,
    setVersions,
    savingVersion,
    saveVersion,
    loadVersion,
    deleteVersion,
    fetchSavedInvites,
  };
}
