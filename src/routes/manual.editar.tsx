import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { CoupleGate } from "@/components/CoupleGate";
import { Ornament } from "@/components/Ornament";
import { supabase } from "@/integrations/supabase/client";

type FormState = {
  ceremony_date: string;
  ceremony_time: string;
  ceremony_location: string;
  parking_info: string;
  location_info: string;
  gift_list_url: string;
  welcome_note: string;
};

const empty: FormState = {
  ceremony_date: "",
  ceremony_time: "",
  ceremony_location: "",
  parking_info: "",
  location_info: "",
  gift_list_url: "",
  welcome_note: "",
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
        setRowId(data.id);
        setForm({
          ceremony_date: data.ceremony_date ?? "",
          ceremony_time: data.ceremony_time ?? "",
          ceremony_location: data.ceremony_location ?? "",
          parking_info: data.parking_info ?? "",
          location_info: data.location_info ?? "",
          gift_list_url: data.gift_list_url ?? "",
          welcome_note: data.welcome_note ?? "",
        });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ceremony_date: form.ceremony_date.trim() || null,
      ceremony_time: form.ceremony_time.trim() || null,
      ceremony_location: form.ceremony_location.trim() || null,
      parking_info: form.parking_info.trim() || null,
      location_info: form.location_info.trim() || null,
      gift_list_url: form.gift_list_url.trim() || null,
      welcome_note: form.welcome_note.trim() || null,
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
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--gold-deep)]" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="px-6 pt-8">
        <Link
          to="/manual"
          className="inline-flex items-center gap-1.5 text-xs font-serif-caps text-[var(--gold-deep)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar
        </Link>

        <div className="mt-3 text-center">
          <p className="font-serif-caps text-[10px] text-[var(--gold-deep)]">Edição</p>
          <Ornament className="mt-3" />
          <h1 className="mt-3 font-display text-3xl text-[var(--cocoa)]">Manual do Convidado</h1>
          <p className="mt-1 text-xs text-[var(--cocoa)]/60">
            Preencha os campos abaixo. As seções fixas (dress code, bolo, pista) já estão prontas.
          </p>
        </div>

        <form onSubmit={save} className="mt-6 space-y-5">
          <Group title="Boas-vindas">
            <Field label="Mensagem de boas-vindas (opcional)">
              <textarea
                value={form.welcome_note}
                onChange={update("welcome_note")}
                rows={4}
                maxLength={600}
                placeholder="Deixe em branco para usar o texto padrão."
                className={textareaCls}
              />
            </Field>
          </Group>

          <Group title="Cerimônia">
            <Field label="Data">
              <input
                type="text"
                value={form.ceremony_date}
                onChange={update("ceremony_date")}
                maxLength={80}
                placeholder="Ex: Sábado, 24 de Maio de 2025"
                className={inputCls}
              />
            </Field>
            <Field label="Horário">
              <input
                type="text"
                value={form.ceremony_time}
                onChange={update("ceremony_time")}
                maxLength={40}
                placeholder="Ex: 16h30"
                className={inputCls}
              />
            </Field>
            <Field label="Local">
              <input
                type="text"
                value={form.ceremony_location}
                onChange={update("ceremony_location")}
                maxLength={160}
                placeholder="Ex: Espaço Jardim Secreto — São Paulo/SP"
                className={inputCls}
              />
            </Field>
          </Group>

          <Group title="Transporte e Estacionamento">
            <Field label="Estacionamento">
              <input
                type="text"
                value={form.parking_info}
                onChange={update("parking_info")}
                maxLength={160}
                placeholder="Ex: Valet no local · R$ 40"
                className={inputCls}
              />
            </Field>
            <Field label="Localização / endereço completo">
              <input
                type="text"
                value={form.location_info}
                onChange={update("location_info")}
                maxLength={200}
                placeholder="Ex: Rua das Flores, 123 — Jardins, SP"
                className={inputCls}
              />
            </Field>
          </Group>

          <Group title="Lista de presentes">
            <Field label="Link da lista (opcional)">
              <input
                type="url"
                value={form.gift_list_url}
                onChange={update("gift_list_url")}
                maxLength={500}
                placeholder="https://…"
                className={inputCls}
              />
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
      </section>
    </AppShell>
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
