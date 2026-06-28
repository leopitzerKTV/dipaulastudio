import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Gift, ExternalLink, Check, Loader2, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Ornament } from "@/components/Ornament";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/presentes/")({
  head: () => ({
    meta: [
      { title: "Lista de Presentes — Amanda & Ricardo" },
      { name: "description", content: "Escolha um presente da nossa lista. Cada item fica reservado assim que a compra é confirmada." },
    ],
  }),
  component: PresentesIndex,
});

type CatalogItem = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price_cents: number | null;
  currency: string;
  store_url: string | null;
  sort_order: number;
  is_available: boolean;
  reserved_by_first_name: string | null;
};

function formatPrice(cents: number | null, currency: string) {
  if (cents == null) return "";
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(cents / 100);
  } catch {
    return `${currency} ${(cents / 100).toFixed(2)}`;
  }
}

function PresentesIndex() {
  const [items, setItems] = useState<CatalogItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CatalogItem | null>(null);

  const load = async () => {
    const { data, error } = await supabase.rpc("list_gift_catalog");
    if (error) {
      setError(error.message);
      return;
    }
    setItems((data ?? []) as CatalogItem[]);
  };

  useEffect(() => {
    load();
  }, []);

  const empty = items && items.length === 0;

  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--gold)]/20 bg-[var(--ivory)]/85 px-4 py-3 backdrop-blur-xl">
        <Link to="/" className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold-deep)]">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="font-serif-caps text-[11px] text-[var(--cocoa)]/70">Lista de Presentes</p>
        <span className="h-9 w-9" />
      </header>

      <section className="px-6 pt-6">
        <Ornament />
        <h1 className="mt-4 text-center font-display text-4xl text-[var(--cocoa)]">
          Nossa <span className="italic gold-text">Lista</span>
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-center text-sm text-[var(--cocoa)]/65">
          Escolha um presente, reserve com seu nome e confirme a compra para deixá-lo indisponível para os outros convidados.
        </p>
      </section>

      <section className="px-4 pt-6">
        {error ? (
          <p className="rounded-2xl bg-red-50 p-4 text-center text-sm text-red-700">{error}</p>
        ) : items == null ? (
          <div className="flex justify-center py-12 text-[var(--cocoa)]/60">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : empty ? (
          <p className="rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)] p-6 text-center text-sm text-[var(--cocoa)]/65">
            Ainda não há presentes cadastrados. Volte em breve.
          </p>
        ) : (
          <ul className="space-y-4">
            {items.map((it) => (
              <li
                key={it.id}
                className="overflow-hidden rounded-3xl border border-[var(--gold)]/25 bg-[var(--card)] shadow-sm"
              >
                <div className="flex gap-3 p-3">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[var(--gold)]/10">
                    {it.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.image_url} alt={it.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-[var(--gold-deep)]/40">
                        <Gift className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base leading-tight text-[var(--cocoa)]">{it.title}</p>
                    {it.description ? (
                      <p className="mt-1 line-clamp-2 text-xs text-[var(--cocoa)]/65">{it.description}</p>
                    ) : null}
                    {it.price_cents != null ? (
                      <p className="mt-1 font-serif-caps text-[11px] text-[var(--gold-deep)]">
                        {formatPrice(it.price_cents, it.currency)}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {it.store_url ? (
                        <a
                          href={it.store_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-[var(--gold)]/40 px-3 py-1 text-[11px] font-serif-caps text-[var(--cocoa)]/75"
                        >
                          Ver na loja <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                      {it.is_available ? (
                        <button
                          onClick={() => setSelected(it)}
                          className="inline-flex items-center gap-1 rounded-full bg-[var(--gold-deep)] px-3 py-1 text-[11px] font-serif-caps text-white"
                        >
                          Reservar
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--cocoa)]/10 px-3 py-1 text-[11px] font-serif-caps text-[var(--cocoa)]/60">
                          <Check className="h-3 w-3" /> Reservado
                          {it.reserved_by_first_name ? ` por ${it.reserved_by_first_name}` : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selected ? (
        <ReserveModal
          item={selected}
          onClose={() => setSelected(null)}
          onDone={() => {
            setSelected(null);
            load();
          }}
        />
      ) : null}
    </AppShell>
  );
}

function ReserveModal({
  item,
  onClose,
  onDone,
}: {
  item: CatalogItem;
  onClose: () => void;
  onDone: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [confirmUrl, setConfirmUrl] = useState<string | null>(null);

  const errMap = useMemo<Record<string, string>>(
    () => ({
      invalid_name: "Informe um nome válido.",
      invalid_email: "Informe um email válido.",
      item_unavailable: "Este presente acabou de ser reservado por outra pessoa.",
      item_not_found: "Presente não encontrado.",
    }),
    [],
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const { data, error } = await supabase.rpc("reserve_gift_item", {
      _gift_item_id: item.id,
      _guest_name: name,
      _guest_email: email,
    });
    setBusy(false);
    if (error) {
      setErr(errMap[error.message] ?? error.message);
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.confirm_token) {
      setErr("Não foi possível gerar a confirmação.");
      return;
    }
    const url = `${window.location.origin}/presentes/confirmar/${row.confirm_token}`;
    setConfirmUrl(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6 pt-12 sm:items-center">
      <div className="w-full max-w-md rounded-3xl bg-[var(--ivory)] p-5 shadow-2xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="font-serif-caps text-[10px] text-[var(--cocoa)]/55">Reservar presente</p>
            <p className="font-display text-lg text-[var(--cocoa)]">{item.title}</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-[var(--cocoa)]/10">
            <X className="h-4 w-4" />
          </button>
        </div>

        {confirmUrl ? (
          <div className="space-y-3">
            <p className="text-sm text-[var(--cocoa)]/75">
              Reserva criada! Você tem <strong>7 dias</strong> para concluir a compra. Quando comprar, abra o link abaixo
              para confirmar — só então o item ficará indisponível para os outros convidados.
            </p>
            <div className="rounded-2xl border border-[var(--gold)]/30 bg-white p-3 text-xs break-all text-[var(--cocoa)]/80">
              {confirmUrl}
            </div>
            <div className="flex gap-2">
              <a
                href={confirmUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 rounded-full bg-[var(--gold-deep)] px-4 py-2 text-center text-xs font-serif-caps text-white"
              >
                Já comprei — confirmar
              </a>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(confirmUrl);
                }}
                className="rounded-full border border-[var(--gold)]/40 px-4 py-2 text-xs font-serif-caps text-[var(--cocoa)]/75"
              >
                Copiar link
              </button>
            </div>
            <button onClick={onDone} className="w-full pt-2 text-center text-xs font-serif-caps text-[var(--cocoa)]/60">
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <label className="block">
              <span className="mb-1 block font-serif-caps text-[10px] text-[var(--cocoa)]/60">Seu nome</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={120}
                className="w-full rounded-xl border border-[var(--gold)]/30 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-serif-caps text-[10px] text-[var(--cocoa)]/60">Seu email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
                className="w-full rounded-xl border border-[var(--gold)]/30 bg-white px-3 py-2 text-sm"
              />
            </label>
            <p className="text-[11px] leading-snug text-[var(--cocoa)]/60">
              O item ficará reservado em seu nome por 7 dias. Ele só ficará indisponível para os outros convidados depois
              que você confirmar a compra pelo link enviado em seguida.
            </p>
            {err ? <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{err}</p> : null}
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--gold-deep)] px-4 py-2 text-xs font-serif-caps text-white disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              Reservar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
