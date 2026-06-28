import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Edit3 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ManualView, type ManualData } from "@/components/ManualView";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/manual")({
  head: () => ({
    meta: [
      { title: "Manual do Convidado — Amanda & Ricardo" },
      { name: "description", content: "Tudo o que você precisa saber para celebrar conosco: dress code, cerimônia, recepção e momentos especiais." },
      { property: "og:title", content: "Manual do Convidado — Amanda & Ricardo" },
      { property: "og:description", content: "Dress code, cerimônia, recepção, presentes e mais." },
    ],
  }),
  component: ManualPage,
});

function ManualPage() {
  const [m, setM] = useState<ManualData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("guest_manual")
      .select("ceremony_date,ceremony_time,ceremony_location,parking_info,location_info,gift_list_url,welcome_note")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          setM((data as ManualData) ?? null);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell>
      <div className="px-6 pt-6 text-right">
        <Link
          to="/manual/editar"
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold)]/40 bg-white/60 px-3 py-1.5 text-[10px] font-serif-caps text-[var(--gold-deep)] hover:bg-white"
        >
          <Edit3 className="h-3 w-3" /> Editar manual
        </Link>
      </div>
      <ManualView data={m} />
      {loading && <p className="-mt-4 mb-6 text-center text-xs text-[var(--cocoa)]/40">Carregando…</p>}
    </AppShell>
  );
}
