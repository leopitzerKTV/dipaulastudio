import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar — Área do Casal" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/linha-do-tempo/editar" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/linha-do-tempo/editar` },
        });
        if (error) throw error;
        toast.success("Conta criada! Faça login.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.success("Bem-vindos ❤");
        navigate({ to: "/linha-do-tempo/editar" });
      }
    } catch (err) {
      toast.error((err as Error).message || "Não foi possível continuar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ivory)] px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl border border-[var(--gold)]/25 bg-white/70 p-8 text-center shadow-[var(--shadow-luxe)] backdrop-blur"
      >
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[var(--gold)]/15 text-[var(--gold-deep)]">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="mt-4 font-display text-2xl text-[var(--cocoa)]">Área do casal</h1>
        <p className="mt-2 text-sm text-[var(--cocoa)]/65">
          {mode === "signin" ? "Entre para editar o convite." : "Cadastre o e-mail do casal."}
        </p>

        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          className="mt-5 w-full rounded-full border border-[var(--gold)]/30 bg-white px-4 py-2.5 text-center text-sm text-[var(--cocoa)] outline-none focus:border-[var(--gold-deep)]"
        />
        <input
          type="password"
          required
          minLength={8}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha (mín. 8)"
          className="mt-3 w-full rounded-full border border-[var(--gold)]/30 bg-white px-4 py-2.5 text-center text-sm text-[var(--cocoa)] outline-none focus:border-[var(--gold-deep)]"
        />
        <button
          type="submit"
          disabled={busy}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--gold-deep)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "signin" ? "Entrar" : "Criar conta"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 block w-full text-xs text-[var(--cocoa)]/60 underline-offset-2 hover:underline"
        >
          {mode === "signin" ? "Primeira vez? Criar conta do casal" : "Já tenho conta — entrar"}
        </button>
        <a href="/" className="mt-2 inline-block text-xs text-[var(--cocoa)]/55 underline-offset-2 hover:underline">
          Voltar para o início
        </a>
      </form>
    </div>
  );
}
