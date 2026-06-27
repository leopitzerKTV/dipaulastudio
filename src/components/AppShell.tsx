import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-md overflow-x-hidden pb-24">
      {children}
      <BottomNav />
    </div>
  );
}
