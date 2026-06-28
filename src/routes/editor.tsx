import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toJpeg, toPng } from "html-to-image";
import { ArrowLeft, Download, FileDown, FileImage, Image as ImageIcon, Palette, Type, Calendar, MapPin, History, Save, Trash2, Check, Package, AlertTriangle, Sparkles } from "lucide-react";
import { Ornament } from "@/components/Ornament";
import { EditorTour, type TourStep } from "@/components/EditorTour";
import ceremonyImg from "@/assets/ceremony.jpg";

const TOUR_SEEN_KEY = "nossahistoria.invite.tourSeen";

const TOUR_STEPS: TourStep[] = [
  {
    selector: "[data-tour='preview']",
    title: "Preview ao vivo",
    body: "Aqui está seu convite. Tudo que você editar à direita aparece aqui na hora, sem precisar salvar.",
  },
  {
    selector: "[data-tour='names']",
    title: "Nomes do casal",
    body: "Comece pelos nomes da noiva e do noivo — eles ganham destaque no centro do convite.",
  },
  {
    selector: "[data-tour='date']",
    title: "Data, hora e local",
    body: "Defina quando e onde a cerimônia acontece. A data aparece sobre a imagem principal.",
  },
  {
    selector: "[data-tour='message']",
    title: "Mensagem e chamada",
    body: "A 'chamada' é o convite curto no topo; a 'mensagem' é a frase em itálico abaixo da foto.",
  },
  {
    selector: "[data-tour='palette']",
    title: "Paleta de cores",
    body: "Escolha entre Champanhe, Marfim, Blush e Mogno. Toda a identidade visual muda junto.",
  },
  {
    selector: "[data-tour='image']",
    title: "Imagem principal",
    body: "Use uma foto sua na proporção 9:16 para um resultado ideal. Ela vira o coração do convite.",
  },
  {
    selector: "[data-tour='versions']",
    title: "Versões salvas",
    body: "Salve quantas variações quiser e volte a qualquer uma com um clique. Seu rascunho atual é guardado automaticamente.",
  },
  {
    selector: "[data-tour='export']",
    title: "Exportar arquivos",
    body: "Baixe o convite em PNG, JPG ou PDF A4, ou gere o ZIP em lote com os três arquivos prontos.",
  },
];

const DRAFT_KEY = "nossahistoria.invite.draft";
const VERSIONS_KEY = "nossahistoria.invite.versions";
const BATCH_PARTIAL_KEY = "nossahistoria.invite.batchPartial";
const BATCH_CLEAR_SKIP_CONFIRM_KEY = "nossahistoria.invite.skipClearConfirm";
const BATCH_CLEAR_TITLE_KEY = "nossahistoria.invite.clearConfirmTitle";
const BATCH_CLEAR_MESSAGE_KEY = "nossahistoria.invite.clearConfirmMessage";
const MAX_VERSIONS = 12;

type PersistedBatchPartial = {
  pngUrl?: string;
  jpgUrl?: string;
  pdfBase64?: string;
};

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(b64: string, type = "application/pdf"): Blob {
  const bin = atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
}


type InviteDraft = {
  brideName: string;
  groomName: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  message: string;
  tagline: string;
  paletteId: string;
  imageSrc: string;
};

type SavedVersion = InviteDraft & { id: string; savedAt: number; label: string };

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const Route = createFileRoute("/editor")({
  head: () => ({
    meta: [
      { title: "Editor do Convite — Nossa História" },
      { name: "description", content: "Personalize seu convite digital: nomes, data, mensagem, cores e imagem. Exporte em alta resolução." },
    ],
  }),
  component: Editor,
});

type Palette = {
  id: string;
  name: string;
  bg: string;
  card: string;
  ink: string;
  gold: string;
  goldDeep: string;
  gradient: string;
};

