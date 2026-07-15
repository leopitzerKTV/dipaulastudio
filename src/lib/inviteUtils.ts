import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_DRAFT,
  DRAFT_KEY,
  InviteDraft,
  MIGRATION_FLAG_KEY,
  SavedInviteInsert,
  SavedInviteRow,
  SavedVersion,
  VERSIONS_KEY,
  AUTOSAVE_LABEL,
  PALETTES,
} from "./inviteTypes";

// ============================================================================
// BLOB CONVERSION
// ============================================================================

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function base64ToBlob(b64: string, type = "application/pdf"): Blob {
  const bin = atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
}

// ============================================================================
// DRAFT NORMALIZATION
// ============================================================================

export function normalizeDraft(partial?: Partial<InviteDraft> | null): InviteDraft {
  return {
    brideName: partial?.brideName ?? DEFAULT_DRAFT.brideName,
    groomName: partial?.groomName ?? DEFAULT_DRAFT.groomName,
    date: partial?.date ?? DEFAULT_DRAFT.date,
    time: partial?.time ?? DEFAULT_DRAFT.time,
    venue: partial?.venue ?? DEFAULT_DRAFT.venue,
    city: partial?.city ?? DEFAULT_DRAFT.city,
    message: partial?.message ?? DEFAULT_DRAFT.message,
    tagline: partial?.tagline ?? DEFAULT_DRAFT.tagline,
    paletteId: partial?.paletteId ?? DEFAULT_DRAFT.paletteId,
    imageSrc: partial?.imageSrc ?? DEFAULT_DRAFT.imageSrc,
  };
}

// ============================================================================
// PAYLOAD BUILDING
// ============================================================================

export function buildInvitePayload(
  draft: InviteDraft,
  userId: string,
  overrides?: Partial<SavedInviteInsert>,
): SavedInviteInsert {
  return {
    user_id: userId,
    bride_name: draft.brideName,
    groom_name: draft.groomName,
    date: draft.date,
    time: draft.time,
    venue: draft.venue,
    city: draft.city,
    message: draft.message || null,
    tagline: draft.tagline || null,
    palette_id: draft.paletteId,
    image_data_url: draft.imageSrc || null,
    ...overrides,
  };
}

// ============================================================================
// IMAGE RESOLUTION
// ============================================================================

export function resolveImageSrc(row: SavedInviteRow): string {
  if (row.image_data_url) return row.image_data_url;
  if (row.image_storage_path) {
    const { data } = supabase.storage.from("invites").getPublicUrl(row.image_storage_path);
    if (data.publicUrl) return data.publicUrl;
  }
  return DEFAULT_DRAFT.imageSrc;
}

// ============================================================================
// ROW CONVERSION
// ============================================================================

export function mapRowToDraft(row: SavedInviteRow): InviteDraft {
  return {
    brideName: row.bride_name ?? DEFAULT_DRAFT.brideName,
    groomName: row.groom_name ?? DEFAULT_DRAFT.groomName,
    date: row.date ?? DEFAULT_DRAFT.date,
    time: row.time ?? DEFAULT_DRAFT.time,
    venue: row.venue ?? DEFAULT_DRAFT.venue,
    city: row.city ?? DEFAULT_DRAFT.city,
    message: row.message ?? DEFAULT_DRAFT.message,
    tagline: row.tagline ?? DEFAULT_DRAFT.tagline,
    paletteId: row.palette_id ?? DEFAULT_DRAFT.paletteId,
    imageSrc: resolveImageSrc(row),
  };
}

export function rowToSavedVersion(row: SavedInviteRow): SavedVersion {
  const base = mapRowToDraft(row);
  return {
    ...base,
    id: row.id,
    savedAt: Date.parse(row.updated_at ?? row.created_at ?? new Date().toISOString()),
    label: row.label ?? `${base.brideName} & ${base.groomName}`,
  };
}

// ============================================================================
// LOCAL STORAGE PERSISTENCE
// ============================================================================

export function persistDraftLocally(draft: InviteDraft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // ignore localStorage quota exceeded
  }
}

export function persistVersionsLocally(versions: SavedVersion[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions));
  } catch {
    // ignore localStorage quota exceeded
  }
}

// ============================================================================
// MIGRATION
// ============================================================================

export async function migrateLocalDraftsToSupabase(userId: string) {
  if (typeof window === "undefined") return false;
  if (window.localStorage.getItem(MIGRATION_FLAG_KEY) === "1") return false;
  let migrated = false;
  try {
    const draftRaw = window.localStorage.getItem(DRAFT_KEY);
    const versionsRaw = window.localStorage.getItem(VERSIONS_KEY);
    const payloads: SavedInviteInsert[] = [];
    if (draftRaw) {
      const parsed = normalizeDraft(JSON.parse(draftRaw) as Partial<InviteDraft>);
      payloads.push(buildInvitePayload(parsed, userId, { label: AUTOSAVE_LABEL }));
    }
    if (versionsRaw) {
      const parsed = JSON.parse(versionsRaw) as SavedVersion[];
      parsed.forEach((version, index) => {
        const normalized = normalizeDraft(version);
        payloads.push(
          buildInvitePayload(normalized, userId, {
            label: version.label ? `${version.label}-${index}` : `versao-${index}`,
            created_at: new Date(version.savedAt).toISOString(),
            updated_at: new Date(version.savedAt).toISOString(),
          }),
        );
      });
    }
    for (const payload of payloads) {
      const { error } = await supabase.from("saved_invites").insert(payload);
      if (error && error.code !== "23505") {
        console.error("Falha ao migrar convite", error);
        break;
      }
      migrated = true;
    }
    return migrated;
  } catch (error) {
    console.error("Erro durante migração para Supabase", error);
    return false;
  } finally {
    window.localStorage.setItem(MIGRATION_FLAG_KEY, "1");
  }
}

// ============================================================================
// JSON LOADING
// ============================================================================

export function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
