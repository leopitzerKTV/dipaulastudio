import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, Camera, Upload, Heart } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Ornament } from "@/components/Ornament";
import bride from "@/assets/hero-bride.jpg";
import ceremony from "@/assets/ceremony.jpg";
import party from "@/assets/party.jpg";
import proposal from "@/assets/proposal.jpg";
import honeymoon from "@/assets/honeymoon.jpg";

export const Route = createFileRoute("/album")({
  head: () => ({ meta: [{ title: "Álbum Colaborativo — Amanda & Ricardo" }] }),
  component: Album,
});

const photos = [
  { img: ceremony, by: "Marina", tag: "Cerimônia" },
  { img: party, by: "Lucas", tag: "Festa" },
  { img: bride, by: "Ana", tag: "Making of" },
  { img: proposal, by: "Pedro", tag: "Pré-wedding" },
  { img: honeymoon, by: "Júlia", tag: "Convidados" },
  { img: party, by: "Rafa", tag: "Pista" },
  { img: ceremony, by: "Bia", tag: "Votos" },
  { img: bride, by: "Camila", tag: "Buquê" },
];

function Album() {
  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--gold)]/20 bg-[var(--ivory)]/85 px-4 py-3 backdrop-blur-xl">
        <Link to="/" className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold-deep)]">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="font-serif-caps text-[11px] text-[var(--cocoa)]/70">Álbum do Casal</p>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold-deep)]">
          <Camera className="h-4 w-4" />
        </span>
      </header>

      <section className="px-6 pt-6 text-center">
        <Ornament />
        <h1 className="mt-4 font-display text-4xl leading-[1.05] text-[var(--cocoa)]">
          Chega de perder <span className="italic gold-text">momentos</span>
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-[var(--cocoa)]/65">
          Todas as fotos enviadas pelos convidados, em um só álbum digital — em tempo real.
        </p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/30 bg-[var(--card)] px-4 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-[var(--gold)] opacity-70" />
            <span className="relative h-2 w-2 rounded-full bg-[var(--gold-deep)]" />
          </span>
          <span className="font-serif-caps text-[10px] text-[var(--gold-deep)]">347 fotos · ao vivo</span>
        </div>
      </section>

      <div className="mt-7 grid grid-cols-2 gap-2.5 px-5">
        {photos.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
            className={`group relative overflow-hidden rounded-2xl shadow-[var(--shadow-card)] ${i % 5 === 0 ? "row-span-2 aspect-[9/16]" : "aspect-[3/4]"}`}
          >
            <img src={p.img} alt={`Foto de ${p.by}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" width={896} height={1600} />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--cocoa)]/70 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-2.5 text-[var(--ivory)]">
              <div>
                <p className="font-serif-caps text-[8.5px] opacity-80">{p.tag}</p>
                <p className="font-display text-xs leading-tight">por {p.by}</p>
              </div>
              <Heart className="h-3.5 w-3.5" fill="currentColor" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="px-6 pt-8">
        <div className="rounded-2xl border border-[var(--gold)]/30 bg-[var(--card)] p-4 text-center shadow-[var(--shadow-card)]">
          <p className="font-display text-lg text-[var(--cocoa)]">Convide quem você ama</p>
          <p className="mt-1 text-xs text-[var(--cocoa)]/60">Compartilhe o link e cada foto cai direto no seu álbum.</p>
        </div>
      </div>

      {/* Floating upload */}
      <motion.button
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 flex items-center gap-2 rounded-full px-6 py-3.5 font-serif-caps text-[10px] text-[var(--ivory)] shadow-[var(--shadow-luxe)]"
        style={{ background: "var(--gradient-gold)" }}
      >
        <Upload className="h-4 w-4" />
        Enviar Fotos
      </motion.button>
    </AppShell>
  );
}
