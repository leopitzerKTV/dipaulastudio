import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { Loader2, LogOut, ShieldAlert } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

export type AdminAuthStatus = "loading" | "signed_out" | "forbidden" | "authenticated";

type AdminAuthContextValue = {
  status: AdminAuthStatus;
  session: Session | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AdminAuthStatus>("loading");
  const [session, setSession] = useState<Session | null>(null);

  const refresh = useCallback(async () => {
    setStatus("loading");
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Erro ao recuperar sessão do Supabase", error);
      setSession(null);
      setStatus("signed_out");
      return;
    }

    const nextSession = data.session ?? null;
    setSession(nextSession);

    if (!nextSession) {
      setStatus("signed_out");
      return;
    }

    const { data: hasRole, error: roleError } = await supabase.rpc("has_role", {
      _role: "admin",
      _user_id: nextSession.user.id,
    });

    if (roleError) {
      console.error("Erro ao validar papel admin", roleError);
      setStatus("forbidden");
      return;
    }

    setStatus(hasRole ? "authenticated" : "forbidden");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (cancelled) return;
      await refresh();
    }

    bootstrap();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      if (!cancelled) refresh();
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [refresh]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erro ao fazer logout:", error);
    }
    setSession(null);
    setStatus("signed_out");
  }, []);

  const value = useMemo(
    () => ({ status, session, refresh, signOut }),
    [refresh, session, signOut, status],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth só pode ser usado dentro de AdminAuthProvider");
  }
  return ctx;
}

export function AdminGate({ children }: { children: ReactNode }) {
  const { status, signOut } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "signed_out") {
      navigate({ to: "/admin/login", replace: true });
    }
  }, [navigate, status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--ivory)]">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--gold-deep)]" />
      </div>
    );
  }

  if (status === "forbidden") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--ivory)] px-6">
        <div className="w-full max-w-sm rounded-3xl border border-[var(--gold)]/25 bg-white/80 p-8 text-center shadow-[var(--shadow-luxe)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--gold)]/15 text-[var(--gold-deep)]">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-display text-2xl text-[var(--cocoa)]">Acesso restrito</h1>
          <p className="mt-2 text-sm text-[var(--cocoa)]/70">
            Sua conta não possui o perfil administrativo necessário para entrar nesta área. Confirme
            com a equipe se o seu usuário está liberado como administrador.
          </p>
          <button
            type="button"
            onClick={signOut}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--gold-deep)] px-4 py-2.5 text-sm font-medium text-white"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
          <a
            href="/"
            className="mt-3 block text-xs text-[var(--cocoa)]/55 underline-offset-2 hover:underline"
          >
            Voltar para o site
          </a>
        </div>
      </div>
    );
  }

  if (status === "signed_out") {
    return null;
  }

  return <>{children}</>;
}
