import { useEffect, useRef, useState } from "react";
import { toPng, toJpeg } from "html-to-image";
import {
  BATCH_CLEAR_MESSAGE_KEY,
  BATCH_CLEAR_SKIP_CONFIRM_KEY,
  BATCH_CLEAR_TITLE_KEY,
  BATCH_PARTIAL_KEY,
  InviteDraft,
  Palette,
  PersistedBatchPartial,
} from "@/lib/inviteTypes";
import { blobToBase64, loadJSON } from "@/lib/inviteUtils";
import { safeSetItem, safeGetItem, safeRemoveItem } from "@/lib/safeStorage";

export function useBatchExport(
  previewRef: React.RefObject<HTMLDivElement>,
  palette: Palette,
  draft: InviteDraft,
) {
  // Batch state
  const [batchPartial, setBatchPartial] = useState<{
    pngUrl?: string;
    jpgUrl?: string;
    pdfBlobUrl?: string;
    pdfBlob?: Blob;
  } | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(BATCH_PARTIAL_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as PersistedBatchPartial;
      if (!parsed.pngUrl && !parsed.jpgUrl && !parsed.pdfBase64) return null;
      let pdfBlob: Blob | undefined;
      let pdfBlobUrl: string | undefined;
      if (parsed.pdfBase64) {
        pdfBlob = new Blob([atob(parsed.pdfBase64)], { type: "application/pdf" });
        pdfBlobUrl = URL.createObjectURL(pdfBlob);
      }
      return { pngUrl: parsed.pngUrl, jpgUrl: parsed.jpgUrl, pdfBlobUrl, pdfBlob };
    } catch {
      return null;
    }
  });

  const [batchPreview, setBatchPreview] = useState<{
    pngUrl: string;
    jpgUrl: string;
    pdfBlobUrl: string;
    pdfBlob: Blob;
  } | null>(null);

  const [batchProgress, setBatchProgress] = useState<{
    step: number;
    total: number;
    label: string;
  }>({ step: 0, total: 4, label: "" });

  const [exportingZip, setExportingZip] = useState(false);
  const [preparingBatch, setPreparingBatch] = useState(false);
  const [cancellingBatch, setCancellingBatch] = useState(false);
  const cancelBatchRef = useRef(false);
  const [cancelled, setCancelled] = useState(false);

  // Confirmation modals
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [skipClearConfirm, setSkipClearConfirm] = useState(() =>
    loadJSON<boolean>(BATCH_CLEAR_SKIP_CONFIRM_KEY, false),
  );
  const [clearConfirmTitle, setClearConfirmTitle] = useState(() =>
    loadJSON<string>(BATCH_CLEAR_TITLE_KEY, "Apagar progresso salvo?"),
  );
  const [clearConfirmMessage, setClearConfirmMessage] = useState(() =>
    loadJSON<string>(
      BATCH_CLEAR_MESSAGE_KEY,
      "Você tem um progresso de geração salvo. Se apagar, perderá o que já foi renderizado de PNG, JPG e PDF e terá que começar do zero.",
    ),
  );

  // Persist partial batch progress
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (
          !batchPartial ||
          (!batchPartial.pngUrl && !batchPartial.jpgUrl && !batchPartial.pdfBlob)
        ) {
          safeRemoveItem(BATCH_PARTIAL_KEY);
          return;
        }
        const payload: PersistedBatchPartial = {
          pngUrl: batchPartial.pngUrl,
          jpgUrl: batchPartial.jpgUrl,
        };
        if (batchPartial.pdfBlob) {
          payload.pdfBase64 = await blobToBase64(batchPartial.pdfBlob);
        }
        if (cancelled) return;
        const success = safeSetItem(BATCH_PARTIAL_KEY, JSON.stringify(payload));
        if (!success) {
          console.warn("[useBatchExport] Falha ao persistir progresso batch");
        }
      } catch (error) {
        console.error("[useBatchExport] Erro ao persistir progresso:", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [batchPartial]);

  // Persist custom titles/messages
  useEffect(() => {
    const titleSuccess = safeSetItem(BATCH_CLEAR_TITLE_KEY, JSON.stringify(clearConfirmTitle));
    if (!titleSuccess) {
      console.warn("[useBatchExport] Falha ao salvar título de confirmação");
    }
    const messageSuccess = safeSetItem(
      BATCH_CLEAR_MESSAGE_KEY,
      JSON.stringify(clearConfirmMessage),
    );
    if (!messageSuccess) {
      console.warn("[useBatchExport] Falha ao salvar mensagem de confirmação");
    }
  }, [clearConfirmTitle, clearConfirmMessage]);

  // Cancel batch handlers
  const promptCancelBatch = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancelBatch = () => {
    cancelBatchRef.current = true;
    setCancelled(true);
    setCancellingBatch(true);
    setShowCancelConfirm(false);
  };

  const dismissCancelConfirm = () => {
    setShowCancelConfirm(false);
  };

  // Clear batch progress handlers
  const promptClearBatchProgress = () => {
    const skip = loadJSON<boolean>(BATCH_CLEAR_SKIP_CONFIRM_KEY, false);
    if (skip) {
      confirmClearBatchProgress(false);
    } else {
      setShowClearConfirm(true);
    }
  };

  const dismissClearBatchProgress = () => {
    setShowClearConfirm(false);
  };

  const confirmClearBatchProgress = (saveSkipPreference: boolean) => {
    safeRemoveItem(BATCH_PARTIAL_KEY);
    if (saveSkipPreference) {
      const success = safeSetItem(BATCH_CLEAR_SKIP_CONFIRM_KEY, JSON.stringify(true));
      if (!success) {
        console.warn("[useBatchExport] Falha ao salvar preferência de skip");
      }
    }
    if (batchPartial?.pdfBlobUrl) URL.revokeObjectURL(batchPartial.pdfBlobUrl);
    setBatchPartial(null);
    setShowClearConfirm(false);
  };

  const clearSkipPreference = () => {
    const success = safeRemoveItem(BATCH_CLEAR_SKIP_CONFIRM_KEY);
    if (!success) {
      console.warn("[useBatchExport] Falha ao remover preferência de skip");
    }
  };

  // Batch preparation
  const onPrepareBatch = async () => {
    if (!previewRef.current) return;
    cancelBatchRef.current = false;
    setCancelled(false);
    setCancellingBatch(false);
    setPreparingBatch(true);
    const tick = (step: number, label: string) => setBatchProgress({ step, total: 4, label });
    const checkCancel = () => {
      if (cancelBatchRef.current) throw new Error("CANCELLED");
    };

    let pngUrl = batchPartial?.pngUrl;
    let jpgUrl = batchPartial?.jpgUrl;
    let pdfBlobUrl = batchPartial?.pdfBlobUrl;
    let pdfBlob = batchPartial?.pdfBlob;

    try {
      tick(0, "Carregando bibliotecas…");
      const jsPDFMod = await import("jspdf");
      await new Promise((r) => setTimeout(r, 30));
      checkCancel();

      if (!pngUrl) {
        tick(1, "Renderizando PNG em alta resolução…");
        pngUrl = await toPng(previewRef.current, {
          pixelRatio: 4,
          cacheBust: true,
          backgroundColor: palette.bg,
        });
        setBatchPartial((prev) => ({ ...prev, pngUrl }));
      } else {
        tick(1, "PNG já renderizado. Retomando…");
        await new Promise((r) => setTimeout(r, 30));
      }
      checkCancel();

      if (!jpgUrl) {
        tick(2, "Renderizando JPG (qualidade 95%)…");
        jpgUrl = await toJpeg(previewRef.current, {
          pixelRatio: 4,
          cacheBust: true,
          quality: 0.95,
          backgroundColor: palette.bg,
        });
        setBatchPartial((prev) => ({ ...prev, pngUrl, jpgUrl }));
      } else {
        tick(2, "JPG já renderizado. Retomando…");
        await new Promise((r) => setTimeout(r, 30));
      }
      checkCancel();

      if (!pdfBlob || !pdfBlobUrl) {
        tick(3, "Montando PDF A4…");
        const pdf = new jsPDFMod.jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
          compress: true,
        });
        const pageW = 210;
        const pageH = 297;
        const marginY = 12;
        const imgH = pageH - marginY * 2;
        const imgW = (imgH * 9) / 16;
        const offsetX = (pageW - imgW) / 2;
        pdf.addImage(pngUrl!, "PNG", offsetX, marginY, imgW, imgH, undefined, "FAST");
        pdfBlob = pdf.output("blob");
        pdfBlobUrl = URL.createObjectURL(pdfBlob);
        setBatchPartial((prev) => ({ ...prev, pngUrl, jpgUrl, pdfBlobUrl, pdfBlob }));
      } else {
        tick(3, "PDF já montado. Retomando…");
        await new Promise((r) => setTimeout(r, 30));
      }
      checkCancel();

      tick(4, "Pronto!");
      if (batchPreview) URL.revokeObjectURL(batchPreview.pdfBlobUrl);
      setBatchPreview({
        pngUrl: pngUrl!,
        jpgUrl: jpgUrl!,
        pdfBlobUrl: pdfBlobUrl!,
        pdfBlob: pdfBlob!,
      });
      setBatchPartial(null);
    } catch (err) {
      if ((err as Error).message !== "CANCELLED") throw err;
    } finally {
      setPreparingBatch(false);
      setCancellingBatch(false);
      cancelBatchRef.current = false;
    }
  };

  const closeBatchPreview = () => {
    if (batchPreview) URL.revokeObjectURL(batchPreview.pdfBlobUrl);
    setBatchPreview(null);
  };

  const confirmDownloadZip = async () => {
    if (!batchPreview) return;
    setExportingZip(true);
    try {
      const { default: JSZip } = await import("jszip");
      const slug = `convite-${draft.brideName}-${draft.groomName}`
        .toLowerCase()
        .replace(/\s+/g, "-");
      const zip = new JSZip();
      zip.file(`${slug}.png`, batchPreview.pngUrl.split(",")[1], { base64: true });
      zip.file(`${slug}.jpg`, batchPreview.jpgUrl.split(",")[1], { base64: true });
      zip.file(`${slug}.pdf`, batchPreview.pdfBlob);
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      closeBatchPreview();
    } finally {
      setExportingZip(false);
    }
  };

  const anyExporting = exportingZip || preparingBatch || cancellingBatch;

  return {
    // Batch state
    batchPartial,
    setBatchPartial,
    batchPreview,
    setBatchPreview,
    batchProgress,
    exportingZip,
    preparingBatch,
    cancellingBatch,
    cancelled,
    anyExporting,

    // Batch handlers
    onPrepareBatch,
    closeBatchPreview,
    confirmDownloadZip,

    // Cancel confirmation
    showCancelConfirm,
    setShowCancelConfirm,
    promptCancelBatch,
    confirmCancelBatch,
    dismissCancelConfirm,

    // Clear confirmation
    showClearConfirm,
    setShowClearConfirm,
    skipClearConfirm,
    setSkipClearConfirm,
    clearConfirmTitle,
    setClearConfirmTitle,
    clearConfirmMessage,
    setClearConfirmMessage,
    promptClearBatchProgress,
    dismissClearBatchProgress,
    confirmClearBatchProgress,
    clearSkipPreference,
  };
}
