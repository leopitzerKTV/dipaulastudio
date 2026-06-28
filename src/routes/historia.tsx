import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, Heart, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Ornament } from "@/components/Ornament";
import { supabase } from "@/integrations/supabase/client";
import proposal from "@/assets/proposal.jpg";
import ceremony from "@/assets/ceremony.jpg";
import party from "@/assets/party.jpg";
import honeymoon from "@/assets/honeymoon.jpg";
import bride from "@/assets/hero-bride.jpg";

export const Route = createFileRoute("/historia")({
  head: () => ({ meta: [{ title: "Nossa História — Amanda & Ricardo" }] }),
  component: Historia,
});

const BUCKET = "story-photos";

type Chapter = {
  id: string;
  position: number;
  storage_path: string | null;
  date_label: string;
  title: string;
  body: string;
  imageUrl?: string;
};

const fallbackChapters: Chapter[] = [
  { id: "f1", position: 0, storage_path: null, date_label: "2019", title: "O primeiro olhar", body: "Foi numa tarde de outono, em uma cafeteria pequena, que tudo começou. Um sorriso bastou.", imageUrl: bride },
  { id: "f2", position: 1, storage_path: null, date_label: "Maio · 2023", title: "O pedido", body: "Diante do mar, ao pôr do sol, com o anel na mão e o coração tremendo: 'casa comigo?'", imageUrl: proposal },
  { id: "f3", position: 2, storage_path: null, date_label: "Maio · 2025", title: "O nosso sim", body: "Diante de quem amamos, sob arcos de rosas brancas, prometemos uma vida inteira.", imageUrl: ceremony },
  { id: "f4", position: 3, storage_path: null, date_label: "Maio · 2025", title: "A celebração", body: "Sparklers no céu, risadas até o amanhecer e a certeza de que isso ficaria para sempre.", imageUrl: party },
  { id: "f5", position: 4, storage_path: null, date_label: "Junho · 2025", title: "Lua de mel", body: "Mãos dadas em um cais de madeira, com o mar turquesa lembrando: agora é só o começo.", imageUrl: honeymoon },
];

function Historia() {
  const [chapters, setChapters] = useState<Chapter[]>(fallbackChapters);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from("story_chapters")
        .select("*")
        .order("position", { ascending: true })
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (error || !data || data.length === 0) {
        setLoading(false);
        return;
      }
      const rows = data as Chapter[];
      const paths: string[] = rows.map((r) => r.storage_path).filter((p): p is string => !!p);
      const urlMap = new Map<string, string>();
      if (paths.length > 0) {
        const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 60 * 60);
        signed?.forEach((s) => {
          if (s.signedUrl) urlMap.set(s.path, s.signedUrl);
        });
      }
      setChapters(rows.map((r) => ({ ...r, imageUrl: r.storage_path ? urlMap.get(r.storage_path) : undefined })));
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell>
      <Header title="Nossa História" />
      <section className="px-6 pt-2 text-center">
        <Ornament />
        <h1 className="mt-4 font-display text-4xl text-[var(--cocoa)]">A nossa <span className="italic gold-text">história</span></h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-[var(--cocoa)]/65">Cada capítulo, um momento que nos trouxe até aqui.</p>
        <Link
          to="/historia/editar"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[var(--gold)]/35 bg-[var(--card)] px-4 py-1.5 font-serif-caps text-[10px] text-[var(--cocoa)] transition hover:bg-[var(--gold)]/10"
        >
          <Pencil className="h-3 w-3" /> Editar capítulos
        </Link>
      </section>

      <div className="mt-8 space-y-10 px-5">
        {chapters.map((c, i) => (
          <motion.article
            key={c.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: i * 0.05 }}
            className="relative"
          >
            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[1.75rem] shadow-[var(--shadow-luxe)] bg-[var(--card)]">
              {c.imageUrl ? (
                <img src={c.imageUrl} alt={c.title} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="grid h-full w-full place-items-center text-[var(--cocoa)]/40 font-serif-caps text-[10px]">
                  Sem foto
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--cocoa)]/85 via-[var(--cocoa)]/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-[var(--ivory)]">
                {c.date_label && <p className="font-serif-caps text-[10px] opacity-80">{c.date_label}</p>}
                {c.title && <h3 className="mt-1 font-display text-3xl">{c.title}</h3>}
                {c.body && <p className="mt-2 font-display text-base italic leading-snug opacity-90">{c.body}</p>}
              </div>
              <div className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-[var(--ivory)]/90 text-[var(--gold-deep)]">
                <Heart className="h-4 w-4" fill="currentColor" />
              </div>
            </div>
          </motion.article>
        ))}
        {!loading && chapters.length === 0 && (
          <p className="text-center font-display italic text-[var(--cocoa)]/60">Nenhum capítulo ainda. Toque em “Editar capítulos” para começar.</p>
        )}
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
