import { useEffect, useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "couple_unlocked_v1";
// Senha do casal — altere aqui quando quiser trocar
const COUPLE_PASSCODE = "amanda&ricardo";

export function isCoupleUnlocked() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

export function lockCouple() {
  if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
}

export function CoupleGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [checked, setChecked] = useState(false);
  const [pass, setPass] = useState("");

  useEffect(() => {
    setUnlocked(isCoupleUnlocked());
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (!unlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--ivory)] px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (pass.trim().toLowerCase() === COUPLE_PASSCODE) {
              window.localStorage.setItem(STORAGE_KEY, "1");
              setUnlocked(true);
              toast.success("Bem-vindos, casal ❤");
            } else {
              toast.error("Senha incorreta");
            }
          }}
          className="w-full max-w-sm rounded-3xl border border-[var(--gold)]/25 bg-white/70 p-8 text-center shadow-[var(--shadow-luxe)] backdrop-blur"
        >
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[var(--gold)]/15 text-[var(--gold-deep)]">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-display text-2xl text-[var(--cocoa)]">Área do casal</h1>
          <p className="mt-2 text-sm text-[var(--cocoa)]/65">
            Digite a senha para editar o conteúdo.
          </p>
          <input
            type="password"
            autoFocus
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Senha"
            className="mt-5 w-full rounded-full border border-[var(--gold)]/30 bg-white px-4 py-2.5 text-center text-sm text-[var(--cocoa)] outline-none focus:border-[var(--gold-deep)]"
          />
          <button
            type="submit"
            className="mt-4 w-full rounded-full bg-[var(--gold-deep)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Entrar
          </button>
          <a
            href="/"
            className="mt-3 inline-block text-xs text-[var(--cocoa)]/55 underline-offset-2 hover:underline"
          >
            Voltar para o início
          </a>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
