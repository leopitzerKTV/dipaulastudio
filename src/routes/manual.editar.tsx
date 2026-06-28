import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Save, Loader2, Eye, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { CoupleGate } from "@/components/CoupleGate";
import { Ornament } from "@/components/Ornament";
import { ManualView, type ManualData, MANUAL_DEFAULTS } from "@/components/ManualView";
import { supabase } from "@/integrations/supabase/client";
import { downloadBlob, generateManualPdf, sharePdf } from "@/lib/manual-pdf";


type FormState = {
  ceremony_date: string;
  ceremony_time: string;
  ceremony_location: string;
  parking_info: string;
  location_info: string;
  gift_list_url: string;
  welcome_note: string;
  dress_code_note: string;
  ceremony_note: string;
  during_ceremony_note: string;
  reception_note: string;
  cake_note: string;
  dancefloor_note: string;
  album_note: string;
  gift_note: string;
  transport_note: string;
  closing_note: string;
};

const empty: FormState = {
  ceremony_date: "",
  ceremony_time: "",
  ceremony_location: "",
  parking_info: "",
  location_info: "",
  gift_list_url: "",
  welcome_note: "",
  dress_code_note: "",
  ceremony_note: "",
  during_ceremony_note: "",
  reception_note: "",
  cake_note: "",
  dancefloor_note: "",
  album_note: "",
  gift_note: "",
  transport_note: "",
  closing_note: "",
};

export const Route = createFileRoute("/manual/editar")({
  head: () => ({
    meta: [{ title: "Editar Manual do Convidado" }],
  }),
  component: () => (
    <CoupleGate>
      <EditManual />
    </CoupleGate>
  ),
});

