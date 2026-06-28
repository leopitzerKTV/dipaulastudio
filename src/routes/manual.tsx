import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Edit3, Download, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { ManualView, type ManualData } from "@/components/ManualView";
import { supabase } from "@/integrations/supabase/client";
import { downloadBlob, generateManualPdf, sharePdf } from "@/lib/manual-pdf";

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
  const [pdfBusy, setPdfBusy] = useState<null | "download" | "share">(null);
  const manualRef = useRef<HTMLDivElement>(null);

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

  async function handleDownload() {
    if (!manualRef.current) return;
    setPdfBusy("download");
    try {
      const blob = await generateManualPdf(manualRef.current);
      downloadBlob(blob, "manual-do-convidado.pdf");
      toast.success("PDF baixado");
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível gerar o PDF");
    } finally {
      setPdfBusy(null);
    }
  }

  async function handleShare() {
    if (!manualRef.current) return;
    setPdfBusy("share");
    try {
      const blob = await generateManualPdf(manualRef.current);
      const shared = await sharePdf(
        blob,
        "manual-do-convidado.pdf",
        "Manual do Convidado — Amanda & Ricardo",
        "Tudo o que você precisa saber para celebrar conosco ✨",
      );
      if (!shared) {
        downloadBlob(blob, "manual-do-convidado.pdf");
        toast.success("Compartilhamento não suportado — baixamos o PDF para você");
      }
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível gerar o PDF");
    } finally {
      setPdfBusy(null);
    }
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-2 px-6 pt-6">
        <Link
          to="/manual/editar"
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold)]/40 bg-white/60 px-3 py-1.5 text-[10px] font-serif-caps text-[var(--gold-deep)] hover:bg-white"
        >
          <Edit3 className="h-3 w-3" /> Editar
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={pdfBusy !== null || loading}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold)]/40 bg-white/60 px-3 py-1.5 text-[10px] font-serif-caps text-[var(--gold-deep)] disabled:opacity-50"
          >
            {pdfBusy === "download" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />} PDF
          </button>
          <button
            onClick={handleShare}
            disabled={pdfBusy !== null || loading}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gold-deep)] px-3 py-1.5 text-[10px] font-serif-caps text-white disabled:opacity-50"
          >
            {pdfBusy === "share" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Share2 className="h-3 w-3" />} Compartilhar
          </button>
        </div>
      </div>
      <ManualView data={m} innerRef={manualRef} />
      {loading && <p className="-mt-4 mb-6 text-center text-xs text-[var(--cocoa)]/40">Carregando…</p>}
    </AppShell>
  );
}
