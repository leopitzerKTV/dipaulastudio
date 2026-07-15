import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AUTOSAVE_LABEL,
  InviteDraft,
  MAX_VERSIONS,
  SavedVersion,
  VERSIONS_KEY,
} from "@/lib/inviteTypes";
import {
  migrateLocalDraftsToSupabase,
  mapRowToDraft,
  persistVersionsLocally,
  rowToSavedVersion,
} from "@/lib/inviteUtils";

export function useInviteAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [autosaveReady, setAutosaveReady] = useState(false);
  const [draftRowId, setDraftRowId] = useState<string | null>(null);
  const hydratedFromCloud = useRef(false);

  // Setup auth listener
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setUserId(data.session?.user.id ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) setUserId(session?.user.id ?? null);
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

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
        if (hydrateDraft && !hydratedFromCloud.current) {
          const remoteDraft = mapRowToDraft(autosave);
          hydratedFromCloud.current = true;
          return { remoteDraft };
        }
      } else if (hydrateDraft && !hydratedFromCloud.current) {
        hydratedFromCloud.current = true;
      }

      const nonDraftRows = data.filter((row) => row.label !== AUTOSAVE_LABEL);
      const remoteVersions = nonDraftRows.slice(0, MAX_VERSIONS).map((row) => ({
        ...rowToSavedVersion(row),
        publishedUrl: row.published_url ?? undefined,
      }));
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

      return { versions: remoteVersions };
    },
    [userId],
  );

  // Migration & initial fetch
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        await migrateLocalDraftsToSupabase(userId);
        if (cancelled) return;
        await fetchSavedInvites({ hydrateDraft: true });
      } finally {
        if (!cancelled) setAutosaveReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, fetchSavedInvites]);

  return {
    userId,
    autosaveReady,
    draftRowId,
    setDraftRowId,
    hydratedFromCloud,
    fetchSavedInvites,
  };
}
