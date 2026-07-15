import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck, Eye, EyeOff, Mail } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { AdminAuthProvider, useAdminAuth } from "@/components/admin/admin-auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Área Administrativa" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <AdminAuthProvider>
      <AdminLoginPage />
    </AdminAuthProvider>
  ),
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const { status, refresh } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      navigate({ to: "/admin" });
    }
  }, [navigate, status]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Digite o e-mail corporativo para entrar.");
      toast.error("Informe o e-mail");
      return;
    }
    if (!password) {
      setErrorMessage("Digite a senha definida para sua equipe.");
      toast.error("Informe a senha");
      return;
    }

    setBusy(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (error) throw error;

      const userId = data.user?.id;
      if (!userId) {
        throw new Error("Sessão inválida. Tente novamente.");
      }

      const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
        _role: "admin",
        _user_id: userId,
      });

      if (roleError || !isAdmin) {
        await supabase.auth.signOut();
        throw new Error(
          "Seu usuário não possui acesso administrativo. Solicite liberação à equipe responsável.",
        );
      }

      toast.success("Bem-vindo à área administrativa");
      await refresh();
      navigate({ to: "/admin" });
    } catch (err) {
      const friendly = friendlyAuthError((err as Error).message);
      setErrorMessage(friendly);
      toast.error(friendly);
    } finally {
      setBusy(false);
    }
  }

  async function handleResetPassword() {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      toast.error("Informe seu e-mail para receber o link de redefinição.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/admin/login`,
    });
    if (error) {
      toast.error("Não foi possível enviar o e-mail agora.");
    } else {
      toast.success("Enviamos um link de redefinição para seu e-mail.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ivory)] px-4 py-10">
      <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-[var(--gold)]/30 bg-white/85 p-8 shadow-[var(--shadow-luxe)] backdrop-blur">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--gold)]/15 text-[var(--gold-deep)]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h1 className="mt-4 text-center font-display text-3xl text-[var(--cocoa)]">
          Área Administrativa
        </h1>
        <p className="mt-2 text-center text-sm text-[var(--cocoa)]/70">
          Entre com as credenciais da equipe responsável pelos convites.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-[var(--cocoa)]/80">
            E-mail corporativo
            <div className="mt-1 flex items-center gap-2 rounded-full border border-[var(--gold)]/35 bg-white px-4">
              <Mail className="h-4 w-4 text-[var(--gold-deep)]" />
              <input
                type="email"
                name="email"
                autoComplete="email"
                className="h-11 flex-1 bg-transparent text-sm text-[var(--cocoa)] outline-none"
                placeholder="nome@empresa.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage("");
                }}
              />
            </div>
          </label>

          <label className="block text-sm font-medium text-[var(--cocoa)]/80">
            Senha
            <div className="mt-1 flex items-center gap-2 rounded-full border border-[var(--gold)]/35 bg-white px-4">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                className="h-11 flex-1 bg-transparent text-sm text-[var(--cocoa)] outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage("");
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-[var(--cocoa)]/65"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {errorMessage ? (
            <p className="rounded-2xl border border-[var(--gold)]/30 bg-[var(--champagne)]/30 px-4 py-2 text-xs text-[var(--cocoa)]/80">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--gold-deep)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Entrar
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-2 text-center text-xs text-[var(--cocoa)]/65">
          <button
            type="button"
            onClick={handleResetPassword}
            className="underline-offset-2 hover:underline"
          >
            Esqueci minha senha
          </button>
          <a href="/" className="underline-offset-2 hover:underline">
            Voltar para o site
          </a>
        </div>
      </div>
    </div>
  );
}

function friendlyAuthError(message = "") {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Confirme o e-mail antes de prosseguir.";
  }
  if (normalized.includes("not allowed")) {
    return "Sua conta não pode acessar esta área.";
  }
  return message || "Não foi possível entrar agora.";
}
