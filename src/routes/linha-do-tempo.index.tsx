import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, Gem, Sparkles, PartyPopper, Plane, Pencil } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Ornament } from "@/components/Ornament";
import proposal from "@/assets/proposal.jpg";
import ceremony from "@/assets/ceremony.jpg";
import party from "@/assets/party.jpg";
import honeymoon from "@/assets/honeymoon.jpg";

export const Route = createFileRoute("/linha-do-tempo/")({
  head: () => ({ meta: [{ title: "Linha do Tempo — Amanda & Ricardo" }] }),
  component: Timeline,
});

const milestones = [
  { Icon: Gem, title: "Pedido de Casamento", date: "12 · Mai · 2023", img: proposal },
  { Icon: Sparkles, title: "Nosso Casamento", date: "24 · Mai · 2025", img: ceremony },
  { Icon: PartyPopper, title: "A Festa", date: "24 · Mai · 2025", img: party },
  { Icon: Plane, title: "Lua de Mel", date: "27 · Mai · 2025", img: honeymoon },
];

function Timeline() {
  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--gold)]/20 bg-[var(--ivory)]/85 px-4 py-3 backdrop-blur-xl">
        <Link to="/" className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold-deep)]">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="font-serif-caps text-[11px] text-[var(--cocoa)]/70">Linha do Tempo</p>
        <span className="h-9 w-9" />
      </header>

      <section className="px-6 pt-6 text-center">
        <Ornament />
        <h1 className="mt-4 font-display text-4xl text-[var(--cocoa)]">Linha do <span className="italic gold-text">Tempo</span></h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-[var(--cocoa)]/65">Do pedido à lua de mel — tudo organizado para vocês reviverem.</p>
        <Link
          to="/linha-do-tempo/editar"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[var(--gold)]/35 bg-[var(--card)] px-4 py-1.5 font-serif-caps text-[10px] text-[var(--cocoa)] transition hover:bg-[var(--gold)]/10"
        >
          <Pencil className="h-3 w-3" /> Editar marcos
        </Link>
      </section>

      <div className="relative mt-10 px-6">
        <span className="absolute left-[2.65rem] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--gold)]/50 to-transparent" />
        <div className="space-y-6">
          {milestones.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="relative flex items-center gap-4"
            >
              <div className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[var(--gold)]/40 bg-[var(--ivory)] text-[var(--gold-deep)] shadow-[var(--shadow-card)]">
                <m.Icon className="h-5 w-5" strokeWidth={1.4} />
              </div>
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)] p-2 pr-4 shadow-[var(--shadow-card)]">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                  <img src={m.img} alt={m.title} className="h-full w-full object-cover" loading="lazy" width={896} height={1600} />
                </div>
                <div className="flex-1">
                  <p className="font-display text-lg leading-tight text-[var(--cocoa)]">{m.title}</p>
                  <p className="font-serif-caps text-[10px] text-[var(--gold-deep)]">{m.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Ornament className="mt-12" />
      <p className="mt-3 text-center font-display italic text-sm text-[var(--cocoa)]/70">e o melhor ainda está por vir…</p>
    </AppShell>
  );
}