import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Users,
  CalendarHeart,
  Image as ImageIcon,
  MessageCircle,
  Gift,
  Lock,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Ornament } from "@/components/Ornament";

export const Route = createFileRoute("/painel")({
  head: () => ({ meta: [{ title: "Painel do Casal — Amanda & Ricardo" }] }),
  component: Painel,
});

const stats = [
  { Icon: CalendarHeart, label: "Dias restantes", value: "47" },
  { Icon: Users, label: "Confirmados", value: "128" },
  { Icon: ImageIcon, label: "Fotos no álbum", value: "347" },
  { Icon: MessageCircle, label: "Mensagens", value: "92" },
];

const guests = [
  { name: "Família da noiva", count: 42, color: "var(--gold)" },
  { name: "Família do noivo", count: 38, color: "var(--gold-deep)" },
  { name: "Amigos próximos", count: 48, color: "var(--blush)" },
];

const gifts = [
  { name: "Jogo de panelas Tramontina", giver: "Ana & João", price: "R$ 890" },
  { name: "Jantar romântico — Tuju", giver: "Pedro M.", price: "R$ 1.200" },
  { name: "Diária Hotel Fasano", giver: "Lucia C.", price: "R$ 2.450" },
];

function Painel() {
  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--gold)]/20 bg-[var(--ivory)]/85 px-4 py-3 backdrop-blur-xl">
        <Link
          to="/"
          className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold-deep)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="font-serif-caps text-[11px] text-[var(--cocoa)]/70">Painel Privado</p>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold-deep)]">
          <Lock className="h-4 w-4" />
        </span>
      </header>

      <section className="px-6 pt-6">
        <Ornament />
        <h1 className="mt-4 text-center font-display text-4xl text-[var(--cocoa)]">
          Painel do <span className="italic gold-text">Casal</span>
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-center text-sm text-[var(--cocoa)]/65">
          Acompanhe RSVP, presentes e mensagens — apenas vocês dois.
        </p>

        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative mt-6 overflow-hidden rounded-3xl p-6 text-[var(--ivory)] shadow-[var(--shadow-luxe)]"
          style={{ background: "linear-gradient(140deg, #3a2a1c, #6a4a26 60%, #c9a55b)" }}
        >
          <p className="font-serif-caps text-[10px] opacity-80">A · R</p>
          <p className="mt-3 font-display text-3xl">Amanda & Ricardo</p>
          <p className="font-display italic text-sm opacity-85">24 · Maio · 2025</p>
          <div className="mt-5 h-px bg-[var(--ivory)]/30" />
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="font-serif-caps text-[9px] opacity-75">Total arrecadado</p>
              <p className="font-display text-2xl">R$ 24.870</p>
            </div>
            <div className="text-right">
              <p className="font-serif-caps text-[9px] opacity-75">de R$ 38.000</p>
              <p className="font-display text-base">65%</p>
            </div>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--ivory)]/20">
            <div className="h-full w-[65%] rounded-full bg-[var(--ivory)]" />
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
              className="rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)] p-4 shadow-[var(--shadow-card)]"
            >
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold-deep)]">
                <s.Icon className="h-4 w-4" strokeWidth={1.4} />
              </div>
              <p className="mt-3 font-display text-3xl text-[var(--cocoa)]">{s.value}</p>
              <p className="font-serif-caps text-[9px] text-[var(--cocoa)]/55">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Guests breakdown */}
        <div className="mt-6 rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg text-[var(--cocoa)]">Confirmações</p>
            <p className="font-serif-caps text-[10px] text-[var(--gold-deep)]">128 / 180</p>
          </div>
          <div className="mt-4 space-y-3">
            {guests.map((g) => (
              <div key={g.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--cocoa)]/75">{g.name}</span>
                  <span className="font-display text-[var(--cocoa)]">{g.count}</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--muted)]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(g.count / 60) * 100}%`, background: g.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gifts */}
        <div className="mt-5 rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg text-[var(--cocoa)]">Últimos presentes</p>
            <Gift className="h-4 w-4 text-[var(--gold-deep)]" />
          </div>
          <ul className="mt-3 divide-y divide-[var(--gold)]/15">
            {gifts.map((g) => (
              <li key={g.name} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm text-[var(--cocoa)]">{g.name}</p>
                  <p className="font-serif-caps text-[9px] text-[var(--cocoa)]/55">de {g.giver}</p>
                </div>
                <p className="font-display text-base text-[var(--gold-deep)]">{g.price}</p>
              </li>
            ))}
          </ul>
        </div>

        <Ornament className="mt-10" />
        <p className="mt-3 text-center font-display italic text-sm text-[var(--cocoa)]/70">
          "Sua história continua depois do casamento."
        </p>
      </section>
    </AppShell>
  );
}
