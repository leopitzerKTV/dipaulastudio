import {
  Package,
  Trash2,
  Check,
  AlertTriangle,
} from "lucide-react";
import { PreviewTile } from "./PreviewTile";
import type { Palette, PersistedBatchPartial } from "../../lib/inviteTypes";

interface BatchProgress {
  step: number;
  total: number;
  label: string;
}

export function BatchExportModals({
  preparingBatch,
  batchProgress,
  showCancelConfirm,
  cancelled,
  cancellingBatch,
  batchPartial,
  palette,
  batchPreview,
  exportingZip,
  showClearConfirm,
  clearConfirmTitle,
  clearConfirmMessage,
  skipClearConfirm,
  preparingBatchCount,
  brideName,
  groomName,
  onPromptCancelBatch,
  onDismissCancelConfirm,
  onConfirmCancelBatch,
  onCloseBatchPreview,
  onPrepareBatch,
  onConfirmDownloadZip,
  onDismissClearBatchProgress,
  onConfirmClearBatchProgress,
  onSetSkipClearConfirm,
}: {
  preparingBatch: boolean;
  batchProgress: BatchProgress;
  showCancelConfirm: boolean;
  cancelled: boolean;
  cancellingBatch: boolean;
  batchPartial: PersistedBatchPartial | null;
  palette: Palette;
  batchPreview: {
    pngUrl: string;
    jpgUrl: string;
    pdfBlobUrl: string;
  } | null;
  exportingZip: boolean;
  showClearConfirm: boolean;
  clearConfirmTitle: string;
  clearConfirmMessage: string;
  skipClearConfirm: boolean;
  preparingBatchCount: number;
  brideName: string;
  groomName: string;
  onPromptCancelBatch: () => void;
  onDismissCancelConfirm: () => void;
  onConfirmCancelBatch: () => void;
  onCloseBatchPreview: () => void;
  onPrepareBatch: () => void;
  onConfirmDownloadZip: () => void;
  onDismissClearBatchProgress: () => void;
  onConfirmClearBatchProgress: (skipConfirm: boolean) => void;
  onSetSkipClearConfirm: (value: boolean) => void;
}) {
  return (
    <>
      {preparingBatch && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--cocoa)]/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-[var(--gold)]/30 bg-[var(--ivory)] p-6 shadow-[var(--shadow-luxe)]">
            <div className="mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 animate-pulse text-[var(--gold-deep)]" />
              <h3 className="font-display text-base text-[var(--cocoa)]">Gerando arquivos…</h3>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--gold)]/15">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.round((batchProgress.step / batchProgress.total) * 100)}%`,
                  background: palette.gradient,
                }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between font-serif-caps text-[10px] text-[var(--gold-deep)]/80">
              <span>{batchProgress.label || "Preparando…"}</span>
              <span>
                {batchProgress.step}/{batchProgress.total}
              </span>
            </div>
            <ul className="mt-3 space-y-1 font-serif-caps text-[10px]">
              {["Bibliotecas", "PNG 9:16", "JPG 9:16", "PDF A4"].map((name, i) => {
                const done = batchProgress.step > i;
                const active = batchProgress.step === i;
                return (
                  <li
                    key={name}
                    className={`flex items-center gap-2 ${
                      done
                        ? "text-[var(--gold-deep)]"
                        : active
                          ? "text-[var(--cocoa)]"
                          : "text-[var(--cocoa)]/40"
                    }`}
                  >
                    {done ? (
                      <Check className="h-3 w-3" />
                    ) : active ? (
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--gold-deep)]" />
                    ) : (
                      <span className="h-2 w-2 rounded-full border border-current opacity-50" />
                    )}
                    {name}
                  </li>
                );
              })}
            </ul>
            {showCancelConfirm ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3">
                <p className="text-center font-display text-xs text-red-700">
                  Tem certeza que deseja cancelar a geração?
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={onDismissCancelConfirm}
                    disabled={cancellingBatch}
                    className="flex-1 rounded-full border border-[var(--gold-deep)]/40 bg-white px-3 py-2 font-serif-caps text-[10px] text-[var(--cocoa)] hover:bg-[var(--gold)]/10 disabled:opacity-60"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={onConfirmCancelBatch}
                    disabled={cancellingBatch}
                    className="flex-1 rounded-full bg-red-600 px-3 py-2 font-serif-caps text-[10px] text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {cancellingBatch ? "Cancelando…" : "Sim, cancelar"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onPromptCancelBatch}
                disabled={cancelled || cancellingBatch}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-red-300 bg-white px-3 py-2 font-serif-caps text-[10px] text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 className="h-3 w-3" />
                {cancellingBatch
                  ? "Cancelando geração…"
                  : cancelled
                    ? "Cancelando…"
                    : "Cancelar geração"}
              </button>
            )}
          </div>
        </div>
      )}

      {batchPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--cocoa)]/70 p-4 backdrop-blur-sm"
          onClick={onCloseBatchPreview}
        >
          <div
            className="w-full max-w-2xl rounded-3xl border border-[var(--gold)]/30 bg-[var(--ivory)] p-6 shadow-[var(--shadow-luxe)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-xl text-[var(--cocoa)]">
                  Confira antes de gerar o ZIP
                </h3>
                <p className="font-serif-caps text-[10px] text-[var(--gold-deep)]/80">
                  prévia dos 3 arquivos que serão incluídos
                </p>
              </div>
              <button
                onClick={onCloseBatchPreview}
                className="rounded-full border border-[var(--gold)]/30 px-3 py-1 font-serif-caps text-[10px] text-[var(--cocoa)]/70 hover:bg-[var(--gold)]/10"
              >
                Cancelar
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <PreviewTile
                label="PNG 9:16"
                sub="alta resolução"
                onDownload={() => {
                  const a = document.createElement("a");
                  a.href = batchPreview.pngUrl;
                  a.download = `convite-${brideName}-${groomName}`.toLowerCase().replace(/\s+/g, "-") + ".png";
                  a.click();
                }}
              >
                <img
                  src={batchPreview.pngUrl}
                  alt="Prévia PNG"
                  className="h-full w-full object-cover"
                />
              </PreviewTile>
              <PreviewTile
                label="JPG 9:16"
                sub="qualidade 95%"
                onDownload={() => {
                  const a = document.createElement("a");
                  a.href = batchPreview.jpgUrl;
                  a.download = `convite-${brideName}-${groomName}`.toLowerCase().replace(/\s+/g, "-") + ".jpg";
                  a.click();
                }}
              >
                <img
                  src={batchPreview.jpgUrl}
                  alt="Prévia JPG"
                  className="h-full w-full object-cover"
                />
              </PreviewTile>
              <PreviewTile
                label="PDF A4"
                sub="vertical"
                onDownload={() => {
                  const a = document.createElement("a");
                  a.href = batchPreview.pdfBlobUrl;
                  a.download = `convite-${brideName}-${groomName}`.toLowerCase().replace(/\s+/g, "-") + ".pdf";
                  a.click();
                }}
              >
                <iframe
                  src={`${batchPreview.pdfBlobUrl}#toolbar=0&navpanes=0&view=FitH`}
                  title="Prévia PDF"
                  className="h-full w-full"
                />
              </PreviewTile>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={onPrepareBatch}
                disabled={preparingBatch || exportingZip}
                className="rounded-full border border-[var(--gold-deep)]/40 px-4 py-2 font-serif-caps text-[10px] text-[var(--gold-deep)] hover:bg-[var(--gold)]/10 disabled:opacity-60"
              >
                {preparingBatch ? "Atualizando…" : "Atualizar prévia"}
              </button>
              <button
                onClick={onConfirmDownloadZip}
                disabled={exportingZip}
                className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 font-serif-caps text-[10px] text-[var(--ivory)] shadow-[var(--shadow-card)] disabled:opacity-60"
                style={{ background: palette.gradient }}
              >
                <Package className="h-3.5 w-3.5" />
                {exportingZip ? "Gerando ZIP…" : "Confirmar e baixar ZIP"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[var(--cocoa)]/70 p-4 backdrop-blur-sm"
          onClick={onDismissClearBatchProgress}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-red-200 bg-[var(--ivory)] p-6 shadow-[var(--shadow-luxe)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-display text-base text-[var(--cocoa)]">{clearConfirmTitle}</h3>
            </div>
            <p className="whitespace-pre-line font-display text-xs leading-relaxed text-[var(--cocoa)]/80">
              {clearConfirmMessage}
            </p>
            <div className="mt-4 rounded-2xl bg-red-50 p-3">
              <p className="font-serif-caps text-[10px] text-red-700">
                Etapas concluídas que serão perdidas:
              </p>
              <ul className="mt-1.5 space-y-1 font-serif-caps text-[10px] text-red-700/80">
                {batchPartial?.pngUrl && (
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3" /> PNG 9:16
                  </li>
                )}
                {batchPartial?.jpgUrl && (
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3" /> JPG 9:16
                  </li>
                )}
                {batchPartial?.pdfBlobUrl && (
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3" /> PDF A4
                  </li>
                )}
                {!batchPartial?.pngUrl && !batchPartial?.jpgUrl && !batchPartial?.pdfBlobUrl && (
                  <li>Nenhuma etapa concluída ainda.</li>
                )}
              </ul>
            </div>
            <label className="mt-4 flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={skipClearConfirm}
                onChange={(e) => onSetSkipClearConfirm(e.target.checked)}
                className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
              />
              <span className="font-serif-caps text-[10px] text-[var(--cocoa)]/80">
                Não perguntar novamente
              </span>
            </label>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={onDismissClearBatchProgress}
                disabled={preparingBatch}
                className="flex-1 rounded-full border border-[var(--gold-deep)]/40 bg-white px-4 py-2 font-serif-caps text-[10px] text-[var(--cocoa)] hover:bg-[var(--gold)]/10 disabled:opacity-60"
              >
                Manter progresso
              </button>
              <button
                onClick={() => onConfirmClearBatchProgress(skipClearConfirm)}
                disabled={preparingBatch}
                className="flex-1 rounded-full bg-red-600 px-4 py-2 font-serif-caps text-[10px] text-white hover:bg-red-700 disabled:opacity-60"
              >
                Apagar e recomeçar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
