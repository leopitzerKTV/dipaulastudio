import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Download,
  FileImage,
  FileDown,
  Package,
  Save,
  Sparkles,
} from "lucide-react";
import type { Palette } from "../../lib/inviteTypes";

export function EditorHeader({
  palette,
  autoStatus,
  exporting,
  exportingJpg,
  exportingPdf,
  anyExporting,
  preparingBatch,
  batchPartial,
  onExport,
  onExportJpg,
  onExportPdf,
  onPrepareBatch,
  onTourOpen,
}: {
  palette: Palette;
  autoStatus: "saving" | "saved" | "ready";
  exporting: boolean;
  exportingJpg: boolean;
  exportingPdf: boolean;
  anyExporting: boolean;
  preparingBatch: boolean;
  batchPartial: boolean;
  onExport: () => void;
  onExportJpg: () => void;
  onExportPdf: () => void;
  onPrepareBatch: () => void;
  onTourOpen: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--gold)]/20 bg-[var(--ivory)]/85 px-4 py-3 backdrop-blur-xl">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-[var(--cocoa)]/70 hover:text-[var(--cocoa)]"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="font-serif-caps text-[10px]">voltar</span>
      </Link>
      <div className="flex flex-col items-center">
        <h1 className="font-display text-lg text-[var(--cocoa)]">Editor do Convite</h1>
        <span className="font-serif-caps text-[9px] text-[var(--gold-deep)]/80 flex items-center gap-1">
          {autoStatus === "saving" ? (
            <>
              <Save className="h-2.5 w-2.5 animate-pulse" /> salvando…
            </>
          ) : autoStatus === "saved" ? (
            <>
              <Check className="h-2.5 w-2.5" /> rascunho salvo
            </>
          ) : (
            <>rascunho automático</>
          )}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onExport}
          disabled={anyExporting}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold-deep)]/40 bg-[var(--ivory)] px-3 py-1.5 font-serif-caps text-[10px] text-[var(--gold-deep)] hover:bg-[var(--gold)]/10 disabled:opacity-60"
        >
          <Download className="h-3.5 w-3.5" />
          {exporting ? "PNG…" : "PNG"}
        </button>
        <button
          onClick={onExportJpg}
          disabled={anyExporting}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold-deep)]/40 bg-[var(--ivory)] px-3 py-1.5 font-serif-caps text-[10px] text-[var(--gold-deep)] hover:bg-[var(--gold)]/10 disabled:opacity-60"
        >
          <FileImage className="h-3.5 w-3.5" />
          {exportingJpg ? "JPG…" : "JPG"}
        </button>
        <button
          onClick={onExportPdf}
          disabled={anyExporting}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-serif-caps text-[10px] text-[var(--ivory)] shadow-[var(--shadow-card)] disabled:opacity-60"
          style={{ background: palette.gradient }}
        >
          <FileDown className="h-3.5 w-3.5" />
          {exportingPdf ? "PDF…" : "PDF A4"}
        </button>
        <button
          onClick={onPrepareBatch}
          disabled={anyExporting}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold-deep)]/60 bg-[var(--cocoa)] px-3 py-1.5 font-serif-caps text-[10px] text-[var(--ivory)] hover:opacity-90 disabled:opacity-60"
        >
          <Package className="h-3.5 w-3.5" />
          {preparingBatch ? "ZIP…" : batchPartial ? "Retomar ZIP" : "ZIP"}
        </button>
        <button
          onClick={onTourOpen}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold-deep)]/40 bg-[var(--ivory)] px-3 py-1.5 font-serif-caps text-[10px] text-[var(--gold-deep)] hover:bg-[var(--gold)]/10"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Tour
        </button>
      </div>
    </header>
  );
}
