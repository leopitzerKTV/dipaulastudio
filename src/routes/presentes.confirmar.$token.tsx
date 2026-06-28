import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Loader2, XCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Ornament } from "@/components/Ornament";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/presentes/confirmar/$token")({
  head: () => ({ meta: [{ title: "Confirmar compra — Lista de Presentes" }] }),
  component: ConfirmPage,
});

function ConfirmPage() {
  const { token } = Route.useParams();
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [title, setTitle] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("confirm_gift_purchase", { _token: token });
      if (error) {
        setState("error");
        setErrMsg(
          error.message === "token_invalid"
            ? "Link inválido ou expirado."
            : error.message === "reservation_cancelled"
              ? "Esta reserva foi cancelada."
              : error.message,
        );
        return;
      }
      const row = Array.isArray(data) ? data[0] : data;
      setTitle(row?.gift_title ?? null);
      setState("ok");
    })();
  }, [token]);

  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--gold)]/20 bg-[var(--ivory)]/85 px-4 py-3 backdrop-blur-xl">
        <Link to="/presentes" className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold-deep)]">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="font-serif-caps text-[11px] text-[var(--cocoa)]/70">Confirmar Compra</p>
        <span className="h-9 w-9" />
      </header>

      <section className="px-6 pt-8">
        <Ornament />
        <div className="mt-6 rounded-3xl border border-[var(--gold)]/25 bg-[var(--card)] p-6 text-center">
          {state === "loading" ? (
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-[var(--gold-deep)]" />
          ) : state === "ok" ? (
            <>
              <Check className="mx-auto h-8 w-8 text-emerald-600" />
              <h1 className="mt-3 font-display text-2xl text-[var(--cocoa)]">Compra confirmada!</h1>
              {title ? (
                <p className="mt-2 text-sm text-[var(--cocoa)]/70">
                  Obrigado por presentear: <strong>{title}</strong>.
                </p>
              ) : null}
              <p className="mt-3 text-xs text-[var(--cocoa)]/60">
                O item agora está indisponível para os outros convidados.
              </p>
              <Link
                to="/presentes"
                className="mt-5 inline-block rounded-full bg-[var(--gold-deep)] px-4 py-2 text-xs font-serif-caps text-white"
              >
                Voltar à lista
              </Link>
            </>
          ) : (
            <>
              <XCircle className="mx-auto h-8 w-8 text-red-500" />
              <h1 className="mt-3 font-display text-2xl text-[var(--cocoa)]">Não foi possível confirmar</h1>
              <p className="mt-2 text-sm text-[var(--cocoa)]/70">{errMsg}</p>
              <Link
                to="/presentes"
                className="mt-5 inline-block rounded-full bg-[var(--gold-deep)] px-4 py-2 text-xs font-serif-caps text-white"
              >
                Voltar à lista
              </Link>
            </>
          )}
        </div>
      </section>
    </AppShell>
  );
}