const PALETTES: Palette[] = [
  {
    id: "champagne",
    name: "Champanhe & Ouro",
    bg: "#f7f1e6",
    card: "#fbf6ec",
    ink: "#3a2a1c",
    gold: "#c9a55b",
    goldDeep: "#9c7a3a",
    gradient: "linear-gradient(135deg,#9c7a3a,#e1c279)",
  },
  {
    id: "ivory",
    name: "Marfim & Ouro Claro",
    bg: "#fbf8f1",
    card: "#ffffff",
    ink: "#2b2218",
    gold: "#d6b773",
    goldDeep: "#a98a44",
    gradient: "linear-gradient(135deg,#b8923f,#ecd292)",
  },
  {
    id: "blush",
    name: "Blush & Ouro Rosê",
    bg: "#f7ecec",
    card: "#fdf5f3",
    ink: "#3a2024",
    gold: "#c79a7a",
    goldDeep: "#a3704f",
    gradient: "linear-gradient(135deg,#a3704f,#e9c0a5)",
  },
  {
    id: "mahogany",
    name: "Mogno & Dourado",
    bg: "#f1ead8",
    card: "#f9f3df",
    ink: "#2a160e",
    gold: "#b7873a",
    goldDeep: "#7c5520",
    gradient: "linear-gradient(135deg,#7c5520,#d6ae5d)",
  },
];

