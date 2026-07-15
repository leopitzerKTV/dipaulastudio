import { ReactNode } from "react";
import { MapPin } from "lucide-react";
import { OrnamentLine } from "./OrnamentLine";
import type { Palette } from "../../lib/inviteTypes";

export function EditorPreview({
  previewRef,
  brideName,
  groomName,
  date,
  time,
  venue,
  city,
  message,
  tagline,
  palette,
  imageSrc,
}: {
  previewRef: React.RefObject<HTMLDivElement>;
  brideName: string;
  groomName: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  message: string;
  tagline: string;
  palette: Palette;
  imageSrc: string;
}) {
  return (
    <div className="flex justify-center" data-tour="preview">
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
            <span
              className="block font-display italic text-[34px] my-0.5"
              style={{ color: palette.goldDeep }}
            >
              e
            </span>
            {groomName}
          </h2>
          <OrnamentLine color={palette.gold} className="mt-4" />
        </div>

        <div className="relative mx-5 mt-5 aspect-[9/13] overflow-hidden rounded-2xl">
          <img
            src={imageSrc}
            alt="Cerimônia"
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
          />
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
            <span>
              {venue} · {city}
            </span>
          </div>
          <OrnamentLine color={palette.gold} className="mt-3" />
          <p className="mt-2 font-serif-caps text-[9px]" style={{ color: palette.goldDeep }}>
            Nossa História
          </p>
        </div>
      </div>
    </div>
  );
}
