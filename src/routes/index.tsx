import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Mail, Calendar, MapPin, Gift, Heart, Wand2, BookOpen } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Ornament } from "@/components/Ornament";
import ceremonyImg from "@/assets/ceremony.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Amanda & Ricardo — Nosso Convite" },
      { name: "description", content: "Convite digital personalizado: confirme sua presença, veja a linha do tempo do casal e mais." },
      { property: "og:title", content: "Amanda & Ricardo — Nosso Convite" },
      { property: "og:description", content: "Convite digital personalizado, álbum colaborativo e linha do tempo do casal." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AppShell>
      {/* Cover */}
      <section className="relative px-6 pt-10">
        <div className="text-center">
          <p className="font-serif-caps text-[10px] text-[var(--gold-deep)]">Convite Digital</p>
          <Ornament className="mt-4" />
          <p className="mt-5 font-display text-sm italic text-[var(--cocoa)]/70">você está convidado para o nosso casamento</p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mt-3 font-display text-[64px] leading-[0.95] tracking-tight text-[var(--cocoa)]"
          >
            Amanda
            <span className="block font-display italic text-[42px] text-[var(--gold-deep)] my-1">e</span>
            Ricardo
          </motion.h1>
          <Ornament className="mt-5" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="relative mx-auto mt-6 aspect-[9/16] w-full max-w-[20rem] overflow-hidden rounded-[2rem] shadow-[var(--shadow-luxe)]"
        >
          <img src={ceremonyImg} alt="Cerimônia" className="h-full w-full object-cover" width={896} height={1600} />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--cocoa)]/70 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-[var(--ivory)]">
            <p className="font-serif-caps text-[10px] opacity-90">24 · Maio · 2025</p>
            <p className="font-display text-lg mt-1">Sábado, às 16h30</p>
          </div>
        </motion.div>

        <div className="mt-6 space-y-2.5">
          <InfoRow Icon={Calendar} title="Cerimônia" sub="Sábado, 24 de Maio · 16h30" />
          <InfoRow Icon={MapPin} title="Espaço Jardim Secreto" sub="São Paulo · SP" />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          className="mt-7 w-full rounded-full bg-[var(--gradient-gold,linear-gradient(135deg,#9c7a3a,#c9a55b))] py-4 font-serif-caps text-xs text-[var(--ivory)] shadow-[var(--shadow-card)]"
          style={{ background: "var(--gradient-gold)" }}
        >
          Confirmar Presença
        </motion.button>

        <p className="mt-3 text-center font-display italic text-sm text-[var(--cocoa)]/70">
          "Transforme cada momento em uma lembrança eterna."
        </p>
      </section>

      {/* Quick actions */}
      <section className="mt-10 px-6">
        <Ornament />
        <h2 className="mt-5 text-center font-display text-3xl text-[var(--cocoa)]">Tudo do nosso casamento</h2>
        <p className="mt-2 text-center text-sm text-[var(--cocoa)]/65">Em um só lugar, organizado para vocês reviverem quando quiserem.</p>

        <div className="mt-6 grid gap-3">
          <ActionCard to="/historia" Icon={Heart} title="Nossa História" sub="O começo, o pedido, o agora" />
          <ActionCard to="/linha-do-tempo" Icon={Calendar} title="Linha do Tempo" sub="Pedido, casamento, festa, lua de mel" />
          <ActionCard to="/album" Icon={Mail} title="Álbum Colaborativo" sub="Fotos dos convidados em tempo real" />
          <ActionCard to="/editor" Icon={Wand2} title="Editor do Convite" sub="Personalize nomes, data, cores e imagem" />
          <ActionCard to="/painel" Icon={Gift} title="Painel Privado do Casal" sub="RSVP, presentes, mensagens" />
        </div>
      </section>

      <p className="mt-10 text-center font-serif-caps text-[10px] text-[var(--gold-deep)]/70">Nossa História · App de Casamento</p>
    </AppShell>
  );
}

function InfoRow({ Icon, title, sub }: { Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)] px-4 py-3">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold-deep)]">
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-display text-base text-[var(--cocoa)]">{title}</p>
        <p className="text-xs text-[var(--cocoa)]/60">{sub}</p>
      </div>
    </div>
  );
}

function ActionCard({ to, Icon, title, sub }: { to: string; Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; title: string; sub: string }) {
  return (
    <Link to={to} className="group flex items-center gap-4 rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)] p-4 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-[var(--gold)]/60">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--gold)]/12 text-[var(--gold-deep)]">
        <Icon className="h-5 w-5" strokeWidth={1.4} />
      </div>
      <div className="flex-1">
        <p className="font-display text-lg text-[var(--cocoa)]">{title}</p>
        <p className="text-xs text-[var(--cocoa)]/60">{sub}</p>
      </div>
      <span className="font-serif-caps text-[10px] text-[var(--gold-deep)] opacity-0 transition-opacity group-hover:opacity-100">abrir</span>
    </Link>
  );
}
