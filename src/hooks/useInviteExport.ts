import { useRef, useState } from "react";
import { toPng, toJpeg } from "html-to-image";
import { InviteDraft, Palette } from "@/lib/inviteTypes";

export function useInviteExport(palette: Palette, draft: InviteDraft) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingJpg, setExportingJpg] = useState(false);

  const renderHighResPng = async () => {
    if (!previewRef.current) return null;
    return toPng(previewRef.current, {
      pixelRatio: 4,
      cacheBust: true,
      backgroundColor: palette.bg,
    });
  };

  const onExportJpg = async () => {
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
      a.download = `convite-${draft.brideName}-${draft.groomName}`
        .toLowerCase()
        .replace(/\s+/g, "-") + ".jpg";
      a.click();
    } finally {
      setExportingJpg(false);
    }
  };

  const onExport = async () => {
    setExporting(true);
    try {
      const dataUrl = await renderHighResPng();
      if (!dataUrl) return;
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `convite-${draft.brideName}-${draft.groomName}`
        .toLowerCase()
        .replace(/\s+/g, "-") + ".png";
      a.click();
    } finally {
      setExporting(false);
    }
  };

  const onExportPdf = async () => {
    setExportingPdf(true);
    try {
      const dataUrl = await renderHighResPng();
      if (!dataUrl) return;
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });
      // A4 portrait 210×297 mm — centers 9:16 invite with safe margin
      const pageW = 210;
      const pageH = 297;
      const marginY = 12;
      const imgH = pageH - marginY * 2; // 273 mm
      const imgW = (imgH * 9) / 16; // ≈ 153.56 mm
      const offsetX = (pageW - imgW) / 2;
      pdf.addImage(dataUrl, "PNG", offsetX, marginY, imgW, imgH, undefined, "FAST");
      pdf.save(
        `convite-${draft.brideName}-${draft.groomName}`
          .toLowerCase()
          .replace(/\s+/g, "-") + ".pdf",
      );
    } finally {
      setExportingPdf(false);
    }
  };

  const anyExporting = exporting || exportingPdf || exportingJpg;

  return {
    previewRef,
    exporting,
    exportingPdf,
    exportingJpg,
    anyExporting,
    renderHighResPng,
    onExport,
    onExportJpg,
    onExportPdf,
  };
}
