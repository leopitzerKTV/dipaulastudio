import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Loader2, Save, X, Check, Clock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CoupleGate } from "@/components/CoupleGate";
import { Ornament } from "@/components/Ornament";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/presentes/gerir")({
  head: () => ({ meta: [{ title: "Gerir Lista de Presentes" }] }),
  component: () => (
    <CoupleGate>
      <GerirPresentes />
    </CoupleGate>
  ),
});

type Item = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price_cents: number | null;
  currency: string;
  store_url: string | null;
  sort_order: number;
  is_active: boolean;
};

type Reservation = {
  id: string;
  gift_item_id: string;
  guest_name: string;
  guest_email: string;
  status: "reserved" | "purchased" | "cancelled";
  reserved_at: string;
  expires_at: string;
  confirmed_at: string | null;
};

const EMPTY: Omit<Item, "id"> = {
  title: "",
  description: "",
  image_url: "",
  price_cents: null,
  currency: "BRL",
  store_url: "",
  sort_order: 0,
  is_active: true,
};

function GerirPresentes() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [editing, setEditing] = useState<(Partial<Item> & { isNew?: boolean }) | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [{ data: gi, error: gErr }, { data: gr }] = await Promise.all([
      supabase.from("gift_items").select("*").order("sort_order").order("created_at"),
      supabase.from("gift_reservations").select("*").order("reserved_at", { ascending: false }),
    ]);
    if (gErr) {
      toast.error(gErr.message);
      return;
    }
    setItems((gi ?? []) as Item[]);
    setReservations((gr ?? []) as Reservation[]);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing) return;
    const payload = {
      title: (editing.title ?? "").trim(),
      description: editing.description?.toString().trim() || null,
      image_url: editing.image_url?.toString().trim() || null,
      price_cents: editing.price_cents ?? null,
      currency: editing.currency || "BRL",
      store_url: editing.store_url?.toString().trim() || null,
      sort_order: editing.sort_order ?? 0,
      is_active: editing.is_active ?? true,
    };
    if (payload.title.length < 2) {
      toast.error("Informe o título");
      return;
    }
    setBusy(true);
    const { error } = editing.isNew
      ? await supabase.from("gift_items").insert(payload)
      : await supabase.from("gift_items").update(payload).eq("id", editing.id!);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Salvo");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remover este item? Reservas associadas também serão removidas.")) return;
    const { error } = await supabase.from("gift_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removido");
    load();
  };

  const cancelReservation = async (id: string) => {
    if (!confirm("Cancelar esta reserva? O item voltará a ficar disponível.")) return;
    const { error } = await supabase
      .from("gift_reservations")
      .update({ status: "cancelled" })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Reserva cancelada");
    load();
  };

  const activeRes = (itemId: string) =>
    reservations.find(
      (r) =>
        r.gift_item_id === itemId &&
        (r.status === "purchased" ||
          (r.status === "reserved" && new Date(r.expires_at).getTime() > Date.now())),
    );

  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--gold)]/20 bg-[var(--ivory)]/85 px-4 py-3 backdrop-blur-xl">
        <Link to="/painel" className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold-deep)]">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="font-serif-caps text-[11px] text-[var(--cocoa)]/70">Gerir Presentes</p>
        <button
          onClick={() => setEditing({ ...EMPTY, isNew: true })}
          className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gold-deep)] text-white"
          aria-label="Novo presente"
        >
          <Plus className="h-4 w-4" />
        </button>
      </header>

      <section className="px-6 pt-6">
        <Ornament />
        <h1 className="mt-4 text-center font-display text-3xl text-[var(--cocoa)]">Catálogo de Presentes</h1>
        <p className="mx-auto mt-2 max-w-xs text-center text-xs text-[var(--cocoa)]/65">
          Adicione cada presente com nome, foto, preço e link da loja. Os convidados reservam pelo app.
        </p>
      </section>

      <section className="px-4 pt-4">
        {items == null ? (
          <div className="flex justify-center py-12 text-[var(--cocoa)]/60">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)] p-6 text-center text-sm text-[var(--cocoa)]/65">
            Nenhum item ainda. Toque em + para adicionar.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((it) => {
              const res = activeRes(it.id);
              return (
                <li key={it.id} className="rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)] p-3">
                  <div className="flex gap-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--gold)]/10">
                      {it.image_url ? (
                        <img src={it.image_url} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm text-[var(--cocoa)]">{it.title}</p>
                      <p className="text-[11px] text-[var(--cocoa)]/60">
                        {it.price_cents != null
                          ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: it.currency }).format(it.price_cents / 100)
                          : "sem preço"}
                        {" · "}
                        {it.is_active ? "ativo" : "oculto"}
                      </p>
                      {res ? (
                        <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-[var(--cocoa)]/5 px-2 py-0.5 text-[10px] text-[var(--cocoa)]/75">
                          {res.status === "purchased" ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Clock className="h-3 w-3 text-amber-600" />
                          )}
                          {res.status === "purchased" ? "Comprado por " : "Reservado por "}
                          {res.guest_name}
                          <button
                            onClick={() => cancelReservation(res.id)}
                            className="ml-1 text-[var(--cocoa)]/50 hover:text-red-600"
                            title="Cancelar reserva"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setEditing(it)}
                        className="rounded-full bg-[var(--gold)]/15 px-3 py-1 text-[10px] font-serif-caps text-[var(--gold-deep)]"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => remove(it.id)}
                        className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-serif-caps text-red-700"
                      >
                        <Trash2 className="inline h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6 pt-12 sm:items-center">
          <div className="w-full max-w-md rounded-3xl bg-[var(--ivory)] p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-lg text-[var(--cocoa)]">
                {editing.isNew ? "Novo presente" : "Editar presente"}
              </p>
              <button
                onClick={() => setEditing(null)}
                className="grid h-8 w-8 place-items-center rounded-full bg-[var(--cocoa)]/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[70vh] space-y-3 overflow-y-auto">
              <Field label="Título">
                <input
                  value={editing.title ?? ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className={inputCls}
                  maxLength={200}
                />
              </Field>
              <Field label="Descrição">
                <textarea
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className={inputCls}
                  rows={2}
                  maxLength={500}
                />
              </Field>
              <Field label="URL da imagem">
                <input
                  type="url"
                  value={editing.image_url ?? ""}
                  onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                  className={inputCls}
                  placeholder="https://…"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Preço (R$)">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editing.price_cents != null ? (editing.price_cents / 100).toString() : ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setEditing({
                        ...editing,
                        price_cents: v === "" ? null : Math.round(parseFloat(v) * 100),
                      });
                    }}
                    className={inputCls}
                  />
                </Field>
                <Field label="Ordem">
                  <input
                    type="number"
                    value={editing.sort_order ?? 0}
                    onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value || "0", 10) })}
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field label="Link da loja externa">
                <input
                  type="url"
                  value={editing.store_url ?? ""}
                  onChange={(e) => setEditing({ ...editing, store_url: e.target.value })}
                  className={inputCls}
                  placeholder="https://…"
                />
              </Field>
              <label className="flex items-center gap-2 text-sm text-[var(--cocoa)]/75">
                <input
                  type="checkbox"
                  checked={editing.is_active ?? true}
                  onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                />
                Visível para os convidados
              </label>
            </div>
            <button
              onClick={save}
              disabled={busy}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--gold-deep)] px-4 py-2 text-sm font-serif-caps text-white disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar
            </button>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

const inputCls =
  "w-full rounded-xl border border-[var(--gold)]/30 bg-white px-3 py-2 text-sm text-[var(--cocoa)] outline-none focus:border-[var(--gold-deep)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-serif-caps text-[10px] text-[var(--cocoa)]/60">{label}</span>
      {children}
    </label>
  );
}
