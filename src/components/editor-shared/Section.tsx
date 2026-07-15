import { ReactNode } from "react";

export function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  children: ReactNode;
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
