import type { ReactNode } from "react";

export function PhoneFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`phone-frame ${className}`}>
      <div className="absolute left-1/2 top-2 z-30 h-5 w-24 -translate-x-1/2 rounded-full bg-black/90" />
      <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] bg-[var(--ivory)]">
        {children}
      </div>
    </div>
  );
}
