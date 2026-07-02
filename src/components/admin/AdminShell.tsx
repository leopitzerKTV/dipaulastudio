import type { ReactNode } from "react";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_60%),_var(--ivory)] px-4 py-10 text-[var(--cocoa)]">
      <div className="mx-auto w-full max-w-6xl rounded-[32px] border border-[var(--gold)]/25 bg-white/85 p-6 shadow-[var(--shadow-luxe)] backdrop-blur">
        {children}
      </div>
    </div>
  );
}
