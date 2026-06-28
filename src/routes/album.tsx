import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, Camera, Upload, Heart, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

function Album() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [authorName, setAuthorName] = useState<string>(() =>
    typeof window !== "undefined" ? localStorage.getItem("album.authorName") ?? "" : ""
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const uploading = uploads.some((u) => u.status === "uploading" || u.status === "saving" || u.status === "pending");

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
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
          .insert({ storage_path: path, author_name: name, caption: null });
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
            {photos.length} {photos.length === 1 ? "foto" : "fotos"} · ao vivo
          </span>
        </div>
      </section>

      {loading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--gold-deep)]" />
        </div>
      ) : photos.length === 0 ? (
        <div className="mt-8 px-6 text-center text-sm text-[var(--cocoa)]/60">
          Ainda não há fotos. Seja o primeiro a enviar!
        </div>
      ) : (
        <div className="mt-7 grid grid-cols-2 gap-2.5 px-5 pb-32">
          {photos.map((p, i) => (
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
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-2.5 text-[var(--ivory)]">
                <div>
                  <p className="font-serif-caps text-[8.5px] opacity-80">Álbum</p>
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

      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={() => !uploading && fileRef.current?.click()}
        disabled={uploading}
        className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 flex items-center gap-2 rounded-full px-6 py-3.5 font-serif-caps text-[10px] text-[var(--ivory)] shadow-[var(--shadow-luxe)] disabled:opacity-70"
        style={{ background: "var(--gradient-gold)" }}
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {uploading ? "Enviando..." : "Enviar Fotos"}
      </motion.button>
    </AppShell>
  );
}