function EditManual() {
  const nav = useNavigate();
  const [form, setForm] = useState<FormState>(empty);
  const [rowId, setRowId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [pdfBusy, setPdfBusy] = useState<null | "download" | "share">(null);
  const previewRef = useRef<HTMLDivElement>(null);

  async function exportPdf(mode: "download" | "share") {
    if (!previewRef.current) return;
    setPdfBusy(mode);
    try {
      const blob = await generateManualPdf(previewRef.current);
      if (mode === "share") {
        const shared = await sharePdf(
          blob,
          "manual-do-convidado.pdf",
          "Manual do Convidado — Amanda & Ricardo",
          "Tudo o que você precisa saber para celebrar conosco ✨",
        );
        if (!shared) {
          downloadBlob(blob, "manual-do-convidado.pdf");
          toast.success("Compartilhamento não suportado — baixamos o PDF");
        }
      } else {
        downloadBlob(blob, "manual-do-convidado.pdf");
        toast.success("PDF baixado");
      }
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível gerar o PDF");
    } finally {
      setPdfBusy(null);
    }
  }


  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("guest_manual")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (error) toast.error("Erro ao carregar manual");
      if (data) {
        const d = data as Record<string, string | null>;
        setRowId(data.id as string);
        setForm({
          ceremony_date: d.ceremony_date ?? "",
          ceremony_time: d.ceremony_time ?? "",
          ceremony_location: d.ceremony_location ?? "",
          parking_info: d.parking_info ?? "",
          location_info: d.location_info ?? "",
          gift_list_url: d.gift_list_url ?? "",
          welcome_note: d.welcome_note ?? "",
          dress_code_note: d.dress_code_note ?? "",
          ceremony_note: d.ceremony_note ?? "",
          during_ceremony_note: d.during_ceremony_note ?? "",
          reception_note: d.reception_note ?? "",
          cake_note: d.cake_note ?? "",
          dancefloor_note: d.dancefloor_note ?? "",
          album_note: d.album_note ?? "",
          gift_note: d.gift_note ?? "",
          transport_note: d.transport_note ?? "",
          closing_note: d.closing_note ?? "",
        });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const previewData: ManualData = useMemo(
    () => ({
      ceremony_date: form.ceremony_date || null,
      ceremony_time: form.ceremony_time || null,
      ceremony_location: form.ceremony_location || null,
      parking_info: form.parking_info || null,
      location_info: form.location_info || null,
      gift_list_url: form.gift_list_url || null,
      welcome_note: form.welcome_note || null,
      dress_code_note: form.dress_code_note || null,
      ceremony_note: form.ceremony_note || null,
      during_ceremony_note: form.during_ceremony_note || null,
      reception_note: form.reception_note || null,
      cake_note: form.cake_note || null,
      dancefloor_note: form.dancefloor_note || null,
      album_note: form.album_note || null,
      gift_note: form.gift_note || null,
      transport_note: form.transport_note || null,
      closing_note: form.closing_note || null,
    }),
    [form],
  );

  const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const trimOrNull = (v: string) => (v.trim() ? v.trim() : null);
    const payload = {
      ceremony_date: trimOrNull(form.ceremony_date),
      ceremony_time: trimOrNull(form.ceremony_time),
      ceremony_location: trimOrNull(form.ceremony_location),
      parking_info: trimOrNull(form.parking_info),
      location_info: trimOrNull(form.location_info),
      gift_list_url: trimOrNull(form.gift_list_url),
      welcome_note: trimOrNull(form.welcome_note),
      dress_code_note: trimOrNull(form.dress_code_note),
      ceremony_note: trimOrNull(form.ceremony_note),
      during_ceremony_note: trimOrNull(form.during_ceremony_note),
      reception_note: trimOrNull(form.reception_note),
      cake_note: trimOrNull(form.cake_note),
      dancefloor_note: trimOrNull(form.dancefloor_note),
      album_note: trimOrNull(form.album_note),
      gift_note: trimOrNull(form.gift_note),
      transport_note: trimOrNull(form.transport_note),
      closing_note: trimOrNull(form.closing_note),
    };
    const res = rowId
      ? await supabase.from("guest_manual").update(payload).eq("id", rowId)
      : await supabase.from("guest_manual").insert(payload);
    setSaving(false);
    if (res.error) {
      toast.error("Não foi possível salvar");
      return;
    }
    toast.success("Manual atualizado");
    nav({ to: "/manual" });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--gold-deep)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Topbar */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--gold)]/20 bg-[var(--ivory)]/85 px-5 py-3 backdrop-blur">
        <Link to="/manual" className="inline-flex items-center gap-1.5 text-xs font-serif-caps text-[var(--gold-deep)]">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar
        </Link>
        <p className="font-display text-sm text-[var(--cocoa)]">Editar Manual</p>
        <button
          onClick={() => setMobilePreviewOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold)]/40 px-3 py-1 text-[10px] font-serif-caps text-[var(--gold-deep)] lg:hidden"
        >
          <Eye className="h-3 w-3" /> {mobilePreviewOpen ? "Form" : "Preview"}
        </button>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_minmax(340px,420px)]">
        {/* Form column */}
        <div className={mobilePreviewOpen ? "hidden lg:block" : "block"}>
          <div className="text-center">
            <p className="font-serif-caps text-[10px] text-[var(--gold-deep)]">Edição</p>
            <Ornament className="mt-3" />
            <h1 className="mt-3 font-display text-3xl text-[var(--cocoa)]">Manual do Convidado</h1>
            <p className="mt-1 text-xs text-[var(--cocoa)]/60">
              Personalize a descrição de cada item. Deixe em branco para usar o texto padrão.
            </p>
          </div>

          <form onSubmit={save} className="mt-6 space-y-5">
            <Group title="Boas-vindas">
              <Field label="Mensagem de boas-vindas">
                <textarea value={form.welcome_note} onChange={update("welcome_note")} rows={4} maxLength={800} placeholder={MANUAL_DEFAULTS.welcome_note} className={textareaCls} />
              </Field>
            </Group>

            <Group title="Dress Code">
              <Field label="Descrição">
                <textarea value={form.dress_code_note} onChange={update("dress_code_note")} rows={5} maxLength={800} placeholder={MANUAL_DEFAULTS.dress_code_note} className={textareaCls} />
              </Field>
            </Group>

            <Group title="Cerimônia">
              <Field label="Descrição da cerimônia">
                <textarea value={form.ceremony_note} onChange={update("ceremony_note")} rows={4} maxLength={800} placeholder={MANUAL_DEFAULTS.ceremony_note} className={textareaCls} />
              </Field>
              <Field label="Data">
                <input type="text" value={form.ceremony_date} onChange={update("ceremony_date")} maxLength={80} placeholder="Ex: Sábado, 24 de Maio de 2025" className={inputCls} />
              </Field>
              <Field label="Horário">
                <input type="text" value={form.ceremony_time} onChange={update("ceremony_time")} maxLength={40} placeholder="Ex: 16h30" className={inputCls} />
              </Field>
              <Field label="Local">
                <input type="text" value={form.ceremony_location} onChange={update("ceremony_location")} maxLength={160} placeholder="Ex: Espaço Jardim Secreto — São Paulo/SP" className={inputCls} />
              </Field>
            </Group>

            <Group title="Durante a Cerimônia">
              <Field label="Descrição">
                <textarea value={form.during_ceremony_note} onChange={update("during_ceremony_note")} rows={4} maxLength={800} placeholder={MANUAL_DEFAULTS.during_ceremony_note} className={textareaCls} />
              </Field>
            </Group>

            <Group title="Recepção e Buffet">
              <Field label="Descrição">
                <textarea value={form.reception_note} onChange={update("reception_note")} rows={4} maxLength={800} placeholder={MANUAL_DEFAULTS.reception_note} className={textareaCls} />
              </Field>
            </Group>

            <Group title="Momento do Bolo e Brinde">
              <Field label="Descrição">
                <textarea value={form.cake_note} onChange={update("cake_note")} rows={4} maxLength={800} placeholder={MANUAL_DEFAULTS.cake_note} className={textareaCls} />
              </Field>
            </Group>

            <Group title="Abertura da Pista">
              <Field label="Descrição">
                <textarea value={form.dancefloor_note} onChange={update("dancefloor_note")} rows={4} maxLength={800} placeholder={MANUAL_DEFAULTS.dancefloor_note} className={textareaCls} />
              </Field>
            </Group>

            <Group title="Álbum Colaborativo">
              <Field label="Descrição">
                <textarea value={form.album_note} onChange={update("album_note")} rows={3} maxLength={500} placeholder={MANUAL_DEFAULTS.album_note} className={textareaCls} />
              </Field>
            </Group>

            <Group title="Lista de Presentes">
              <Field label="Descrição">
                <textarea value={form.gift_note} onChange={update("gift_note")} rows={3} maxLength={500} placeholder={MANUAL_DEFAULTS.gift_note} className={textareaCls} />
              </Field>
              <Field label="Link da lista (opcional)">
                <input type="url" value={form.gift_list_url} onChange={update("gift_list_url")} maxLength={500} placeholder="https://…" className={inputCls} />
              </Field>
            </Group>

            <Group title="Transporte e Estacionamento">
              <Field label="Observações (opcional)">
                <textarea value={form.transport_note} onChange={update("transport_note")} rows={3} maxLength={500} placeholder="Ex: dicas de carona, valet, app de transporte…" className={textareaCls} />
              </Field>
              <Field label="Estacionamento">
                <input type="text" value={form.parking_info} onChange={update("parking_info")} maxLength={160} placeholder="Ex: Valet no local · R$ 40" className={inputCls} />
              </Field>
              <Field label="Localização / endereço completo">
                <input type="text" value={form.location_info} onChange={update("location_info")} maxLength={200} placeholder="Ex: Rua das Flores, 123 — Jardins, SP" className={inputCls} />
              </Field>
            </Group>

            <Group title="Mensagem de encerramento">
              <Field label="Descrição">
                <textarea value={form.closing_note} onChange={update("closing_note")} rows={4} maxLength={800} placeholder={MANUAL_DEFAULTS.closing_note} className={textareaCls} />
              </Field>
            </Group>

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--gold-deep)] py-3.5 font-serif-caps text-xs text-white shadow-[var(--shadow-card)] disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Salvando…" : "Salvar manual"}
            </button>
          </form>
        </div>

        {/* Preview column */}
        <div className={mobilePreviewOpen ? "block" : "hidden lg:block"}>
          <div className="lg:sticky lg:top-20">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-serif-caps text-[10px] text-[var(--gold-deep)]">Preview ao vivo</p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => exportPdf("download")}
                  disabled={pdfBusy !== null}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--gold)]/40 bg-white/60 px-2.5 py-1 text-[10px] font-serif-caps text-[var(--gold-deep)] disabled:opacity-50"
                >
                  {pdfBusy === "download" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />} PDF
                </button>
                <button
                  type="button"
                  onClick={() => exportPdf("share")}
                  disabled={pdfBusy !== null}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--gold-deep)] px-2.5 py-1 text-[10px] font-serif-caps text-white disabled:opacity-50"
                >
                  {pdfBusy === "share" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Share2 className="h-3 w-3" />} Compartilhar
                </button>
              </div>
            </div>
            <div className="mx-auto w-full max-w-sm overflow-hidden rounded-[2rem] border border-[var(--gold)]/30 bg-[var(--ivory)] shadow-[var(--shadow-luxe)]">
              <div className="max-h-[78vh] overflow-y-auto">
                <ManualView data={previewData} linkAlbum={false} innerRef={previewRef} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-[var(--gold)]/30 bg-white/70 px-3.5 py-2.5 text-sm text-[var(--cocoa)] outline-none focus:border-[var(--gold-deep)]";
const textareaCls = inputCls + " resize-none leading-relaxed";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)] p-4 shadow-[var(--shadow-card)]">
      <p className="font-serif-caps text-[10px] text-[var(--gold-deep)]">{title}</p>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-display text-sm text-[var(--cocoa)]/80">{label}</span>
      {children}
    </label>
  );
}
