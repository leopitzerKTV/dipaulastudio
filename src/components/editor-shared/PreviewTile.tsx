import { ReactNode } from "react";
import { Download } from "lucide-react";

export function PreviewTile({
  label,
  sub,
  children,
  onDownload,
}: {
  label: string;
  sub: string;
  children: ReactNode;
  onDownload?: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--gold)]/25 bg-[var(--card)] shadow-[var(--shadow-card)]">
      <div className="aspect-[9/16] w-full overflow-hidden bg-[var(--ivory)]">{children}</div>
      <div className="px-2 py-1.5 text-center">
        <p className="font-display text-xs text-[var(--cocoa)] leading-tight">{label}</p>
        <p className="font-serif-caps text-[8px] text-[var(--gold-deep)]/70">{sub}</p>
        {onDownload && (
          <button
            onClick={onDownload}
            className="mt-1.5 inline-flex w-full items-center justify-center gap-1 rounded-md border border-[var(--gold-deep)]/40 bg-[var(--ivory)] px-2 py-1 font-serif-caps text-[9px] text-[var(--gold-deep)] hover:bg-[var(--gold)]/10"
          >
            <Download className="h-3 w-3" />
            Baixar
          </button>
        )}
      </div>
    </div>
  );
}
