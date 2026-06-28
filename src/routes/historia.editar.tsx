import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown, Loader2, Upload, Save, Eye, EyeOff, GripVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/historia/editar")({
  head: () => ({ meta: [{ title: "Editar Nossa História" }] }),
  component: EditarHistoria,
});

const BUCKET = "story-photos";

type Chapter = {
  id: string;
  position: number;
  storage_path: string | null;
  date_label: string;
  title: string;
  body: string;
  imageUrl?: string;
};

function EditarHistoria() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const gripRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const refocusId = useRef<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("story_chapters")
      .select("*")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      toast.error("Não foi possível carregar os capítulos");
      setLoading(false);
      return;
    }
    const rows = (data ?? []) as Chapter[];
    const paths: string[] = rows.map((r) => r.storage_path).filter((p): p is string => !!p);
    const urlMap = new Map<string, string>();
    if (paths.length > 0) {
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 60 * 60);
      signed?.forEach((s) => {
        if (s.signedUrl && s.path) urlMap.set(s.path, s.signedUrl);
      });
    }
    setChapters(rows.map((r) => ({ ...r, imageUrl: r.storage_path ? urlMap.get(r.storage_path) : undefined })));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // Auto-scroll the window when dragging near top/bottom edges
  useEffect(() => {
    if (!dragId) return;
    const EDGE = 110; // px from viewport edge that triggers scroll
    const MAX_SPEED = 22; // px per frame
    let pointerY: number | null = null;
    let raf = 0;

    const onDragOver = (e: DragEvent) => {
      pointerY = e.clientY;
    };

    const tick = () => {
      if (pointerY != null) {
        const vh = window.innerHeight;
        let delta = 0;
        if (pointerY < EDGE) {
          delta = -Math.ceil(((EDGE - pointerY) / EDGE) * MAX_SPEED);
        } else if (pointerY > vh - EDGE) {
          delta = Math.ceil(((pointerY - (vh - EDGE)) / EDGE) * MAX_SPEED);
        }
        if (delta !== 0) window.scrollBy(0, delta);
      }
      raf = window.requestAnimationFrame(tick);
    };

    window.addEventListener("dragover", onDragOver, { passive: true });
    raf = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.cancelAnimationFrame(raf);
    };
  }, [dragId]);

  function patchLocal(id: string, patch: Partial<Chapter>) {
    setChapters((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  async function addChapter() {
    setAdding(true);
    const nextPosition = chapters.length > 0 ? Math.max(...chapters.map((c) => c.position)) + 1 : 0;
    const { data, error } = await supabase
      .from("story_chapters")
      .insert({ position: nextPosition, date_label: "", title: "Novo capítulo", body: "" })
      .select()
      .single();
    setAdding(false);
    if (error || !data) {
      toast.error("Não foi possível criar o capítulo");
      return;
    }
    setChapters((prev) => [...prev, data as Chapter]);
    toast.success("Capítulo criado");
  }

  async function saveChapter(c: Chapter) {
    setSavingId(c.id);
    const { error } = await supabase
      .from("story_chapters")
      .update({
        date_label: c.date_label,
        title: c.title,
        body: c.body,
      })
      .eq("id", c.id);
    setSavingId(null);
    if (error) {
      toast.error("Não foi possível salvar");
      return;
    }
    toast.success("Capítulo salvo");
  }

  async function deleteChapter(c: Chapter) {
    if (!window.confirm(`Excluir o capítulo "${c.title || "sem título"}"?`)) return;
    const previous = chapters;
    setChapters((prev) => prev.filter((x) => x.id !== c.id));
    if (c.storage_path) {
      await supabase.storage.from(BUCKET).remove([c.storage_path]);
    }
    const { error } = await supabase.from("story_chapters").delete().eq("id", c.id);
    if (error) {
      toast.error("Não foi possível excluir");
      setChapters(previous);
      return;
    }
    toast.success("Capítulo excluído");
  }

  async function move(c: Chapter, direction: -1 | 1) {
    const sorted = [...chapters].sort((a, b) => a.position - b.position);
    const idx = sorted.findIndex((x) => x.id === c.id);
    const swap = sorted[idx + direction];
    if (!swap) return;
    const a = { ...c, position: swap.position };
    const b = { ...swap, position: c.position };
    setChapters((prev) => prev.map((x) => (x.id === a.id ? a : x.id === b.id ? b : x)));
    const [r1, r2] = await Promise.all([
      supabase.from("story_chapters").update({ position: a.position }).eq("id", a.id),
      supabase.from("story_chapters").update({ position: b.position }).eq("id", b.id),
    ]);
    if (r1.error || r2.error) {
      toast.error("Não foi possível reordenar");
      load();
    }
  }

  async function reorderTo(fromId: string, toId: string) {
    if (fromId === toId) return;
    const sorted = [...chapters].sort((a, b) => a.position - b.position);
    const fromIdx = sorted.findIndex((x) => x.id === fromId);
    const toIdx = sorted.findIndex((x) => x.id === toId);
    if (fromIdx === -1 || toIdx === -1) return;
    await reorderToIndex(fromId, toIdx, sorted);
  }

  async function reorderToIndex(fromId: string, toIdx: number, presorted?: Chapter[]) {
    const sorted = presorted ?? [...chapters].sort((a, b) => a.position - b.position);
    const fromIdx = sorted.findIndex((x) => x.id === fromId);
    if (fromIdx === -1) return;
    const clamped = Math.max(0, Math.min(sorted.length - 1, toIdx));
    if (clamped === fromIdx) return;
    const next = [...sorted];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(clamped, 0, moved);
    const renumbered = next.map((x, i) => ({ ...x, position: i }));
    setChapters(renumbered);
    refocusId.current = fromId;
    const results = await Promise.all(
      renumbered.map((x) =>
        supabase.from("story_chapters").update({ position: x.position }).eq("id", x.id)
      )
    );
    if (results.some((r) => r.error)) {
      toast.error("Não foi possível reordenar");
      load();
    }
  }

  function onGripKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, c: Chapter, idx: number, total: number) {
    const meta = e.metaKey || e.ctrlKey;
    let target: number | null = null;
    if (e.key === "ArrowUp") target = meta ? 0 : idx - 1;
    else if (e.key === "ArrowDown") target = meta ? total - 1 : idx + 1;
    else if (e.key === "Home") target = 0;
    else if (e.key === "End") target = total - 1;
    if (target === null) return;
    e.preventDefault();
    if (target === idx) return;
    void reorderToIndex(c.id, target);
  }

  useEffect(() => {
    if (!refocusId.current) return;
    const el = gripRefs.current[refocusId.current];
    if (el) el.focus();
    refocusId.current = null;
  }, [chapters]);

  async function uploadPhoto(c: Chapter, file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem");
      return;
    }
    setUploadingId(c.id);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (upErr) {
      setUploadingId(null);
      toast.error("Falha no upload");
      return;
    }
    const oldPath = c.storage_path;
    const { error: dbErr } = await supabase
      .from("story_chapters")
      .update({ storage_path: path })
      .eq("id", c.id);
    if (dbErr) {
      await supabase.storage.from(BUCKET).remove([path]);
      setUploadingId(null);
      toast.error("Não foi possível salvar a foto");
      return;
    }
    if (oldPath) {
      await supabase.storage.from(BUCKET).remove([oldPath]);
    }
    const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
    patchLocal(c.id, { storage_path: path, imageUrl: signed?.signedUrl });
    setUploadingId(null);
    toast.success("Foto atualizada");
  }

  const sorted = [...chapters].sort((a, b) => a.position - b.position);

  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--gold)]/20 bg-[var(--ivory)]/85 px-4 py-3 backdrop-blur-xl">
        <Link to="/historia" className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold-deep)]">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="font-serif-caps text-[11px] text-[var(--cocoa)]/70">Editar capítulos</p>
        <button
          onClick={() => setShowPreview((v) => !v)}
          aria-label={showPreview ? "Ocultar preview" : "Mostrar preview"}
          className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold-deep)]"
        >
          {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </header>

      {showPreview && (
        <section className="px-5 pt-4">
          <div className="overflow-hidden rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)] shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between border-b border-[var(--gold)]/15 bg-[var(--ivory)]/70 px-3 py-2">
              <p className="font-serif-caps text-[10px] text-[var(--cocoa)]/70">Preview ao vivo · /historia</p>
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-[var(--gold)] opacity-70" />
                <span className="relative h-2 w-2 rounded-full bg-[var(--gold-deep)]" />
              </span>
            </div>
            <iframe
              key="historia-preview"
              src="/historia"
              title="Preview de Nossa História"
              className="h-[420px] w-full border-0"
              loading="lazy"
            />
          </div>
        </section>
      )}

      <section className="px-5 pt-5">
        <button
          onClick={addChapter}
          disabled={adding}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--gradient-gold,var(--gold))] px-4 py-2.5 font-serif-caps text-[11px] text-[var(--ivory)] shadow-[var(--shadow-card)] disabled:opacity-60"
          style={{ background: "var(--gradient-gold)" }}
        >
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Novo capítulo
        </button>
      </section>

      {loading ? (
        <div className="mt-10 grid place-items-center text-[var(--cocoa)]/50">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <p className="mt-10 px-6 text-center font-display italic text-[var(--cocoa)]/60">
          Nenhum capítulo ainda. Toque em “Novo capítulo” para começar.
        </p>
      ) : (
        <div className="mt-5 space-y-4 px-5 pb-32">
          {sorted.map((c, i) => (
            <article
              key={c.id}
              onDragOver={(e) => {
                if (!dragId || dragId === c.id) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (dragOverId !== c.id) setDragOverId(c.id);
              }}
              onDragLeave={() => {
                if (dragOverId === c.id) setDragOverId(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const fromId = dragId ?? e.dataTransfer.getData("text/plain");
                setDragId(null);
                setDragOverId(null);
                if (fromId) void reorderTo(fromId, c.id);
              }}
              className={`rounded-2xl border bg-[var(--card)] p-4 shadow-[var(--shadow-card)] transition ${
                dragId === c.id
                  ? "opacity-50 border-[var(--gold)]/40"
                  : dragOverId === c.id
                    ? "border-[var(--gold)] ring-2 ring-[var(--gold)]/40"
                    : "border-[var(--gold)]/20"
              }`}
            >
              <div className="flex gap-3">
                <button
                  type="button"
                  ref={(el) => {
                    gripRefs.current[c.id] = el;
                  }}
                  draggable
                  onDragStart={(e) => {
                    setDragId(c.id);
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", c.id);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setDragOverId(null);
                  }}
                  onKeyDown={(e) => onGripKeyDown(e, c, i, sorted.length)}
                  aria-label={`Reordenar capítulo ${i + 1} de ${sorted.length}: ${c.title || "sem título"}. Use as setas para mover, Ctrl+setas ou Home/End para extremos.`}
                  aria-keyshortcuts="ArrowUp ArrowDown Home End"
                  className="grid w-5 flex-none place-items-center self-start py-1 text-[var(--cocoa)]/40 cursor-grab active:cursor-grabbing select-none rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                  title="Arraste ou use as setas para reordenar"
                >
                  <GripVertical className="h-4 w-4" />
                </button>
                <div className="relative aspect-[3/4] w-24 flex-none overflow-hidden rounded-lg bg-[var(--ivory)]">
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-[10px] text-[var(--cocoa)]/40 font-serif-caps">
                      Sem foto
                    </div>
                  )}
                  {uploadingId === c.id && (
                    <div className="absolute inset-0 grid place-items-center bg-[var(--cocoa)]/40 text-[var(--ivory)]">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <input
                    type="text"
                    value={c.date_label}
                    onChange={(e) => patchLocal(c.id, { date_label: e.target.value })}
                    placeholder="Data (ex: Maio · 2025)"
                    className="rounded-md border border-[var(--gold)]/25 bg-[var(--ivory)] px-2 py-1 font-serif-caps text-[10px] text-[var(--cocoa)] focus:border-[var(--gold)] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={c.title}
                    onChange={(e) => patchLocal(c.id, { title: e.target.value })}
                    placeholder="Título"
                    className="rounded-md border border-[var(--gold)]/25 bg-[var(--ivory)] px-2 py-1 font-display text-sm text-[var(--cocoa)] focus:border-[var(--gold)] focus:outline-none"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => move(c, -1)}
                      disabled={i === 0}
                      aria-label="Mover para cima"
                      className="grid h-7 w-7 place-items-center rounded-full border border-[var(--gold)]/25 text-[var(--cocoa)] disabled:opacity-30"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => move(c, 1)}
                      disabled={i === sorted.length - 1}
                      aria-label="Mover para baixo"
                      className="grid h-7 w-7 place-items-center rounded-full border border-[var(--gold)]/25 text-[var(--cocoa)] disabled:opacity-30"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                    <span className="ml-auto font-serif-caps text-[9px] text-[var(--cocoa)]/50">
                      Posição {i + 1}
                    </span>
                  </div>
                </div>
              </div>

              <textarea
                value={c.body}
                onChange={(e) => patchLocal(c.id, { body: e.target.value })}
                placeholder="Conte esse capítulo da história…"
                rows={3}
                className="mt-3 w-full rounded-md border border-[var(--gold)]/25 bg-[var(--ivory)] px-2 py-2 font-display text-sm italic text-[var(--cocoa)] focus:border-[var(--gold)] focus:outline-none"
              />

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  ref={(el) => {
                    fileInputs.current[c.id] = el;
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadPhoto(c, f);
                    if (e.target) e.target.value = "";
                  }}
                />
                <button
                  onClick={() => fileInputs.current[c.id]?.click()}
                  disabled={uploadingId === c.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold)]/30 bg-[var(--ivory)] px-3 py-1.5 font-serif-caps text-[10px] text-[var(--cocoa)] disabled:opacity-50"
                >
                  <Upload className="h-3 w-3" />
                  {c.storage_path ? "Trocar foto" : "Enviar foto"}
                </button>
                <button
                  onClick={() => saveChapter(c)}
                  disabled={savingId === c.id}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-serif-caps text-[10px] text-[var(--ivory)] disabled:opacity-60"
                  style={{ background: "var(--gradient-gold)" }}
                >
                  {savingId === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  Salvar
                </button>
                <button
                  onClick={() => deleteChapter(c)}
                  aria-label="Excluir capítulo"
                  className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[var(--cocoa)]/15 bg-[var(--ivory)] px-3 py-1.5 font-serif-caps text-[10px] text-[var(--cocoa)]/70 hover:text-[var(--cocoa)]"
                >
                  <Trash2 className="h-3 w-3" />
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}
