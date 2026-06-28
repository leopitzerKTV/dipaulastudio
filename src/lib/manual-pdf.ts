import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Render a DOM element into a multi-page A4 PDF.
 * Returns the Blob and triggers download / Web Share when requested.
 */
export async function generateManualPdf(
  element: HTMLElement,
  filename = "manual-do-convidado.pdf",
): Promise<Blob> {
  // Render at higher scale for crispness
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#fbf7ee",
    useCORS: true,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // Fit canvas width to page width, then split vertically into pages
  const imgWidth = pageW;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;
  const imgData = canvas.toDataURL("image/jpeg", 0.92);

  pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageH;

  while (heightLeft > 0) {
    position -= pageH;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageH;
  }

  const blob = pdf.output("blob");
  return blob;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function sharePdf(blob: Blob, filename: string, title: string, text: string): Promise<boolean> {
  if (typeof navigator === "undefined") return false;
  const file = new File([blob], filename, { type: "application/pdf" });
  const nav = navigator as Navigator & {
    canShare?: (data: { files?: File[] }) => boolean;
    share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
  };
  if (nav.canShare && nav.share && nav.canShare({ files: [file] })) {
    try {
      await nav.share({ files: [file], title, text });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