function Editor() {
  const initial = loadJSON<InviteDraft | null>(DRAFT_KEY, null);
  const initialPalette =
    PALETTES.find((p) => p.id === initial?.paletteId) ?? PALETTES[0];

  const [brideName, setBrideName] = useState(initial?.brideName ?? "Amanda");
  const [groomName, setGroomName] = useState(initial?.groomName ?? "Ricardo");
  const [date, setDate] = useState(initial?.date ?? "24 · Maio · 2025");
  const [time, setTime] = useState(initial?.time ?? "Sábado, às 16h30");
  const [venue, setVenue] = useState(initial?.venue ?? "Espaço Jardim Secreto");
  const [city, setCity] = useState(initial?.city ?? "São Paulo · SP");
  const [message, setMessage] = useState(
    initial?.message ??
      "Com a bênção de nossas famílias, convidamos você para celebrar o nosso amor.",
  );
  const [tagline, setTagline] = useState(
    initial?.tagline ?? "você está convidado para o nosso casamento",
  );
  const [palette, setPalette] = useState<Palette>(initialPalette);
  const [imageSrc, setImageSrc] = useState<string>(initial?.imageSrc ?? ceremonyImg);
  const [exporting, setExporting] = useState(false);
  const [versions, setVersions] = useState<SavedVersion[]>(() =>
    loadJSON<SavedVersion[]>(VERSIONS_KEY, []),
  );
  const [autoStatus, setAutoStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [tourOpen, setTourOpen] = useState(false);

  // Auto-launch tour on first visit
  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem(TOUR_SEEN_KEY);
    if (!seen) {
      const t = window.setTimeout(() => setTourOpen(true), 400);
      return () => window.clearTimeout(t);
    }
  }, []);

  const closeTour = () => {
    setTourOpen(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOUR_SEEN_KEY, "1");
    }
  };

  const previewRef = useRef<HTMLDivElement>(null);

  const draft: InviteDraft = {
    brideName, groomName, date, time, venue, city, message, tagline,
    paletteId: palette.id, imageSrc,
  };

  // Autosave (debounced) to localStorage
  useEffect(() => {
    setAutoStatus("saving");
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        setAutoStatus("saved");
      } catch {
        setAutoStatus("idle");
      }
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brideName, groomName, date, time, venue, city, message, tagline, palette.id, imageSrc]);

  // Invalidate partial batch results when the invitation content changes
  useEffect(() => {
    if (batchPartial) setBatchPartial(null);
    if (batchPreview) {
      URL.revokeObjectURL(batchPreview.pdfBlobUrl);
      setBatchPreview(null);
    }
    try {
      window.localStorage.removeItem(BATCH_PARTIAL_KEY);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brideName, groomName, date, time, venue, city, message, tagline, palette.id, imageSrc]);

  function saveVersion() {
    const v: SavedVersion = {
      ...draft,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      savedAt: Date.now(),
      label: `${brideName} & ${groomName}`,
    };
    const next = [v, ...versions].slice(0, MAX_VERSIONS);
    setVersions(next);
    try {
      window.localStorage.setItem(VERSIONS_KEY, JSON.stringify(next));
    } catch {
      /* quota exceeded — skip */
    }
  }

  function loadVersion(v: SavedVersion) {
    setBrideName(v.brideName);
    setGroomName(v.groomName);
    setDate(v.date);
    setTime(v.time);
    setVenue(v.venue);
    setCity(v.city);
    setMessage(v.message);
    setTagline(v.tagline);
    setPalette(PALETTES.find((p) => p.id === v.paletteId) ?? PALETTES[0]);
    setImageSrc(v.imageSrc);
  }

  function deleteVersion(id: string) {
    const next = versions.filter((v) => v.id !== id);
    setVersions(next);
    window.localStorage.setItem(VERSIONS_KEY, JSON.stringify(next));
  }



  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(String(reader.result));
    reader.readAsDataURL(file);
  }

  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingJpg, setExportingJpg] = useState(false);

  async function onExportJpg() {
    if (!previewRef.current) return;
    setExportingJpg(true);
    try {
      const dataUrl = await toJpeg(previewRef.current, {
        pixelRatio: 4,
        cacheBust: true,
        quality: 0.95,
        backgroundColor: palette.bg,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `convite-${brideName}-${groomName}.jpg`.toLowerCase().replace(/\s+/g, "-");
      a.click();
    } finally {
      setExportingJpg(false);
    }
  }

  async function renderHighResPng() {
    if (!previewRef.current) return null;
    return toPng(previewRef.current, {
      pixelRatio: 4,
      cacheBust: true,
      backgroundColor: palette.bg,
    });
  }

  async function onExport() {
    setExporting(true);
    try {
      const dataUrl = await renderHighResPng();
      if (!dataUrl) return;
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `convite-${brideName}-${groomName}.png`.toLowerCase().replace(/\s+/g, "-");
      a.click();
    } finally {
      setExporting(false);
    }
  }

  async function onExportPdf() {
    setExportingPdf(true);
    try {
      const dataUrl = await renderHighResPng();
      if (!dataUrl) return;
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      // A4 portrait 210×297 mm — centraliza o convite 9:16 com margem segura.
      const pageW = 210;
      const pageH = 297;
      const marginY = 12;
      const imgH = pageH - marginY * 2; // 273 mm
      const imgW = (imgH * 9) / 16; // ≈ 153.56 mm
      const offsetX = (pageW - imgW) / 2;
      pdf.addImage(dataUrl, "PNG", offsetX, marginY, imgW, imgH, undefined, "FAST");
      pdf.save(`convite-${brideName}-${groomName}.pdf`.toLowerCase().replace(/\s+/g, "-"));
    } finally {
      setExportingPdf(false);
    }
  }

  const [exportingZip, setExportingZip] = useState(false);
  const [preparingBatch, setPreparingBatch] = useState(false);
  const [cancellingBatch, setCancellingBatch] = useState(false);
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
        pdfBlob = base64ToBlob(parsed.pdfBase64);
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
  const anyExporting = exporting || exportingPdf || exportingJpg || exportingZip || preparingBatch || cancellingBatch;

  // Persist partial batch progress so a reload can resume from where it stopped
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!batchPartial || (!batchPartial.pngUrl && !batchPartial.jpgUrl && !batchPartial.pdfBlob)) {
          window.localStorage.removeItem(BATCH_PARTIAL_KEY);
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
        window.localStorage.setItem(BATCH_PARTIAL_KEY, JSON.stringify(payload));
      } catch {
        // localStorage quota or serialization issue — ignore; resume best-effort
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [batchPartial]);



  const [batchProgress, setBatchProgress] = useState<{ step: number; total: number; label: string }>({
    step: 0,
    total: 4,
    label: "",
  });

  const cancelBatchRef = useRef(false);
  const [cancelled, setCancelled] = useState(false);
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

  // Persist custom clear-confirmation title and message
  useEffect(() => {
    try {
      window.localStorage.setItem(BATCH_CLEAR_TITLE_KEY, JSON.stringify(clearConfirmTitle));
    } catch {}
    try {
      window.localStorage.setItem(BATCH_CLEAR_MESSAGE_KEY, JSON.stringify(clearConfirmMessage));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearConfirmTitle, clearConfirmMessage]);

  function promptCancelBatch() {
    setShowCancelConfirm(true);
  }

  function confirmCancelBatch() {
    cancelBatchRef.current = true;
    setCancelled(true);
    setCancellingBatch(true);
    setShowCancelConfirm(false);
  }

  function dismissCancelConfirm() {
    setShowCancelConfirm(false);
  }

  function promptClearBatchProgress() {
    const skip = loadJSON<boolean>(BATCH_CLEAR_SKIP_CONFIRM_KEY, false);
    if (skip) {
      confirmClearBatchProgress(false);
    } else {
      setShowClearConfirm(true);
    }
  }

  function dismissClearBatchProgress() {
    setShowClearConfirm(false);
  }

  function confirmClearBatchProgress(saveSkipPreference: boolean) {
    try {
      window.localStorage.removeItem(BATCH_PARTIAL_KEY);
      if (saveSkipPreference) {
        window.localStorage.setItem(BATCH_CLEAR_SKIP_CONFIRM_KEY, JSON.stringify(true));
      }
    } catch {}
    if (batchPartial?.pdfBlobUrl) URL.revokeObjectURL(batchPartial.pdfBlobUrl);
    setBatchPartial(null);
    setShowClearConfirm(false);
  }

  function clearSkipPreference() {
    try {
      window.localStorage.removeItem(BATCH_CLEAR_SKIP_CONFIRM_KEY);
    } catch {}
  }

  async function onPrepareBatch() {
    if (!previewRef.current) return;
    cancelBatchRef.current = false;
    setCancelled(false);
    setCancellingBatch(false);
    setPreparingBatch(true);
    const tick = (step: number, label: string) =>
      setBatchProgress({ step, total: 4, label });
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
          pixelRatio: 4, cacheBust: true, backgroundColor: palette.bg,
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
          pixelRatio: 4, cacheBust: true, quality: 0.95, backgroundColor: palette.bg,
        });
        setBatchPartial((prev) => ({ ...prev, pngUrl, jpgUrl }));
      } else {
        tick(2, "JPG já renderizado. Retomando…");
        await new Promise((r) => setTimeout(r, 30));
      }
      checkCancel();

      if (!pdfBlob || !pdfBlobUrl) {
        tick(3, "Montando PDF A4…");
        const pdf = new jsPDFMod.jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
        const pageW = 210, pageH = 297, marginY = 12;
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
      setBatchPreview({ pngUrl: pngUrl!, jpgUrl: jpgUrl!, pdfBlobUrl: pdfBlobUrl!, pdfBlob: pdfBlob! });
      setBatchPartial(null);
    } catch (err) {
      if ((err as Error).message !== "CANCELLED") throw err;
    } finally {
      setPreparingBatch(false);
      setCancellingBatch(false);
      cancelBatchRef.current = false;
    }
  }




  function closeBatchPreview() {
    if (batchPreview) URL.revokeObjectURL(batchPreview.pdfBlobUrl);
    setBatchPreview(null);
  }

  async function confirmDownloadZip() {
    if (!batchPreview) return;
    setExportingZip(true);
    try {
      const { default: JSZip } = await import("jszip");
      const slug = `convite-${brideName}-${groomName}`.toLowerCase().replace(/\s+/g, "-");
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
  }




  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: `radial-gradient(ellipse at top, ${palette.gold}22, transparent 60%), ${palette.bg}`,
      }}
    >
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--gold)]/20 bg-[var(--ivory)]/85 px-4 py-3 backdrop-blur-xl">
        <Link to="/" className="inline-flex items-center gap-2 text-[var(--cocoa)]/70 hover:text-[var(--cocoa)]">
          <ArrowLeft className="h-4 w-4" />
          <span className="font-serif-caps text-[10px]">voltar</span>
        </Link>
        <div className="flex flex-col items-center">
          <h1 className="font-display text-lg text-[var(--cocoa)]">Editor do Convite</h1>
          <span className="font-serif-caps text-[9px] text-[var(--gold-deep)]/80 flex items-center gap-1">
            {autoStatus === "saving" ? (
              <><Save className="h-2.5 w-2.5 animate-pulse" /> salvando…</>
            ) : autoStatus === "saved" ? (
              <><Check className="h-2.5 w-2.5" /> rascunho salvo</>
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
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_380px]">
        {/* Preview */}
        <div className="flex justify-center">
          <div
            ref={previewRef}
            className="relative aspect-[9/16] w-full max-w-[420px] overflow-hidden rounded-[2rem] shadow-[var(--shadow-luxe)]"
            style={{ background: palette.card, color: palette.ink }}
          >
            <div className="px-7 pt-9 text-center">
              <p className="font-serif-caps text-[10px]" style={{ color: palette.goldDeep }}>
                Convite Digital
              </p>
              <OrnamentLine color={palette.gold} className="mt-3" />
              <p className="mt-4 font-display text-[13px] italic opacity-70">{tagline}</p>
              <h2 className="mt-2 font-display text-[56px] leading-[0.95]">
                {brideName}
                <span className="block font-display italic text-[34px] my-0.5" style={{ color: palette.goldDeep }}>
                  e
                </span>
                {groomName}
              </h2>
              <OrnamentLine color={palette.gold} className="mt-4" />
            </div>

            <div className="relative mx-5 mt-5 aspect-[9/13] overflow-hidden rounded-2xl">
              <img src={imageSrc} alt="Cerimônia" className="h-full w-full object-cover" crossOrigin="anonymous" />
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(to top, ${palette.ink}cc, transparent 55%)` }}
              />
              <div className="absolute inset-x-0 bottom-0 p-4 text-[var(--ivory)]">
                <p className="font-serif-caps text-[10px] opacity-90">{date}</p>
                <p className="font-display text-base mt-0.5">{time}</p>
              </div>
            </div>

            <div className="px-7 pt-4 text-center">
              <p className="font-display text-[13px] italic opacity-80">"{message}"</p>
              <div className="mt-3 flex items-center justify-center gap-2 text-[11px] opacity-80">
                <MapPin className="h-3 w-3" style={{ color: palette.goldDeep }} />
                <span>{venue} · {city}</span>
              </div>
              <OrnamentLine color={palette.gold} className="mt-3" />
              <p className="mt-2 font-serif-caps text-[9px]" style={{ color: palette.goldDeep }}>
                Nossa História
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <aside className="space-y-5">
          <Section icon={Type} title="Nomes do casal">
            <Field label="Noiva" value={brideName} onChange={setBrideName} />
            <Field label="Noivo" value={groomName} onChange={setGroomName} />
          </Section>

          <Section icon={Calendar} title="Data & cerimônia">
            <Field label="Data" value={date} onChange={setDate} />
            <Field label="Hora" value={time} onChange={setTime} />
            <Field label="Local" value={venue} onChange={setVenue} />
            <Field label="Cidade" value={city} onChange={setCity} />
          </Section>

          <Section icon={Type} title="Mensagem">
            <Field label="Chamada" value={tagline} onChange={setTagline} />
            <Field label="Convite" value={message} onChange={setMessage} multiline />
          </Section>

          <Section icon={Palette} title="Paleta">
            <div className="grid grid-cols-2 gap-2">
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPalette(p)}
                  className={`rounded-xl border p-2 text-left transition-all ${
                    palette.id === p.id
                      ? "border-[var(--gold-deep)] shadow-[var(--shadow-card)]"
                      : "border-[var(--gold)]/25 hover:border-[var(--gold)]/60"
                  }`}
                  style={{ background: p.card }}
                >
                  <div className="flex gap-1">
                    <span className="h-5 w-5 rounded-full" style={{ background: p.gold }} />
                    <span className="h-5 w-5 rounded-full" style={{ background: p.goldDeep }} />
                    <span className="h-5 w-5 rounded-full border border-[var(--gold)]/30" style={{ background: p.bg }} />
                  </div>
                  <p className="mt-1.5 font-display text-xs" style={{ color: p.ink }}>
                    {p.name}
                  </p>
                </button>
              ))}
            </div>
          </Section>

          <Section icon={ImageIcon} title="Imagem principal">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--gold)]/45 bg-[var(--card)] px-3 py-4 font-serif-caps text-[10px] text-[var(--gold-deep)] hover:bg-[var(--gold)]/5">
              <ImageIcon className="h-3.5 w-3.5" />
              Escolher imagem (9:16)
              <input type="file" accept="image/*" className="hidden" onChange={onPickImage} />
            </label>
          </Section>

          <Section icon={History} title="Versões salvas">
            <button
              onClick={saveVersion}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3 py-2 font-serif-caps text-[10px] text-[var(--gold-deep)] hover:bg-[var(--gold)]/20"
            >
              <Save className="h-3 w-3" /> Salvar versão atual
            </button>
            {versions.length === 0 ? (
              <p className="text-center font-display text-[12px] italic text-[var(--cocoa)]/50">
                Nenhuma versão salva ainda. Seu rascunho é guardado automaticamente.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {versions.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-[var(--gold)]/20 bg-[var(--ivory)] px-2.5 py-2"
                  >
                    <button onClick={() => loadVersion(v)} className="flex-1 text-left">
                      <p className="font-display text-sm text-[var(--cocoa)] leading-tight">{v.label}</p>
                      <p className="font-serif-caps text-[9px] text-[var(--gold-deep)]/70">
                        {new Date(v.savedAt).toLocaleString("pt-BR", {
                          day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </button>
                    <button
                      onClick={() => deleteVersion(v.id)}
                      className="rounded-md p-1.5 text-[var(--cocoa)]/40 hover:bg-red-50 hover:text-red-500"
                      aria-label="Excluir versão"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section icon={AlertTriangle} title="Aviso de apagar progresso">
            <Field
              label="Título do modal"
              value={clearConfirmTitle}
              onChange={setClearConfirmTitle}
            />
            <Field
              label="Mensagem do modal"
              value={clearConfirmMessage}
              onChange={setClearConfirmMessage}
              multiline
            />
            <button
              onClick={() => {
                setClearConfirmTitle("Apagar progresso salvo?");
                setClearConfirmMessage(
                  "Você tem um progresso de geração salvo. Se apagar, perderá o que já foi renderizado de PNG, JPG e PDF e terá que começar do zero.",
                );
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3 py-2 font-serif-caps text-[10px] text-[var(--gold-deep)] hover:bg-[var(--gold)]/20"
            >
              <Trash2 className="h-3 w-3" /> Restaurar texto padrão
            </button>
          </Section>

          <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onExport}
            disabled={anyExporting}
            className="inline-flex flex-col items-center justify-center gap-1 rounded-2xl border border-[var(--gold-deep)]/40 bg-[var(--ivory)] py-3 font-serif-caps text-[10px] text-[var(--gold-deep)] hover:bg-[var(--gold)]/10 disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {exporting ? "…" : "PNG 9:16"}
          </button>
          <button
            onClick={onExportJpg}
            disabled={anyExporting}
            className="inline-flex flex-col items-center justify-center gap-1 rounded-2xl border border-[var(--gold-deep)]/40 bg-[var(--ivory)] py-3 font-serif-caps text-[10px] text-[var(--gold-deep)] hover:bg-[var(--gold)]/10 disabled:opacity-60"
          >
            <FileImage className="h-4 w-4" />
            {exportingJpg ? "…" : "JPG 9:16"}
          </button>
          <button
            onClick={onExportPdf}
            disabled={anyExporting}
              className="inline-flex flex-col items-center justify-center gap-1 rounded-2xl py-3 font-serif-caps text-[10px] text-[var(--ivory)] shadow-[var(--shadow-card)] disabled:opacity-60"
              style={{ background: palette.gradient }}
            >
              <FileDown className="h-4 w-4" />
              {exportingPdf ? "…" : "PDF A4"}
            </button>
          </div>
          <button
            onClick={onPrepareBatch}
            disabled={anyExporting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--cocoa)] py-3 font-serif-caps text-[10px] text-[var(--ivory)] shadow-[var(--shadow-card)] hover:opacity-90 disabled:opacity-60"
          >
            <Package className="h-4 w-4" />
            {preparingBatch
              ? "Preparando prévia…"
              : batchPartial
              ? "Retomar prévia (PNG + JPG + PDF)"
              : "Prévia em lote (PNG + JPG + PDF)"}
          </button>

          {batchPartial && (
            <button
              onClick={promptClearBatchProgress}
              disabled={preparingBatch}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-300 bg-red-50 px-3 py-2 font-serif-caps text-[10px] text-red-600 hover:bg-red-100 disabled:opacity-60"
            >
              <Trash2 className="h-3 w-3" />
              Limpar progresso salvo e recomeçar
            </button>
          )}
        </aside>
      </div>

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
                    onClick={dismissCancelConfirm}
                    disabled={cancellingBatch}
                    className="flex-1 rounded-full border border-[var(--gold-deep)]/40 bg-white px-3 py-2 font-serif-caps text-[10px] text-[var(--cocoa)] hover:bg-[var(--gold)]/10 disabled:opacity-60"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={confirmCancelBatch}
                    disabled={cancellingBatch}
                    className="flex-1 rounded-full bg-red-600 px-3 py-2 font-serif-caps text-[10px] text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {cancellingBatch ? "Cancelando…" : "Sim, cancelar"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={promptCancelBatch}
                disabled={cancelled || cancellingBatch}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-red-300 bg-white px-3 py-2 font-serif-caps text-[10px] text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 className="h-3 w-3" />
                {cancellingBatch ? "Cancelando geração…" : cancelled ? "Cancelando…" : "Cancelar geração"}
              </button>
            )}
          </div>
        </div>
      )}

      {batchPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--cocoa)]/70 p-4 backdrop-blur-sm"
          onClick={closeBatchPreview}
        >
          <div
            className="w-full max-w-2xl rounded-3xl border border-[var(--gold)]/30 bg-[var(--ivory)] p-6 shadow-[var(--shadow-luxe)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-xl text-[var(--cocoa)]">Confira antes de gerar o ZIP</h3>
                <p className="font-serif-caps text-[10px] text-[var(--gold-deep)]/80">
                  prévia dos 3 arquivos que serão incluídos
                </p>
              </div>
              <button
                onClick={closeBatchPreview}
                className="rounded-full border border-[var(--gold)]/30 px-3 py-1 font-serif-caps text-[10px] text-[var(--cocoa)]/70 hover:bg-[var(--gold)]/10"
              >
                Cancelar
              </button>
            </div>

            {(() => {
              const slug = `convite-${brideName}-${groomName}`.toLowerCase().replace(/\s+/g, "-");
              const downloadHref = (href: string, filename: string) => {
                const a = document.createElement("a");
                a.href = href;
                a.download = filename;
                a.click();
              };
              return (
                <div className="grid grid-cols-3 gap-3">
                  <PreviewTile
                    label="PNG 9:16"
                    sub="alta resolução"
                    onDownload={() => downloadHref(batchPreview.pngUrl, `${slug}.png`)}
                  >
                    <img src={batchPreview.pngUrl} alt="Prévia PNG" className="h-full w-full object-cover" />
                  </PreviewTile>
                  <PreviewTile
                    label="JPG 9:16"
                    sub="qualidade 95%"
                    onDownload={() => downloadHref(batchPreview.jpgUrl, `${slug}.jpg`)}
                  >
                    <img src={batchPreview.jpgUrl} alt="Prévia JPG" className="h-full w-full object-cover" />
                  </PreviewTile>
                  <PreviewTile
                    label="PDF A4"
                    sub="vertical"
                    onDownload={() => downloadHref(batchPreview.pdfBlobUrl, `${slug}.pdf`)}
                  >
                    <iframe
                      src={`${batchPreview.pdfBlobUrl}#toolbar=0&navpanes=0&view=FitH`}
                      title="Prévia PDF"
                      className="h-full w-full"
                    />
                  </PreviewTile>
                </div>
              );
            })()}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={onPrepareBatch}
                disabled={preparingBatch || exportingZip}
                className="rounded-full border border-[var(--gold-deep)]/40 px-4 py-2 font-serif-caps text-[10px] text-[var(--gold-deep)] hover:bg-[var(--gold)]/10 disabled:opacity-60"
              >
                {preparingBatch ? "Atualizando…" : "Atualizar prévia"}
              </button>
              <button
                onClick={confirmDownloadZip}
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
          onClick={dismissClearBatchProgress}
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
                onChange={(e) => setSkipClearConfirm(e.target.checked)}
                className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
              />
              <span className="font-serif-caps text-[10px] text-[var(--cocoa)]/80">
                Não perguntar novamente
              </span>
            </label>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={dismissClearBatchProgress}
                disabled={preparingBatch}
                className="flex-1 rounded-full border border-[var(--gold-deep)]/40 bg-white px-4 py-2 font-serif-caps text-[10px] text-[var(--cocoa)] hover:bg-[var(--gold)]/10 disabled:opacity-60"
              >
                Manter progresso
              </button>
              <button
                onClick={() => confirmClearBatchProgress(skipClearConfirm)}
                disabled={preparingBatch}
                className="flex-1 rounded-full bg-red-600 px-4 py-2 font-serif-caps text-[10px] text-white hover:bg-red-700 disabled:opacity-60"
              >
                Apagar e recomeçar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const cls =
    "w-full rounded-lg border border-[var(--gold)]/25 bg-[var(--ivory)] px-3 py-2 text-sm text-[var(--cocoa)] outline-none focus:border-[var(--gold-deep)]";
  return (
    <label className="block">
      <span className="mb-1 block font-serif-caps text-[9px] text-[var(--gold-deep)]/80">{label}</span>
      {multiline ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </label>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)] p-4 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--gold)]/15 text-[var(--gold-deep)]">
          <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
        </span>
        <h3 className="font-display text-base text-[var(--cocoa)]">{title}</h3>
      </div>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function OrnamentLine({ color, className = "" }: { color: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <span className="h-px w-10" style={{ background: `linear-gradient(to right, transparent, ${color})` }} />
      <svg width="20" height="13" viewBox="0 0 22 14" fill="none" style={{ color }}>
        <path
          d="M11 13C5.5 8 2 7 2 4.5C2 2.5 4 1 6 1.5C8 2 10 4 11 5.5C12 4 14 2 16 1.5C18 1 20 2.5 20 4.5C20 7 16.5 8 11 13Z"
          stroke="currentColor"
          strokeWidth="0.9"
          fill="currentColor"
          fillOpacity="0.2"
        />
      </svg>
      <span className="h-px w-10" style={{ background: `linear-gradient(to left, transparent, ${color})` }} />
    </div>
  );
}

function PreviewTile({
  label,
  sub,
  children,
  onDownload,
}: {
  label: string;
  sub: string;
  children: React.ReactNode;
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
