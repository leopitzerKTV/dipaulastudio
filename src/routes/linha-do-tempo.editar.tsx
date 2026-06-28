import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown, Loader2, Upload, Save, Eye, EyeOff, GripVertical, X, Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/linha-do-tempo/editar")({
  head: () => ({ meta: [{ title: "Editar Linha do Tempo" }] }),
  component: EditarTimeline,
});

const BUCKET = "timeline-photos";

type Milestone = {
  id: string;
  position: number;
  storage_path: string | null;
  date_label: string;
  title: string;
  imageUrl?: string;
};

function EditarTimeline() {
  const [items, setItems] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const gripRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const refocusId = useRef<string | null>(null);

  // Quick-add / edit (foto + texto em um passo só)
  const [newDate, setNewDate] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newPreview, setNewPreview] = useState<string | null>(null);
  const newFileRef = useRef<HTMLInputElement | null>(null);

  function resetNewMilestone() {
    setNewDate("");
    setNewTitle("");
    setNewFile(null);
    setEditingId(null);
    if (newFileRef.current) newFileRef.current.value = "";
  }

  function startEdit(c: Milestone) {
    setNewDate(c.date_label);
    setNewTitle(c.title);
    setNewFile(null);
    setNewPreview(c.imageUrl || null);
    setEditingId(c.id);
    setShowAddCard(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    if (!newFile) {
      if (!editingId) setNewPreview(null);
      return;
    }
    const url = URL.createObjectURL(newFile);
    setNewPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [newFile, editingId]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("timeline_milestones")
      .select("*")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      toast.error("Não foi possível carregar os marcos");
      setLoading(false);
      return;
    }
    const rows = (data ?? []) as Milestone[];
    const paths: string[] = rows.map((r) => r.storage_path).filter((p): p is string => !!p);
    const urlMap = new Map<string, string>();
    if (paths.length > 0) {
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 60 * 60);
      signed?.forEach((s) => {
        if (s.signedUrl && s.path) urlMap.set(s.path, s.signedUrl);
      });
    }
    setItems(rows.map((r) => ({ ...r, imageUrl: r.storage_path ? urlMap.get(r.storage_path) : undefined })));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!dragId) return;
    const EDGE = 110;
    const MAX_SPEED = 22;
    let pointerY: number | null = null;
    let raf = 0;
    const onDragOver = (e: DragEvent) => {
      pointerY = e.clientY;
    };
    const tick = () => {
      if (pointerY != null) {
        const vh = window.innerHeight;
        let delta = 0;
        if (pointerY < EDGE) delta = -Math.ceil(((EDGE - pointerY) / EDGE) * MAX_SPEED);
        else if (pointerY > vh - EDGE) delta = Math.ceil(((pointerY - (vh - EDGE)) / EDGE) * MAX_SPEED);
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

  function patchLocal(id: string, patch: Partial<Milestone>) {
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  // (criação de marcos usa quickAdd abaixo — formulário com foto + texto)


  async function quickAdd() {
    if (!newTitle.trim() && !newDate.trim() && !newFile && !editingId) {
      toast.error("Preencha um título, data ou escolha uma foto");
      return;
    }
    setAdding(true);

    const existing = editingId ? items.find((c) => c.id === editingId) : null;
    let storagePath: string | null = existing?.storage_path ?? null;
    let oldPath: string | null = null;

    if (newFile) {
      if (!newFile.type.startsWith("image/")) {
        setAdding(false);
        toast.error("Selecione uma imagem válida");
        return;
      }
      const ext = newFile.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, newFile, {
        contentType: newFile.type,
        upsert: false,
      });
      if (upErr) {
        setAdding(false);
        toast.error("Falha no upload da foto");
        return;
      }
      oldPath = storagePath;
      storagePath = path;
    }

    if (editingId) {
      const { error } = await supabase
        .from("timeline_milestones")
        .update({ date_label: newDate.trim(), title: newTitle.trim(), storage_path: storagePath })
        .eq("id", editingId);
      if (error) {
        if (newFile && storagePath) await supabase.storage.from(BUCKET).remove([storagePath]);
        setAdding(false);
        toast.error("Não foi possível salvar o marco");
        return;
      }
      if (oldPath && oldPath !== storagePath) await supabase.storage.from(BUCKET).remove([oldPath]);
      let imageUrl: string | undefined;
      if (storagePath) {
        const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 60 * 60);
        imageUrl = signed?.signedUrl;
      }
      setItems((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? { ...c, date_label: newDate.trim(), title: newTitle.trim(), storage_path: storagePath, imageUrl }
            : c
        )
      );
      resetNewMilestone();
      setShowAddCard(false);
      setAdding(false);
      toast.success("Marco salvo");
      return;
    }

    const nextPosition = items.length > 0 ? Math.max(...items.map((c) => c.position)) + 1 : 0;
    const { data, error } = await supabase
      .from("timeline_milestones")
      .insert({
        position: nextPosition,
        date_label: newDate.trim(),
        title: newTitle.trim() || "Novo marco",
        storage_path: storagePath,
      })
      .select()
      .single();
    if (error || !data) {
      if (storagePath) await supabase.storage.from(BUCKET).remove([storagePath]);
      setAdding(false);
      toast.error("Não foi possível criar o marco");
      return;
    }
    let imageUrl: string | undefined;
    if (storagePath) {
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 60 * 60);
      imageUrl = signed?.signedUrl;
    }
    setItems((prev) => [...prev, { ...(data as Milestone), imageUrl }]);
    resetNewMilestone();
    setShowAddCard(false);
    setAdding(false);
    toast.success("Marco adicionado");
  }

  async function saveItem(c: Milestone) {
    setSavingId(c.id);
    const { error } = await supabase
      .from("timeline_milestones")
      .update({ date_label: c.date_label, title: c.title })
      .eq("id", c.id);
    setSavingId(null);
    if (error) {
      toast.error("Não foi possível salvar");
      return;
    }
    toast.success("Marco salvo");
  }

  async function deleteItem(c: Milestone) {
    if (!window.confirm(`Excluir o marco "${c.title || "sem título"}"?`)) return;
    const previous = items;
    setItems((prev) => prev.filter((x) => x.id !== c.id));
    if (c.storage_path) {
      await supabase.storage.from(BUCKET).remove([c.storage_path]);
    }
    const { error } = await supabase.from("timeline_milestones").delete().eq("id", c.id);
    if (error) {
      toast.error("Não foi possível excluir");
      setItems(previous);
      return;
    }
    toast.success("Marco excluído");
  }

  async function move(c: Milestone, direction: -1 | 1) {
    const sorted = [...items].sort((a, b) => a.position - b.position);
    const idx = sorted.findIndex((x) => x.id === c.id);
    const swap = sorted[idx + direction];
    if (!swap) return;
    const a = { ...c, position: swap.position };
    const b = { ...swap, position: c.position };
    setItems((prev) => prev.map((x) => (x.id === a.id ? a : x.id === b.id ? b : x)));
    const [r1, r2] = await Promise.all([
      supabase.from("timeline_milestones").update({ position: a.position }).eq("id", a.id),
      supabase.from("timeline_milestones").update({ position: b.position }).eq("id", b.id),
    ]);
    if (r1.error || r2.error) {
      toast.error("Não foi possível reordenar");
      load();
    }
  }

  async function reorderToIndex(fromId: string, toIdx: number, presorted?: Milestone[]) {
    const sorted = presorted ?? [...items].sort((a, b) => a.position - b.position);
    const fromIdx = sorted.findIndex((x) => x.id === fromId);
    if (fromIdx === -1) return;
    const clamped = Math.max(0, Math.min(sorted.length - 1, toIdx));
    if (clamped === fromIdx) return;
    const next = [...sorted];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(clamped, 0, moved);
    const renumbered = next.map((x, i) => ({ ...x, position: i }));
    setItems(renumbered);
    refocusId.current = fromId;
    const results = await Promise.all(
      renumbered.map((x) =>
        supabase.from("timeline_milestones").update({ position: x.position }).eq("id", x.id)
      )
    );
    if (results.some((r) => r.error)) {
      toast.error("Não foi possível reordenar");
      load();
    }
  }

  async function reorderTo(fromId: string, toId: string) {
    if (fromId === toId) return;
    const sorted = [...items].sort((a, b) => a.position - b.position);
    const toIdx = sorted.findIndex((x) => x.id === toId);
    if (toIdx === -1) return;
    await reorderToIndex(fromId, toIdx, sorted);
  }

  function onGripKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, c: Milestone, idx: number, total: number) {
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
  }, [items]);

  async function uploadPhoto(c: Milestone, file: File) {
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
      .from("timeline_milestones")
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

  const sorted = [...items].sort((a, b) => a.position - b.position);

  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--gold)]/20 bg-[var(--ivory)]/85 px-4 py-3 backdrop-blur-xl">
        <Link to="/linha-do-tempo" className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold-deep)]">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="font-serif-caps text-[11px] text-[var(--cocoa)]/70">Editar marcos</p>
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
              <p className="font-serif-caps text-[10px] text-[var(--cocoa)]/70">Preview ao vivo · /linha-do-tempo</p>
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-[var(--gold)] opacity-70" />
                <span className="relative h-2 w-2 rounded-full bg-[var(--gold-deep)]" />
              </span>
            </div>
            <iframe
              key="timeline-preview"
              src="/linha-do-tempo"
              title="Preview da Linha do Tempo"
              className="h-[420px] w-full border-0"
              loading="lazy"
            />
          </div>
        </section>
      )}

      <section className="px-5 pt-5">
        {showAddCard ? (
          <div className="rounded-2xl border-2 border-dashed border-[var(--gold)]/40 bg-[var(--card)] p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full text-[var(--ivory)]" style={{ background: "var(--gradient-gold)" }}>
                  <Plus className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-display text-base text-[var(--cocoa)]">Adicionar novo marco</p>
                  <p className="font-serif-caps text-[9px] text-[var(--cocoa)]/60">Envie uma foto e escreva data + título</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetNewMilestone();
                  setShowAddCard(false);
                }}
                className="grid h-8 w-8 place-items-center rounded-full text-[var(--cocoa)]/60 transition hover:bg-[var(--gold)]/10 hover:text-[var(--cocoa)]"
                aria-label="Fechar formulário"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => newFileRef.current?.click()}
                className="relative aspect-square w-24 flex-none overflow-hidden rounded-lg border border-dashed border-[var(--gold)]/40 bg-[var(--ivory)] transition hover:border-[var(--gold)]"
                aria-label={newPreview ? "Trocar foto do novo marco" : "Escolher foto do novo marco"}
              >
                {newPreview ? (
                  <img src={newPreview} alt="Pré-visualização" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center gap-1 px-1 text-center text-[var(--cocoa)]/50">
                    <Upload className="h-4 w-4" />
                    <span className="font-serif-caps text-[9px] leading-tight">Escolher foto</span>
                  </div>
                )}
              </button>
              <input
                ref={newFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setNewFile(f);
                }}
              />
              <div className="flex flex-1 flex-col gap-2">
                <input
                  type="text"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  placeholder="Data (ex: 24 · Mai · 2025)"
                  className="rounded-md border border-[var(--gold)]/25 bg-[var(--ivory)] px-2 py-1.5 font-serif-caps text-[10px] text-[var(--cocoa)] focus:border-[var(--gold)] focus:outline-none"
                />
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Título do marco"
                  className="rounded-md border border-[var(--gold)]/25 bg-[var(--ivory)] px-2 py-1.5 font-display text-sm text-[var(--cocoa)] focus:border-[var(--gold)] focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={quickAdd}
                disabled={adding}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 font-serif-caps text-[11px] text-[var(--ivory)] shadow-[var(--shadow-card)] disabled:opacity-60"
                style={{ background: "var(--gradient-gold)" }}
              >
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Adicionar marco
              </button>
              <button
                type="button"
                onClick={() => {
                  resetNewMilestone();
                  setShowAddCard(false);
                }}
                disabled={adding}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[var(--gold)]/40 bg-[var(--ivory)] px-4 py-3 font-serif-caps text-[11px] text-[var(--cocoa)] transition hover:bg-[var(--gold)]/10 disabled:opacity-60"
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddCard(true)}
            className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-[var(--gold)]/40 bg-[var(--card)] p-4 text-left shadow-[var(--shadow-card)] transition hover:border-[var(--gold)]/70"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full text-[var(--ivory)]" style={{ background: "var(--gradient-gold)" }}>
              <Plus className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-base text-[var(--cocoa)]">Adicionar novo marco</p>
              <p className="font-serif-caps text-[9px] text-[var(--cocoa)]/60">Toque para adicionar foto e texto</p>
            </div>
          </button>
        )}
      </section>


      {loading ? (
        <div className="mt-10 grid place-items-center text-[var(--cocoa)]/50">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <p className="mt-10 px-6 text-center font-display italic text-[var(--cocoa)]/60">
          Nenhum marco ainda. Toque em "Adicionar novo marco" para começar.
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
                  aria-label={`Reordenar marco ${i + 1} de ${sorted.length}: ${c.title || "sem título"}. Use as setas para mover, Ctrl+setas ou Home/End para extremos.`}
                  aria-keyshortcuts="ArrowUp ArrowDown Home End"
                  className="grid w-5 flex-none place-items-center self-start py-1 text-[var(--cocoa)]/40 cursor-grab active:cursor-grabbing select-none rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                  title="Arraste ou use as setas para reordenar"
                >
                  <GripVertical className="h-4 w-4" />
                </button>
                <div className="relative aspect-square w-24 flex-none overflow-hidden rounded-lg bg-[var(--ivory)]">
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
                    placeholder="Data (ex: 24 · Mai · 2025)"
                    className="rounded-md border border-[var(--gold)]/25 bg-[var(--ivory)] px-2 py-1 font-serif-caps text-[10px] text-[var(--cocoa)] focus:border-[var(--gold)] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={c.title}
                    onChange={(e) => patchLocal(c.id, { title: e.target.value })}
                    placeholder="Título do marco"
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
                  onClick={() => saveItem(c)}
                  disabled={savingId === c.id}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-serif-caps text-[10px] text-[var(--ivory)] disabled:opacity-60"
                  style={{ background: "var(--gradient-gold)" }}
                >
                  {savingId === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  Salvar
                </button>
                <button
                  onClick={() => deleteItem(c)}
                  aria-label="Excluir marco"
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
