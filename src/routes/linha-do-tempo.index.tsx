import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, Gem, Sparkles, PartyPopper, Plane, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Ornament } from "@/components/Ornament";
import { supabase } from "@/integrations/supabase/client";
import proposal from "@/assets/proposal.jpg";
import ceremony from "@/assets/ceremony.jpg";
import party from "@/assets/party.jpg";
import honeymoon from "@/assets/honeymoon.jpg";

export const Route = createFileRoute("/linha-do-tempo/")({
  head: () => ({ meta: [{ title: "Linha do Tempo — Amanda & Ricardo" }] }),
  component: Timeline,
});

const milestones = [
  {
    id: "f1",
    position: 0,
    storage_path: null,
    Icon: Gem,
    title: "Pedido de Casamento",
    date_label: "12 · Mai · 2023",
    imageUrl: proposal,
  },
  {
    id: "f2",
    position: 1,
    storage_path: null,
    Icon: Sparkles,
    title: "Nosso Casamento",
    date_label: "24 · Mai · 2025",
    imageUrl: ceremony,
  },
  {
    id: "f3",
    position: 2,
    storage_path: null,
    Icon: PartyPopper,
    title: "A Festa",
    date_label: "24 · Mai · 2025",
    imageUrl: party,
  },
  {
    id: "f4",
    position: 3,
    storage_path: null,
    Icon: Plane,
    title: "Lua de Mel",
    date_label: "27 · Mai · 2025",
    imageUrl: honeymoon,
  },
];

const BUCKET = "timeline-photos";
const icons = [Gem, Sparkles, PartyPopper, Plane];

type Milestone = {
  id: string;
  position: number;
  storage_path: string | null;
  date_label: string;
  title: string;
  imageUrl?: string;
  Icon?: typeof Gem;
};

function Timeline() {
  const [items, setItems] = useState<Milestone[]>(milestones);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from("timeline_milestones")
        .select("*")
        .order("position", { ascending: true })
        .order("created_at", { ascending: true });
      if (cancelled || error || !data || data.length === 0) return;

      const rows = data as Milestone[];
      const paths: string[] = rows.map((r) => r.storage_path).filter((p): p is string => !!p);
      const urlMap = new Map<string, string>();
      if (paths.length > 0) {
        const { data: signed } = await supabase.storage
          .from(BUCKET)
          .createSignedUrls(paths, 60 * 60);
        signed?.forEach((s) => {
          if (s.signedUrl && s.path) urlMap.set(s.path, s.signedUrl);
        });
      }
      setItems(
        rows.map((r, i) => ({
          ...r,
          Icon: icons[i % icons.length],
          imageUrl: r.storage_path ? urlMap.get(r.storage_path) : undefined,
        })),
      );
    }
    load();

    const channel = supabase
      .channel("timeline_milestones_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "timeline_milestones" },
        () => {
          load();
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--gold)]/20 bg-[var(--ivory)]/85 px-4 py-3 backdrop-blur-xl">
        <Link
          to="/"
          className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold-deep)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="font-serif-caps text-[11px] text-[var(--cocoa)]/70">Linha do Tempo</p>
        <span className="h-9 w-9" />
      </header>

      <section className="px-6 pt-6 text-center">
        <Ornament />
        <h1 className="mt-4 font-display text-4xl text-[var(--cocoa)]">
          Linha do <span className="italic gold-text">Tempo</span>
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-[var(--cocoa)]/65">
          Do pedido à lua de mel — tudo organizado para vocês reviverem.
        </p>
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
          {items.map((m, i) => {
            const Icon = m.Icon ?? icons[i % icons.length];
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="relative flex items-center gap-4"
              >
                <div className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[var(--gold)]/40 bg-[var(--ivory)] text-[var(--gold-deep)] shadow-[var(--shadow-card)]">
                  <Icon className="h-5 w-5" strokeWidth={1.4} />
                </div>
                <div className="flex flex-1 items-center gap-3 rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)] p-2 pr-4 shadow-[var(--shadow-card)]">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                    {m.imageUrl ? (
                      <img
                        src={m.imageUrl}
                        alt={m.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        width={896}
                        height={1600}
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-[var(--ivory)] font-serif-caps text-[9px] text-[var(--cocoa)]/40">
                        Sem foto
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-lg leading-tight text-[var(--cocoa)]">
                      {m.title}
                    </p>
                    <p className="font-serif-caps text-[10px] text-[var(--gold-deep)]">
                      {m.date_label}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Ornament className="mt-12" />
      <p className="mt-3 text-center font-display italic text-sm text-[var(--cocoa)]/70">
        e o melhor ainda está por vir…
      </p>
    </AppShell>
  );
}
