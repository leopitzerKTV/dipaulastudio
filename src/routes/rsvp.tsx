import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Heart, Loader2, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Ornament } from "@/components/Ornament";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/rsvp")({
  head: () => ({
    meta: [
      { title: "Confirmação de Presença — Amanda & Ricardo" },
      {
        name: "description",
        content:
          "Confirme sua presença no casamento de Amanda & Ricardo. Diga se virá, quantos acompanhantes e deixe uma mensagem para os noivos.",
      },
    ],
  }),
  component: RsvpPage,
});

function RsvpPage() {
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<"yes" | "no" | "">("");
  const [partySize, setPartySize] = useState(1);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | { attending: boolean; name: string }>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      toast.error("Informe seu nome completo.");
      return;
    }
    if (attending === "") {
      toast.error("Selecione se você poderá comparecer.");
      return;
    }
    const willAttend = attending === "yes";
    const size = willAttend ? Math.min(20, Math.max(1, Math.round(partySize))) : 1;
    const msg = message.trim().slice(0, 1000);

    setSubmitting(true);
    const { error } = await supabase.from("rsvp_responses").insert({
      guest_name: trimmed,
      attending: willAttend,
      party_size: size,
      message: msg.length ? msg : null,
    });
    setSubmitting(false);

    if (error) {
      toast.error("Não foi possível enviar agora. Tente novamente em instantes.");
      return;
    }
    setDone({ attending: willAttend, name: trimmed });
  };

  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--gold)]/20 bg-[var(--ivory)]/85 px-4 py-3 backdrop-blur-xl">
        <Link
          to="/"
          className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold-deep)]"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="font-serif-caps text-[11px] text-[var(--cocoa)]/70">RSVP</p>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold-deep)]">
          <Heart className="h-4 w-4" />
        </span>
      </header>

      <section className="px-6 pt-6 text-center">
        <p className="font-serif-caps text-[10px] text-[var(--gold-deep)]">Confirmação de Presença</p>
        <Ornament className="mt-3" />
        <h1 className="mt-3 font-display text-[36px] leading-none text-[var(--cocoa)]">
          Amanda <span className="italic text-[var(--gold-deep)]">&</span> Ricardo
        </h1>
        <p className="mx-auto mt-2 max-w-xs font-display italic text-sm text-[var(--cocoa)]/70">
          Sua resposta é muito importante para nós ✨
        </p>
      </section>

      {done ? (
        <div className="px-6 pt-8">
          <div className="rounded-3xl border border-[var(--gold)]/30 bg-[var(--card)] p-6 text-center shadow-[var(--shadow-luxe)]">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[var(--gold)]/15 text-[var(--gold-deep)]">
              <Check className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-display text-2xl text-[var(--cocoa)]">Obrigado, {done.name.split(" ")[0]}!</h2>
            <p className="mt-2 text-sm text-[var(--cocoa)]/70">
              {done.attending
                ? "Sua presença está confirmada. Mal podemos esperar para celebrar com você."
                : "Sentiremos sua falta. Obrigado por nos avisar com carinho."}
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-[var(--gold-deep)] px-5 py-2 text-xs font-serif-caps text-white"
            >
              Voltar ao convite
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="px-6 pt-6 pb-12 space-y-5">
          <Field label="Nome do convidado">
            <input
              type="text"
              required
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como prefere ser chamado(a)"
              className="w-full rounded-xl border border-[var(--gold)]/30 bg-white/70 px-4 py-3 text-sm text-[var(--cocoa)] outline-none focus:border-[var(--gold-deep)] focus:bg-white"
            />
          </Field>

          <Field label="Vai comparecer?">
            <div className="grid grid-cols-2 gap-3">
              <RadioCard
                checked={attending === "yes"}
                onClick={() => setAttending("yes")}
                title="Sim"
                subtitle="Estarei presente"
              />
              <RadioCard
                checked={attending === "no"}
                onClick={() => setAttending("no")}
                title="Não"
                subtitle="Não poderei ir"
              />
            </div>
          </Field>

          {attending === "yes" && (
            <Field label="Quantidade de pessoas (incluindo você)">
              <div className="flex items-center gap-3 rounded-xl border border-[var(--gold)]/30 bg-white/70 px-4 py-2.5">
                <Users className="h-4 w-4 text-[var(--gold-deep)]" />
                <button
                  type="button"
                  onClick={() => setPartySize((n) => Math.max(1, n - 1))}
                  className="grid h-8 w-8 place-items-center rounded-full bg-[var(--gold)]/15 text-[var(--gold-deep)]"
                  aria-label="Diminuir"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={partySize}
                  onChange={(e) => setPartySize(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
                  className="w-14 bg-transparent text-center font-display text-xl text-[var(--cocoa)] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setPartySize((n) => Math.min(20, n + 1))}
                  className="grid h-8 w-8 place-items-center rounded-full bg-[var(--gold)]/15 text-[var(--gold-deep)]"
                  aria-label="Aumentar"
                >
                  +
                </button>
                <span className="ml-auto text-xs text-[var(--cocoa)]/60">máx. 20</span>
              </div>
            </Field>
          )}

          <Field label="Mensagem (opcional)">
            <textarea
              rows={4}
              maxLength={1000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Deixe um recado carinhoso para os noivos…"
              className="w-full resize-y rounded-xl border border-[var(--gold)]/30 bg-white/70 px-4 py-3 text-sm text-[var(--cocoa)] outline-none focus:border-[var(--gold-deep)] focus:bg-white"
            />
            <p className="mt-1 text-right text-[10px] text-[var(--cocoa)]/45">{message.length}/1000</p>
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--gold-deep)] px-5 py-3 text-sm font-serif-caps text-white shadow-[var(--shadow-luxe)] disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
            Enviar confirmação
          </button>
        </form>
      )}
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block font-serif-caps text-[10px] tracking-wider text-[var(--cocoa)]/65">{label}</span>
      {children}
    </label>
  );
}

function RadioCard({
  checked,
  onClick,
  title,
  subtitle,
}: {
  checked: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-left transition ${
        checked
          ? "border-[var(--gold-deep)] bg-[var(--gold)]/15 shadow-[var(--shadow-card)]"
          : "border-[var(--gold)]/25 bg-white/60 hover:bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-lg text-[var(--cocoa)]">{title}</span>
        <span
          className={`grid h-5 w-5 place-items-center rounded-full border ${
            checked ? "border-[var(--gold-deep)] bg-[var(--gold-deep)] text-white" : "border-[var(--gold)]/40"
          }`}
        >
          {checked && <Check className="h-3 w-3" />}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-[var(--cocoa)]/60">{subtitle}</p>
    </button>
  );
}
