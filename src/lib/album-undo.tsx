import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "album-photos";
const UNDO_DURATION_MS = 5000;

export type AlbumPhoto = {
  id: string;
  storage_path: string;
  author_name: string | null;
  caption: string | null;
  tag: string;
  created_at: string;
  url?: string;
};

type Entry = {
  photo: AlbumPhoto;
  trashPath: string;
  expiresAt: number;
  timeoutId: number;
};

const entries = new Map<string, Entry>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribePendingDeletes(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getPendingDeleteIds(): Set<string> {
  return new Set(entries.keys());
}

export function getLatestPendingId(): string | null {
  let latest: Entry | null = null;
  for (const e of entries.values()) {
    if (!latest || e.expiresAt > latest.expiresAt) latest = e;
  }
  return latest ? latest.photo.id : null;
}

type RestoreHandler = (photo: AlbumPhoto) => void;
let restoreHandler: RestoreHandler | null = null;

export function setAlbumRestoreHandler(h: RestoreHandler | null) {
  restoreHandler = h;
}

async function hydrateUrl(photo: AlbumPhoto): Promise<AlbumPhoto> {
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(photo.storage_path, 60 * 60);
  return { ...photo, url: data?.signedUrl ?? photo.url };
}

const CONSOLIDATED_TOAST_ID = "album-undo";

function UndoToast({
  id,
  count,
  latestPhoto,
  onUndo,
}: {
  id: string | number;
  count: number;
  latestPhoto: AlbumPhoto;
  onUndo: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    buttonRef.current?.focus();
  }, []);
  const title = count > 1 ? `${count} fotos excluídas` : "Foto excluída";
  const description =
    count > 1
      ? "Desfazer restaura a exclusão mais recente. Repita para reverter as anteriores."
      : "Você pode desfazer dentro do tempo restante.";
  return (
    <div
      role="alertdialog"
      aria-live="assertive"
      aria-atomic="true"
      aria-labelledby={`undo-title-${id}`}
      aria-describedby={`undo-desc-${id}`}
      className="flex w-full items-center justify-between gap-4 rounded-lg bg-[var(--card)] p-4 shadow-[var(--shadow-luxe)]"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          toast.dismiss(id);
        }
      }}
    >
      <div>
        <p id={`undo-title-${id}`} className="font-display text-sm text-[var(--cocoa)]">
          {title}
        </p>
        <p id={`undo-desc-${id}`} className="font-serif-caps text-[10px] text-[var(--cocoa)]/70">
          {description}
        </p>
      </div>
      <button
        ref={buttonRef}
        onClick={onUndo}
        aria-label={`Desfazer exclusão da foto de ${latestPhoto.author_name ?? "convidado"}`}
        className="rounded-full bg-[var(--gold)] px-3 py-1.5 font-serif-caps text-[10px] text-[var(--ivory)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:ring-offset-1"
      >
        Desfazer
      </button>
    </div>
  );
}

function refreshConsolidatedToast() {
  if (entries.size === 0) {
    toast.dismiss(CONSOLIDATED_TOAST_ID);
    return;
  }
  let latest: Entry | null = null;
  for (const e of entries.values()) {
    if (!latest || e.expiresAt > latest.expiresAt) latest = e;
  }
  const remaining = Math.max(0, (latest as Entry).expiresAt - Date.now());
  const count = entries.size;
  const latestPhoto = (latest as Entry).photo;
  toast.custom(
    (id) => (
      <UndoToast
        id={id}
        count={count}
        latestPhoto={latestPhoto}
        onUndo={() => void cancelPendingDelete(latestPhoto.id)}
      />
    ),
    { duration: remaining, id: CONSOLIDATED_TOAST_ID },
  );
}

export function schedulePendingDelete(photo: AlbumPhoto, trashPath: string) {
  const expiresAt = Date.now() + UNDO_DURATION_MS;
  const timeoutId = window.setTimeout(() => {
    void commitPendingDelete(photo.id);
  }, UNDO_DURATION_MS);
  entries.set(photo.id, { photo, trashPath, expiresAt, timeoutId });
  notify();
  refreshConsolidatedToast();
}

async function commitPendingDelete(photoId: string) {
  const entry = entries.get(photoId);
  if (!entry) return;
  entries.delete(photoId);
  notify();
  refreshConsolidatedToast();
  const { error } = await supabase.storage.from(BUCKET).remove([entry.trashPath]);
  if (error) {
    console.error(error);
    toast.error("Não foi possível remover o arquivo do armazenamento", {
      description: "O registro foi excluído, mas o arquivo ficou órfão.",
    });
    return;
  }
  toast.success("Foto excluída permanentemente", {
    description: "A foto foi removida do álbum e do armazenamento.",
  });
}

export async function cancelPendingDelete(photoId: string) {
  const entry = entries.get(photoId);
  if (!entry) return;
  window.clearTimeout(entry.timeoutId);
  entries.delete(photoId);
  notify();
  refreshConsolidatedToast();

  const restoringToast = toast.loading("Restaurando foto...", {
    description: "Recriando o registro e devolvendo o arquivo ao álbum.",
  });

  const { error: moveErr } = await supabase.storage
    .from(BUCKET)
    .move(entry.trashPath, entry.photo.storage_path);
  if (moveErr) {
    console.error(moveErr);
    toast.dismiss(restoringToast);
    toast.error("Falha na restauração do arquivo", {
      description:
        "O arquivo original não pôde ser recuperado do armazenamento. A foto permanece excluída.",
    });
    return;
  }

  const { error: insertErr } = await supabase.from("album_photos").insert({
    id: entry.photo.id,
    storage_path: entry.photo.storage_path,
    author_name: entry.photo.author_name,
    caption: entry.photo.caption,
    tag: entry.photo.tag,
    created_at: entry.photo.created_at,
  });
  if (insertErr) {
    console.error(insertErr);
    toast.dismiss(restoringToast);
    toast.error("Falha na restauração do registro", {
      description:
        "O arquivo foi recuperado, mas o registro não pôde ser recriado. Tente recarregar a página.",
    });
    return;
  }

  const hydrated = await hydrateUrl(entry.photo);
  restoreHandler?.(hydrated);
  toast.dismiss(restoringToast);
  toast.success("Exclusão desfeita", {
    description: "A foto foi restaurada e voltou ao álbum.",
  });
}
