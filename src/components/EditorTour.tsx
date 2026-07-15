import { useEffect, useLayoutEffect, useState } from "react";
import { ArrowLeft, ArrowRight, X, Sparkles } from "lucide-react";

export type TourStep = {
  selector: string;
  title: string;
  body: string;
};

type Rect = { top: number; left: number; width: number; height: number };

const PAD = 8;

function getRect(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return {
    top: r.top - PAD,
    left: r.left - PAD,
    width: r.width + PAD * 2,
    height: r.height + PAD * 2,
  };
}

export function EditorTour({
  steps,
  open,
  onClose,
}: {
  steps: TourStep[];
  open: boolean;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (open) setIndex(0);
  }, [open]);

  const step = steps[index];

  useLayoutEffect(() => {
    if (!open || !step) return;
    let raf = 0;
    const update = () => {
      const el = document.querySelector(step.selector);
      if (!el) {
        setRect(null);
        return;
      }
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      raf = window.requestAnimationFrame(() => {
        setRect(getRect(el));
      });
    };
    update();
    const onScrollResize = () => {
      const el = document.querySelector(step.selector);
      if (el) setRect(getRect(el));
    };
    window.addEventListener("scroll", onScrollResize, true);
    window.addEventListener("resize", onScrollResize);
    const interval = window.setInterval(onScrollResize, 250);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScrollResize, true);
      window.removeEventListener("resize", onScrollResize);
      window.clearInterval(interval);
    };
  }, [open, step]);

  if (!open || !step) return null;

  const isLast = index === steps.length - 1;
  const isFirst = index === 0;

  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const vh = typeof window !== "undefined" ? window.innerHeight : 768;
  const tooltipWidth = Math.min(340, vw - 24);

  let tipTop = 24;
  let tipLeft = 24;
  if (rect) {
    const spaceBelow = vh - (rect.top + rect.height);
    const spaceAbove = rect.top;
    const placeBelow = spaceBelow > 200 || spaceBelow >= spaceAbove;
    tipTop = placeBelow ? rect.top + rect.height + 12 : Math.max(12, rect.top - 220);
    tipLeft = Math.min(
      Math.max(12, rect.left + rect.width / 2 - tooltipWidth / 2),
      vw - tooltipWidth - 12,
    );
  }

  return (
    <div className="fixed inset-0 z-[80]">
      {/* Dark overlay with cutout */}
      {rect ? (
        <>
          <div
            className="fixed bg-[var(--cocoa)]/70 transition-all"
            style={{ top: 0, left: 0, right: 0, height: Math.max(0, rect.top) }}
          />
          <div
            className="fixed bg-[var(--cocoa)]/70 transition-all"
            style={{ top: rect.top + rect.height, left: 0, right: 0, bottom: 0 }}
          />
          <div
            className="fixed bg-[var(--cocoa)]/70 transition-all"
            style={{ top: rect.top, left: 0, width: Math.max(0, rect.left), height: rect.height }}
          />
          <div
            className="fixed bg-[var(--cocoa)]/70 transition-all"
            style={{
              top: rect.top,
              left: rect.left + rect.width,
              right: 0,
              height: rect.height,
            }}
          />
          {/* Highlight ring */}
          <div
            className="pointer-events-none fixed rounded-2xl ring-2 ring-[var(--gold-deep)] shadow-[0_0_0_4px_rgba(212,175,55,0.25)] transition-all"
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            }}
          />
        </>
      ) : (
        <div className="fixed inset-0 bg-[var(--cocoa)]/70" />
      )}

      {/* Tooltip */}
      <div
        className="fixed rounded-2xl border border-[var(--gold)]/40 bg-[var(--ivory)] p-4 shadow-[var(--shadow-luxe)]"
        style={{ top: tipTop, left: tipLeft, width: tooltipWidth }}
      >
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--gold-deep)]" />
          <span className="font-serif-caps text-[9px] text-[var(--gold-deep)]/80">
            Passo {index + 1} de {steps.length}
          </span>
          <button
            onClick={onClose}
            className="ml-auto rounded-full p-1 text-[var(--cocoa)]/50 hover:bg-[var(--gold)]/10 hover:text-[var(--cocoa)]"
            aria-label="Fechar tour"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <h4 className="font-display text-lg text-[var(--cocoa)]">{step.title}</h4>
        <p className="mt-1 font-display text-[13px] italic leading-snug text-[var(--cocoa)]/80">
          {step.body}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="font-serif-caps text-[10px] text-[var(--cocoa)]/60 hover:text-[var(--cocoa)]"
          >
            pular tour
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={isFirst}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--gold-deep)]/40 px-3 py-1.5 font-serif-caps text-[10px] text-[var(--gold-deep)] hover:bg-[var(--gold)]/10 disabled:opacity-40"
            >
              <ArrowLeft className="h-3 w-3" /> anterior
            </button>
            {isLast ? (
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--cocoa)] px-3 py-1.5 font-serif-caps text-[10px] text-[var(--ivory)] hover:opacity-90"
              >
                concluir
              </button>
            ) : (
              <button
                onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--cocoa)] px-3 py-1.5 font-serif-caps text-[10px] text-[var(--ivory)] hover:opacity-90"
              >
                próximo <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Progress dots */}
        <div className="mt-3 flex justify-center gap-1">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === index ? "w-6 bg-[var(--gold-deep)]" : "w-1.5 bg-[var(--gold-deep)]/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
