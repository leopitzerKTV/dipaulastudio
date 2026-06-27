import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, Heart } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Ornament } from "@/components/Ornament";
import proposal from "@/assets/proposal.jpg";
import ceremony from "@/assets/ceremony.jpg";
import party from "@/assets/party.jpg";
import honeymoon from "@/assets/honeymoon.jpg";
import bride from "@/assets/hero-bride.jpg";

export const Route = createFileRoute("/historia")({
  head: () => ({ meta: [{ title: "Nossa História — Amanda & Ricardo" }] }),
  component: Historia,
});

const chapters = [
  { img: bride, year: "2019", title: "O primeiro olhar", text: "Foi numa tarde de outono, em uma cafeteria pequena, que tudo começou. Um sorriso bastou." },
  { img: proposal, year: "Maio · 2023", title: "O pedido", text: "Diante do mar, ao pôr do sol, com o anel na mão e o coração tremendo: 'casa comigo?'" },
  { img: ceremony, year: "Maio · 2025", title: "O nosso sim", text: "Diante de quem amamos, sob arcos de rosas brancas, prometemos uma vida inteira." },
  { img: party, year: "Maio · 2025", title: "A celebração", text: "Sparklers no céu, risadas até o amanhecer e a certeza de que isso ficaria para sempre." },
  { img: honeymoon, year: "Junho · 2025", title: "Lua de mel", text: "Mãos dadas em um cais de madeira, com o mar turquesa lembrando: agora é só o começo." },
];

function Historia() {
  return (
    <AppShell>
      <Header title="Nossa História" />
      <section className="px-6 pt-2 text-center">
        <Ornament />
        <h1 className="mt-4 font-display text-4xl text-[var(--cocoa)]">A nossa <span className="italic gold-text">história</span></h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-[var(--cocoa)]/65">Cada capítulo, um momento que nos trouxe até aqui.</p>
      </section>

      <div className="mt-8 space-y-10 px-5">
        {chapters.map((c, i) => (
          <motion.article
            key={c.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: i * 0.05 }}
            className="relative"
          >
            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[1.75rem] shadow-[var(--shadow-luxe)]">
              <img src={c.img} alt={c.title} className="h-full w-full object-cover" loading="lazy" width={896} height={1600} />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--cocoa)]/85 via-[var(--cocoa)]/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-[var(--ivory)]">
                <p className="font-serif-caps text-[10px] opacity-80">{c.year}</p>
                <h3 className="mt-1 font-display text-3xl">{c.title}</h3>
                <p className="mt-2 font-display text-base italic leading-snug opacity-90">{c.text}</p>
              </div>
              <div className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-[var(--ivory)]/90 text-[var(--gold-deep)]">
                <Heart className="h-4 w-4" fill="currentColor" />
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      <Ornament className="mt-12" />
      <p className="mt-3 text-center font-display italic text-[var(--cocoa)]/70">e a história continua…</p>
    </AppShell>
  );
}

function Header({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--gold)]/20 bg-[var(--ivory)]/85 px-4 py-3 backdrop-blur-xl">
      <Link to="/" className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold-deep)]">
        <ArrowLeft className="h-4 w-4" />
      </Link>
      <p className="font-serif-caps text-[11px] text-[var(--cocoa)]/70">{title}</p>
      <span className="h-9 w-9" />
    </header>
  );
}
