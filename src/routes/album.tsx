import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, Camera, Upload, Heart, Loader2, Check, X, AlertCircle, ArrowDownUp, MoreVertical, Trash2, AlertTriangle, Tag as TagIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Ornament } from "@/components/Ornament";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/album")({
  head: () => ({ meta: [{ title: "Álbum Colaborativo — Amanda & Ricardo" }] }),
  component: Album,
});

type Photo = {
  id: string;
  storage_path: string;
  author_name: string | null;
  caption: string | null;
  tag: string;
  created_at: string;
  url?: string;
};

type UploadStatus = "pending" | "uploading" | "saving" | "done" | "error";
type UploadItem = {
  id: string;
  name: string;
  previewUrl: string;
  progress: number;
  status: UploadStatus;
  error?: string;
};

const BUCKET = "album-photos";
const TAGS = ["Geral", "Cerimônia", "Festa", "Making of", "Pré-wedding", "Convidados", "Buquê"] as const;
type Tag = (typeof TAGS)[number];
type SortOrder = "recent" | "old";

function Album() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [filterTag, setFilterTag] = useState<"Todas" | Tag>("Todas");
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent");
  const [editing, setEditing] = useState<Photo | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Photo | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [authorName, setAuthorName] = useState<string>(() =>
    typeof window !== "undefined" ? localStorage.getItem("album.authorName") ?? "" : ""
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const uploading = uploads.some((u) => u.status === "uploading" || u.status === "saving" || u.status === "pending");
  const uploadTag: Tag = filterTag === "Todas" ? "Geral" : filterTag;

  const visiblePhotos = (filterTag === "Todas"
    ? photos
    : photos.filter((p) => p.tag === filterTag)
  )
    .slice()
    .sort((a, b) =>
      sortOrder === "recent"
        ? b.created_at.localeCompare(a.created_at)
        : a.created_at.localeCompare(b.created_at)
    );

  const tagCounts = photos.reduce<Record<string, number>>((acc, p) => {
    acc[p.tag] = (acc[p.tag] ?? 0) + 1;
    return acc;
  }, {});

  async function hydrateUrls(rows: Photo[]): Promise<Photo[]> {
    if (rows.length === 0) return rows;
    const { data } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(rows.map((r) => r.storage_path), 60 * 60);
    const map = new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
    return rows.map((r) => ({ ...r, url: map.get(r.storage_path) ?? undefined }));
  }

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("album_photos")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setPhotos(await hydrateUrls(data as Photo[]));
    setLoading(false);
  }

  useEffect(() => {
    load();
    const channel = supabase
      .channel("album_photos_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "album_photos" },
        async (payload) => {
          const row = payload.new as Photo;
          const [hydrated] = await hydrateUrls([row]);
          setPhotos((prev) =>
            prev.some((p) => p.id === hydrated.id) ? prev : [hydrated, ...prev]
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "album_photos" },
        (payload) => {
          const row = payload.new as Photo;
          setPhotos((prev) =>
            prev.map((p) => (p.id === row.id ? { ...p, ...row, url: p.url } : p))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "album_photos" },
        (payload) => {
          const row = payload.old as { id: string };
          setPhotos((prev) => prev.filter((p) => p.id !== row.id));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function updatePhotoTag(photo: Photo, tag: Tag) {
    setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, tag } : p)));
    const { error } = await supabase
      .from("album_photos")
      .update({ tag })
      .eq("id", photo.id);
    if (error) {
      console.error(error);
      setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, tag: photo.tag } : p)));
    }
  }

  async function deletePhoto(photo: Photo) {
    setDeleting(true);
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    setEditing((cur) => (cur?.id === photo.id ? null : cur));
    setConfirmDelete(null);
    const { error } = await supabase.from("album_photos").delete().eq("id", photo.id);
    if (error) {
      console.error(error);
      setPhotos((prev) => (prev.some((p) => p.id === photo.id) ? prev : [photo, ...prev]));
      toast.error("Não foi possível excluir a foto", { description: "Tente novamente em instantes." });
      setDeleting(false);
      return;
    }
    await supabase.storage.from(BUCKET).remove([photo.storage_path]);
    toast.success("Foto excluída", { description: "A foto foi removida do álbum." });
    setDeleting(false);
  }

  function openDeleteConfirm(photo: Photo) {
    setConfirmDelete(photo);
  }


  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const name =
      authorName.trim() ||
      window.prompt("Seu nome (aparece junto da foto):", "")?.trim() ||
      "Convidado";
    if (name && name !== authorName) {
      setAuthorName(name);
      localStorage.setItem("album.authorName", name);
    }

    const items: UploadItem[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        id: crypto.randomUUID(),
        name: f.name,
        previewUrl: URL.createObjectURL(f),
        progress: 0,
        status: "pending" as UploadStatus,
      }));
    if (items.length === 0) return;
    setUploads((prev) => [...items, ...prev]);

    const fileMap = new Map(items.map((it, i) => [it.id, Array.from(files).filter((f) => f.type.startsWith("image/"))[i]]));

    const updateItem = (id: string, patch: Partial<UploadItem>) =>
      setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));

    for (const item of items) {
      const file = fileMap.get(item.id)!;
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      updateItem(item.id, { status: "uploading", progress: 0 });

      try {
        const { data: signed, error: signErr } = await supabase.storage
          .from(BUCKET)
          .createSignedUploadUrl(path);
        if (signErr || !signed) throw signErr ?? new Error("Falha ao iniciar upload");

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", signed.signedUrl, true);
          xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
          xhr.setRequestHeader("x-upsert", "false");
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              updateItem(item.id, { progress: Math.round((e.loaded / e.total) * 100) });
            }
          };
          xhr.onload = () =>
            xhr.status >= 200 && xhr.status < 300
              ? resolve()
              : reject(new Error(`HTTP ${xhr.status}`));
          xhr.onerror = () => reject(new Error("Erro de rede"));
          xhr.send(file);
        });

        updateItem(item.id, { progress: 100, status: "saving" });
        const { error: insErr } = await supabase
          .from("album_photos")
          .insert({ storage_path: path, author_name: name, caption: null, tag: uploadTag });
        if (insErr) throw insErr;

        updateItem(item.id, { status: "done" });
        // remove from queue after a short delay
        setTimeout(() => {
          URL.revokeObjectURL(item.previewUrl);
          setUploads((prev) => prev.filter((u) => u.id !== item.id));
        }, 1500);
      } catch (err) {
        console.error(err);
        updateItem(item.id, {
          status: "error",
          error: err instanceof Error ? err.message : "Falha no envio",
        });
      }
    }

    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--gold)]/20 bg-[var(--ivory)]/85 px-4 py-3 backdrop-blur-xl">
        <Link to="/" className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold-deep)]">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="font-serif-caps text-[11px] text-[var(--cocoa)]/70">Álbum do Casal</p>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold-deep)]">
          <Camera className="h-4 w-4" />
        </span>
      </header>

      <section className="px-6 pt-6 text-center">
        <Ornament />
        <h1 className="mt-4 font-display text-4xl leading-[1.05] text-[var(--cocoa)]">
          Chega de perder <span className="italic gold-text">momentos</span>
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-[var(--cocoa)]/65">
          Todas as fotos enviadas pelos convidados, em um só álbum digital — em tempo real.
        </p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/30 bg-[var(--card)] px-4 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-[var(--gold)] opacity-70" />
            <span className="relative h-2 w-2 rounded-full bg-[var(--gold-deep)]" />
          </span>
          <span className="font-serif-caps text-[10px] text-[var(--gold-deep)]">
            {visiblePhotos.length} {visiblePhotos.length === 1 ? "foto" : "fotos"} · ao vivo
          </span>
        </div>
      </section>

      {/* Filters */}
      <div className="mt-5 px-5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-serif-caps text-[10px] text-[var(--cocoa)]/60">Filtrar por evento</p>
          <button
            onClick={() => setSortOrder((s) => (s === "recent" ? "old" : "recent"))}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold)]/30 bg-[var(--card)] px-3 py-1 font-serif-caps text-[9px] text-[var(--cocoa)]"
          >
            <ArrowDownUp className="h-3 w-3" />
            {sortOrder === "recent" ? "Mais recentes" : "Mais antigas"}
          </button>
        </div>
        <div className="mt-2 -mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(["Todas", ...TAGS] as const).map((t) => {
            const active = filterTag === t;
            const count = t === "Todas" ? photos.length : tagCounts[t] ?? 0;
            return (
              <button
                key={t}
                onClick={() => setFilterTag(t)}
                className={`flex-none rounded-full border px-3 py-1 font-serif-caps text-[10px] transition ${
                  active
                    ? "border-transparent text-[var(--ivory)] shadow-[var(--shadow-card)]"
                    : "border-[var(--gold)]/25 bg-[var(--card)] text-[var(--cocoa)]/75"
                }`}
                style={active ? { background: "var(--gradient-gold)" } : undefined}
              >
                {t} <span className="opacity-60">· {count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--gold-deep)]" />
        </div>
      ) : visiblePhotos.length === 0 ? (
        <div className="mt-8 px-6 text-center text-sm text-[var(--cocoa)]/60">
          {photos.length === 0
            ? "Ainda não há fotos. Seja o primeiro a enviar!"
            : `Nenhuma foto em "${filterTag}" ainda.`}
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-2.5 px-5 pb-32">
          {visiblePhotos.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
              className={`group relative overflow-hidden rounded-2xl shadow-[var(--shadow-card)] ${i % 5 === 0 ? "row-span-2 aspect-[9/16]" : "aspect-[3/4]"}`}
            >
              {p.url && (
                <img
                  src={p.url}
                  alt={`Foto de ${p.author_name ?? "convidado"}`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--cocoa)]/70 via-transparent to-transparent" />
              <button
                onClick={() => setEditing(p)}
                aria-label="Editar foto"
                className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-[var(--cocoa)]/45 text-[var(--ivory)] backdrop-blur-md transition hover:bg-[var(--cocoa)]/70"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-2.5 text-[var(--ivory)]">
                <div>
                  <p className="font-serif-caps text-[8.5px] opacity-80">{p.tag}</p>
                  <p className="font-display text-xs leading-tight">por {p.author_name ?? "convidado"}</p>
                </div>
                <Heart className="h-3.5 w-3.5" fill="currentColor" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {uploads.length > 0 && (
        <div className="fixed bottom-40 left-1/2 z-40 w-[min(92vw,360px)] -translate-x-1/2 space-y-2 rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)]/95 p-3 shadow-[var(--shadow-luxe)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="font-serif-caps text-[10px] text-[var(--cocoa)]/70">
              Enviando {uploads.length} {uploads.length === 1 ? "foto" : "fotos"}
            </p>
            {!uploading && (
              <button
                onClick={() => {
                  uploads.forEach((u) => URL.revokeObjectURL(u.previewUrl));
                  setUploads([]);
                }}
                className="text-[var(--cocoa)]/50 hover:text-[var(--cocoa)]"
                aria-label="Fechar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <ul className="max-h-56 space-y-2 overflow-y-auto">
            {uploads.map((u) => (
              <li key={u.id} className="flex items-center gap-2.5">
                <img
                  src={u.previewUrl}
                  alt=""
                  className="h-9 w-9 flex-none rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[11px] text-[var(--cocoa)]">{u.name}</p>
                    <span className="flex-none font-serif-caps text-[9px] text-[var(--cocoa)]/60">
                      {u.status === "pending" && "Aguardando"}
                      {u.status === "uploading" && `${u.progress}%`}
                      {u.status === "saving" && "Salvando..."}
                      {u.status === "done" && "Concluído"}
                      {u.status === "error" && "Erro"}
                    </span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-[var(--gold)]/15">
                    <div
                      className={`h-full transition-all duration-200 ${
                        u.status === "error"
                          ? "bg-red-500"
                          : u.status === "done"
                          ? "bg-emerald-500"
                          : ""
                      }`}
                      style={{
                        width: `${u.status === "done" ? 100 : u.progress}%`,
                        background:
                          u.status === "error" || u.status === "done"
                            ? undefined
                            : "var(--gradient-gold)",
                      }}
                    />
                  </div>
                  {u.error && (
                    <p className="mt-0.5 text-[9px] text-red-600">{u.error}</p>
                  )}
                </div>
                <span className="flex-none">
                  {u.status === "done" && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                  {u.status === "error" && <AlertCircle className="h-3.5 w-3.5 text-red-600" />}
                  {(u.status === "uploading" || u.status === "saving" || u.status === "pending") && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--gold-deep)]" />
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}


      <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 flex flex-col items-center gap-1.5">
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => !uploading && fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-full px-6 py-3.5 font-serif-caps text-[10px] text-[var(--ivory)] shadow-[var(--shadow-luxe)] disabled:opacity-70"
          style={{ background: "var(--gradient-gold)" }}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Enviando..." : `Enviar para ${uploadTag}`}
        </motion.button>
        <p className="font-serif-caps text-[9px] text-[var(--cocoa)]/55">
          {filterTag === "Todas"
            ? "Toque em um evento acima para mudar a categoria"
            : `Categoria selecionada: ${filterTag}`}
        </p>
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--cocoa)]/55 backdrop-blur-sm sm:items-center"
          onClick={() => setEditing(null)}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl bg-[var(--card)] p-5 shadow-[var(--shadow-luxe)] sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="font-display text-lg text-[var(--cocoa)]">Editar foto</p>
              <button
                onClick={() => setEditing(null)}
                aria-label="Fechar"
                className="grid h-8 w-8 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--cocoa)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {editing.url && (
              <img
                src={editing.url}
                alt=""
                className="mt-3 h-40 w-full rounded-2xl object-cover"
              />
            )}

            <p className="mt-4 inline-flex items-center gap-1.5 font-serif-caps text-[10px] text-[var(--cocoa)]/65">
              <TagIcon className="h-3 w-3" /> Categoria
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {TAGS.map((t) => {
                const active = editing.tag === t;
                return (
                  <button
                    key={t}
                    onClick={() => {
                      const cur = editing;
                      setEditing({ ...cur, tag: t });
                      updatePhotoTag(cur, t);
                    }}
                    className={`rounded-full border px-3 py-1 font-serif-caps text-[10px] transition ${
                      active
                        ? "border-transparent text-[var(--ivory)]"
                        : "border-[var(--gold)]/25 bg-[var(--ivory)] text-[var(--cocoa)]/75"
                    }`}
                    style={active ? { background: "var(--gradient-gold)" } : undefined}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => deletePhoto(editing)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-3 font-serif-caps text-[10px] text-red-600 transition hover:bg-red-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir foto
            </button>
          </div>
        </div>
      )}

    </AppShell>
  );
}
