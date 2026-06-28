import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrCode({ value, size = 160 }: { value: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      color: {
        dark: "#5c4033",
        light: "#fbf7ee",
      },
    }).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        className="animate-pulse rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)]"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <img
      src={dataUrl}
      alt="QR code para o Manual do Convidado"
      className="rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)] p-2 shadow-[var(--shadow-card)]"
      width={size}
      height={size}
    />
  );
}
