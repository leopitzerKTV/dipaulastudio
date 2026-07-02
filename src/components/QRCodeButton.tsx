import { useState } from "react";
import { QrCode, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import QRCodeLib from "qrcode";

interface QRCodeButtonProps {
  url: string;
  label?: string;
  className?: string;
}

export function QRCodeButton({ url, label = "QR Code", className }: QRCodeButtonProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  async function generateQR() {
    try {
      const dataUrl = await QRCodeLib.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: "#3a2a1c",
          light: "#fbf6ec",
        },
      });
      setQrDataUrl(dataUrl);
      setShowModal(true);
    } catch {
      toast.error("Não foi possível gerar o QR Code");
    }
  }

  async function downloadQR() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qrcode-convite.png`;
    a.click();
    toast.success("QR Code baixado!");
  }

  async function shareQR() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Convite de Casamento",
          text: label,
          url,
        });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  }

  return (
    <>
      <button
        onClick={generateQR}
        className={`inline-flex items-center gap-1.5 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3 py-1.5 text-xs font-medium text-[var(--gold-deep)] hover:bg-[var(--gold)]/20 ${className}`}
      >
        <QrCode className="h-3.5 w-3.5" /> {label}
      </button>

      {showModal && qrDataUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <h3 className="font-serif text-lg text-[var(--cocoa)] mb-4">QR Code do Convite</h3>
            <div className="mx-auto w-64 rounded-lg overflow-hidden border border-[var(--gold)]/30">
              <img src={qrDataUrl} alt="QR Code" className="w-full h-full" />
            </div>
            <p className="mt-4 font-serif-caps text-[10px] text-[var(--gold-deep)]/70 break-all">
              {url}
            </p>
            <div className="mt-6 flex gap-2 justify-center">
              <button
                onClick={downloadQR}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3 py-1.5 text-xs font-medium text-[var(--gold-deep)] hover:bg-[var(--gold)]/20"
              >
                <Download className="h-3 w-3" /> Baixar
              </button>
              <button
                onClick={shareQR}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3 py-1.5 text-xs font-medium text-[var(--gold-deep)] hover:bg-[var(--gold)]/20"
              >
                <Share2 className="h-3 w-3" /> Compartilhar
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--cocoa)]/30 bg-[var(--ivory)] px-3 py-1.5 text-xs font-medium text-[var(--cocoa)] hover:bg-[var(--cocoa)]/10"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
