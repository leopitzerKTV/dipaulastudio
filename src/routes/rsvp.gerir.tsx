import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Loader2, Trash2, Users, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Ornament } from "@/components/Ornament";
import { CoupleGate } from "@/components/CoupleGate";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/rsvp/gerir")({
  head: () => ({ meta: [{ title: "Confirmações de Presença — Painel" }] }),
  component: () => (
    <CoupleGate>
      <RsvpManage />
    </CoupleGate>
  ),
});

type Rsvp = {
  id: string;
  guest_name: string;
  attending: boolean;
  party_size: number;
  message: string | null;
  created_at: string;
};

function RsvpManage() {
  const [items, setItems] = useState<Rsvp[] | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("rsvp_responses")
      .select("id, guest_name, attending, party_size, message, created_at")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast.error("Erro ao carregar respostas.");
      return;
    }
    setItems((data ?? []) as Rsvp[]);
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const list = items ?? [];
    const yes = list.filter((r) => r.attending);
    const no = list.filter((r) => !r.attending);
    const guests = yes.reduce((acc, r) => acc + (r.party_size || 1), 0);
    return { total: list.length, yes: yes.length, no: no.length, guests };
  }, [items]);

  const remove = async (id: string) => {
    if (!confirm("Excluir esta confirmação?")) return;
    const { error } = await supabase.from("rsvp_responses").delete().eq("id", id);
    if (error) {
      toast.error("Não foi possível excluir.");
      return;
    }
    toast.success("Confirmação removida.");
    setItems((prev) => (prev ?? []).filter((r) => r.id !== id));
  };

  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--gold)]/20 bg-[var(--ivory)]/85 px-4 py-3 backdrop-blur-xl">
        <Link to="/painel" className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold-deep)]">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="font-serif-caps text-[11px] text-[var(--cocoa)]/70">RSVP — Gestão</p>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold-deep)]">
          <Users className="h-4 w-4" />
        </span>
      </header>

      <section className="px-6 pt-6">
        <Ornament />
        <h1 className="mt-3 text-center font-display text-3xl text-[var(--cocoa)]">Confirmações</h1>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat label="Respostas" value={stats.total} />
          <Stat label="Confirmados" value={stats.yes} accent />
          <Stat label="Pessoas" value={stats.guests} />
        </div>

        <div className="mt-6 space-y-3">
          {loading && !items && (
            <div className="flex justify-center py-10 text-[var(--gold-deep)]">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
          {items && items.length === 0 && (
            <p className="rounded-2xl border border-dashed border-[var(--gold)]/30 bg-white/50 p-6 text-center text-sm text-[var(--cocoa)]/60">
              Ainda não há respostas. Compartilhe o link <code className="font-mono">/rsvp</code> com seus convidados.
            </p>
          )}
          {items?.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)] p-4 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg text-[var(--cocoa)]">{r.guest_name}</p>
                  <p className="mt-0.5 font-serif-caps text-[10px] text-[var(--cocoa)]/55">
                    {new Date(r.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-serif-caps ${
                    r.attending ? "bg-[var(--gold)]/20 text-[var(--gold-deep)]" : "bg-[var(--cocoa)]/10 text-[var(--cocoa)]/70"
                  }`}
                >
                  {r.attending ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  {r.attending ? `Sim · ${r.party_size}` : "Não vai"}
                </span>
              </div>
              {r.message && (
                <p className="mt-3 whitespace-pre-wrap rounded-xl bg-[var(--ivory)]/70 px-3 py-2 text-sm italic text-[var(--cocoa)]/80">
                  “{r.message}”
                </p>
              )}
              <button
                onClick={() => remove(r.id)}
                className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--cocoa)]/55 hover:text-red-600"
              >
                <Trash2 className="h-3 w-3" /> Excluir
              </button>
            </article>
          ))}
        </div>

        <div className="h-10" />
      </section>
    </AppShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-4 text-center ${
        accent ? "border-[var(--gold-deep)]/40 bg-[var(--gold)]/10" : "border-[var(--gold)]/25 bg-[var(--card)]"
      }`}
    >
      <p className="font-display text-2xl text-[var(--cocoa)]">{value}</p>
      <p className="font-serif-caps text-[9px] text-[var(--cocoa)]/55">{label}</p>
    </div>
  );
}
