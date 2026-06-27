import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Heart, Image as ImageIcon, Calendar, Lock } from "lucide-react";

const items = [
  { to: "/", label: "Início", Icon: Home },
  { to: "/historia", label: "História", Icon: Heart },
  { to: "/linha-do-tempo", label: "Linha", Icon: Calendar },
  { to: "/album", label: "Álbum", Icon: ImageIcon },
  { to: "/painel", label: "Painel", Icon: Lock },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3 pointer-events-none">
      <div className="pointer-events-auto flex w-full max-w-md items-center justify-between gap-1 rounded-full border border-[var(--gold)]/30 bg-[var(--ivory)]/95 px-3 py-2 shadow-[var(--shadow-card)] backdrop-blur-xl">
        {items.map(({ to, label, Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`group flex flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-1.5 transition-all ${
                active ? "bg-[var(--gold)]/15 text-[var(--gold-deep)]" : "text-[var(--cocoa)]/55"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              <span className="font-serif-caps text-[9px]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
