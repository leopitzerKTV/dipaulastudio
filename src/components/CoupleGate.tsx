import { useEffect, useState, type ReactNode } from "react";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type State = "loading" | "anon" | "not-couple" | "ok";

export function CoupleGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const { data: sess } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!sess.session) {
        setState("anon");
        return;
      }
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: sess.session.user.id,
        _role: "couple",
      });
      if (cancelled) return;
      if (error || !data) setState("not-couple");
      else setState("ok");
    }

    check();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        check();
      }
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--ivory)]">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--gold-deep)]" />
      </div>
    );
  }

  if (state === "anon") {
    if (typeof window !== "undefined") window.location.replace("/auth");
    return null;
  }

  if (state === "not-couple") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--ivory)] px-6">
        <div className="w-full max-w-sm rounded-3xl border border-[var(--gold)]/25 bg-white/70 p-8 text-center shadow-[var(--shadow-luxe)]">
          <h1 className="font-display text-2xl text-[var(--cocoa)]">Acesso restrito</h1>
          <p className="mt-2 text-sm text-[var(--cocoa)]/65">
            Sua conta não tem permissão para editar este convite. Apenas o casal pode alterar o conteúdo.
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              toast.success("Sessão encerrada");
              window.location.replace("/auth");
            }}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--gold-deep)] px-4 py-2.5 text-sm font-medium text-white"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
          <a href="/" className="mt-3 block text-xs text-[var(--cocoa)]/55 underline-offset-2 hover:underline">
            Voltar para o início
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export async function signOutCouple() {
  await supabase.auth.signOut();
}
