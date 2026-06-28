import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Mail, Calendar, MapPin, Gift, Heart, Wand2, BookOpen, Download, QrCode as QrCodeIcon, Edit3, Check, Loader2, Smartphone } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Ornament } from "@/components/Ornament";
import { QrCode } from "@/components/QrCode";
import { ManualView, type ManualData } from "@/components/ManualView";
import { supabase } from "@/integrations/supabase/client";
import ceremonyImg from "@/assets/ceremony.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Amanda & Ricardo — Nosso Convite" },
      { name: "description", content: "Convite digital personalizado: confirme sua presença, veja a linha do tempo do casal e mais." },
      { property: "og:title", content: "Amanda & Ricardo — Nosso Convite" },
      { property: "og:description", content: "Convite digital personalizado, álbum colaborativo e linha do tempo do casal." },
    ],
  }),
  component: Index,
});

function Index() {
  const [manualUrl, setManualUrl] = useState("");
  const [manual, setManual] = useState<ManualData | null>(null);
  const [rowId, setRowId] = useState<string | null>(null);
  const [isCouple, setIsCouple] = useState(false);
  const [viewMode, setViewMode] = useState<"normal" | "edit" | "guest">("normal");
  const editMode = viewMode === "edit";
  const guestMode = viewMode === "guest";
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [deviceWidth, setDeviceWidth] = useState<320 | 375 | 414>(375);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");

  useEffect(() => {
    setManualUrl(`${window.location.origin}/manual`);
    let cancelled = false;

    async function load() {
      const { data } = await supabase
        .from("guest_manual")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setManual(data as ManualData);
        setRowId(data.id as string);
      }
    }

    async function checkCouple() {
      const { data: sess } = await supabase.auth.getSession();
      if (cancelled || !sess.session) return setIsCouple(false);
      const { data } = await supabase.rpc("has_role", {
        _user_id: sess.session.user.id,
        _role: "couple",
      });
      if (!cancelled) setIsCouple(!!data);
    }

    load();
    checkCouple();

    const { data: sub } = supabase.auth.onAuthStateChange((e) => {
      if (e === "SIGNED_IN" || e === "SIGNED_OUT" || e === "USER_UPDATED") checkCouple();
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const persist = useCallback(
    async (next: ManualData) => {
      setSaveState("saving");
      const trim = (v: string | null | undefined) => (v && v.trim() ? v.trim() : null);
      const payload = {
        ceremony_date: trim(next.ceremony_date),
        ceremony_time: trim(next.ceremony_time),
        ceremony_location: trim(next.ceremony_location),
        parking_info: trim(next.parking_info),
        location_info: trim(next.location_info),
        gift_list_url: trim(next.gift_list_url),
        welcome_note: trim(next.welcome_note),
        dress_code_note: trim(next.dress_code_note),
        ceremony_note: trim(next.ceremony_note),
        during_ceremony_note: trim(next.during_ceremony_note),
        reception_note: trim(next.reception_note),
        cake_note: trim(next.cake_note),
        dancefloor_note: trim(next.dancefloor_note),
        album_note: trim(next.album_note),
        gift_note: trim(next.gift_note),
        transport_note: trim(next.transport_note),
        closing_note: trim(next.closing_note),
      };
      const res = rowId
        ? await supabase.from("guest_manual").update(payload).eq("id", rowId)
        : await supabase.from("guest_manual").insert(payload).select("id").maybeSingle();
      if (res.error) {
        setSaveState("idle");
        toast.error("Não foi possível salvar");
        return;
      }
      if (!rowId && "data" in res && res.data?.id) setRowId(res.data.id as string);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1500);
    },
    [rowId],
  );

  const handleFieldChange = (field: keyof ManualData, value: string) => {
    setManual((prev) => {
      const base = prev ?? ({} as ManualData);
      const next = { ...base, [field]: value } as ManualData;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => persist(next), 700);
      return next;
    });
  };

  return (
    <AppShell>
      {/* Cover */}
      <section className="relative px-6 pt-10">
        <div className="text-center">
          <p className="font-serif-caps text-[10px] text-[var(--gold-deep)]">Convite Digital</p>
          <Ornament className="mt-4" />
          <p className="mt-5 font-display text-sm italic text-[var(--cocoa)]/70">você está convidado para o nosso casamento</p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mt-3 font-display text-[64px] leading-[0.95] tracking-tight text-[var(--cocoa)]"
          >
            Amanda
            <span className="block font-display italic text-[42px] text-[var(--gold-deep)] my-1">e</span>
            Ricardo
          </motion.h1>
          <Ornament className="mt-5" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="relative mx-auto mt-6 aspect-[9/16] w-full max-w-[20rem] overflow-hidden rounded-[2rem] shadow-[var(--shadow-luxe)]"
        >
          <img src={ceremonyImg} alt="Cerimônia" className="h-full w-full object-cover" width={896} height={1600} />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--cocoa)]/70 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-[var(--ivory)]">
            <p className="font-serif-caps text-[10px] opacity-90">24 · Maio · 2025</p>
            <p className="font-display text-lg mt-1">Sábado, às 16h30</p>
          </div>
        </motion.div>

        <div className="mt-6 space-y-2.5">
          <InfoRow Icon={Calendar} title="Cerimônia" sub="Sábado, 24 de Maio · 16h30" />
          <InfoRow Icon={MapPin} title="Espaço Jardim Secreto" sub="São Paulo · SP" />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          className="mt-7 w-full rounded-full bg-[var(--gradient-gold,linear-gradient(135deg,#9c7a3a,#c9a55b))] py-4 font-serif-caps text-xs text-[var(--ivory)] shadow-[var(--shadow-card)]"
          style={{ background: "var(--gradient-gold)" }}
        >
          Confirmar Presença
        </motion.button>

        <p className="mt-3 text-center font-display italic text-sm text-[var(--cocoa)]/70">
          "Transforme cada momento em uma lembrança eterna."
        </p>
      </section>

      {/* Quick actions */}
      <section className="mt-10 px-6">
        <Ornament />
        <h2 className="mt-5 text-center font-display text-3xl text-[var(--cocoa)]">Tudo do nosso casamento</h2>
        <p className="mt-2 text-center text-sm text-[var(--cocoa)]/65">Em um só lugar, organizado para vocês reviverem quando quiserem.</p>

        <div className="mt-6 grid gap-3">
          <ActionCard to="/historia" Icon={Heart} title="Nossa História" sub="O começo, o pedido, o agora" />
          <ActionCard to="/linha-do-tempo" Icon={Calendar} title="Linha do Tempo" sub="Pedido, casamento, festa, lua de mel" />
          <ActionCard to="/album" Icon={Mail} title="Álbum Colaborativo" sub="Fotos dos convidados em tempo real" />
          <ActionCard to="/manual" Icon={BookOpen} title="Manual do Convidado" sub="Dress code, cerimônia, recepção e mais" />
          <ActionCard to="/editor" Icon={Wand2} title="Editor do Convite" sub="Personalize nomes, data, cores e imagem" />
          <ActionCard to="/painel" Icon={Gift} title="Painel Privado do Casal" sub="RSVP, presentes, mensagens" />
        </div>
      </section>

      {/* Manual do Convidado — embedded item by item */}
      <section className="mt-12">
        <div className="px-6 text-center">
          <Ornament />
          <p className="mt-5 font-serif-caps text-[10px] text-[var(--gold-deep)]">No convite</p>
          <h2 className="mt-2 font-display text-3xl text-[var(--cocoa)]">Manual completo</h2>
          <p className="mt-1 text-sm text-[var(--cocoa)]/65">
            {editMode
              ? "Toque em qualquer item para editar. Salva automaticamente."
              : guestMode
                ? "Pré-visualização exatamente como o convidado verá no celular."
                : "Cada item personalizado pela noiva — role para conhecer."}
          </p>
          {isCouple ? (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <div className="inline-flex rounded-full border border-[var(--gold)]/40 bg-white/60 p-0.5">
                <ModeBtn active={viewMode === "edit"} onClick={() => setViewMode(viewMode === "edit" ? "normal" : "edit")}>
                  <Edit3 className="h-3 w-3" /> Editar
                </ModeBtn>
                <ModeBtn active={viewMode === "guest"} onClick={() => setViewMode(viewMode === "guest" ? "normal" : "guest")}>
                  <Smartphone className="h-3 w-3" /> Como convidado
                </ModeBtn>
              </div>
              {editMode && saveState !== "idle" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-serif-caps text-[var(--cocoa)]/55">
                  {saveState === "saving" ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" /> Salvando…
                    </>
                  ) : (
                    <>
                      <Check className="h-3 w-3 text-[var(--gold-deep)]" /> Salvo
                    </>
                  )}
                </span>
              )}
            </div>
          ) : (
            <Link
              to="/manual/editar"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[var(--gold)]/40 bg-white/60 px-3 py-1.5 text-[10px] font-serif-caps text-[var(--gold-deep)] hover:bg-white"
            >
              <Edit3 className="h-3 w-3" /> Editar manual
            </Link>
          )}
        </div>
        {guestMode ? (
          <div className="mt-4 flex flex-col items-center gap-3 px-4 pb-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="inline-flex rounded-full border border-[var(--gold)]/40 bg-white/60 p-0.5">
                {[320, 375, 414].map((w) => (
                  <ModeBtn key={w} active={deviceWidth === w} onClick={() => setDeviceWidth(w as 320 | 375 | 414)}>
                    {w}px
                  </ModeBtn>
                ))}
              </div>
              <div className="inline-flex rounded-full border border-[var(--gold)]/40 bg-white/60 p-0.5">
                <ModeBtn active={orientation === "portrait"} onClick={() => setOrientation("portrait")}>
                  Retrato
                </ModeBtn>
                <ModeBtn active={orientation === "landscape"} onClick={() => setOrientation("landscape")}>
                  Paisagem
                </ModeBtn>
              </div>
            </div>
            {(() => {
              const isPortrait = orientation === "portrait";
              const frameW = isPortrait ? deviceWidth : Math.round(deviceWidth * (16 / 9));
              const frameH = isPortrait ? Math.round(deviceWidth * (16 / 9)) : deviceWidth;
              return (
                <div
                  className="relative rounded-[2.5rem] border-[10px] border-[var(--cocoa)] bg-[var(--cocoa)] shadow-[var(--shadow-luxe)]"
                  style={{ width: frameW, maxWidth: "100%" }}
                >
                  <div className="absolute left-1/2 top-2 z-10 h-1.5 w-20 -translate-x-1/2 rounded-full bg-[var(--cocoa)]/60" />
                  <div className="overflow-y-auto rounded-[2rem] bg-[var(--ivory)]" style={{ height: Math.min(frameH, 720) }}>
                    <ManualView data={manual} linkAlbum={false} />
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="-mx-0 mt-2 border-y border-[var(--gold)]/20 bg-[var(--ivory)]">
            <ManualView data={manual} editable={editMode && isCouple} onFieldChange={handleFieldChange} />
          </div>
        )}
      </section>

      {/* QR Code para o Manual */}
      <section className="mt-10 px-6">
        <Ornament />
        <div className="mt-5 rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)] p-5 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--gold)]/12 text-[var(--gold-deep)]">
            <QrCodeIcon className="h-5 w-5" strokeWidth={1.4} />
          </div>
          <h2 className="mt-4 font-display text-2xl text-[var(--cocoa)]">Manual do Convidado</h2>
          <p className="mt-1 text-sm text-[var(--cocoa)]/65">
            Aponte a câmera do celular para acessar o manual completo.
          </p>
          <div className="mt-4 flex justify-center">
            <QrCode value={manualUrl || "https://dipaulastudio.lovable.app/manual"} size={180} />
          </div>
          <button
            onClick={() => {
              const img = document.querySelector<HTMLImageElement>("img[alt='QR code para o Manual do Convidado']");
              if (!img?.src) return;
              const a = document.createElement("a");
              a.href = img.src;
              a.download = "qr-code-manual.png";
              a.click();
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--gold-deep)] px-4 py-2 text-[10px] font-serif-caps text-white"
          >
            <Download className="h-3 w-3" /> Baixar QR code
          </button>
        </div>
      </section>

      <p className="mt-10 text-center font-serif-caps text-[10px] text-[var(--gold-deep)]/70">Nossa História · App de Casamento</p>
    </AppShell>
  );
}

function InfoRow({ Icon, title, sub }: { Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)] px-4 py-3">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold-deep)]">
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-display text-base text-[var(--cocoa)]">{title}</p>
        <p className="text-xs text-[var(--cocoa)]/60">{sub}</p>
      </div>
    </div>
  );
}

function ActionCard({ to, Icon, title, sub }: { to: string; Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; title: string; sub: string }) {
  return (
    <Link to={to} className="group flex items-center gap-4 rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)] p-4 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-[var(--gold)]/60">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--gold)]/12 text-[var(--gold-deep)]">
        <Icon className="h-5 w-5" strokeWidth={1.4} />
      </div>
      <div className="flex-1">
        <p className="font-display text-lg text-[var(--cocoa)]">{title}</p>
        <p className="text-xs text-[var(--cocoa)]/60">{sub}</p>
      </div>
      <span className="font-serif-caps text-[10px] text-[var(--gold-deep)] opacity-0 transition-opacity group-hover:opacity-100">abrir</span>
    </Link>
  );
}

function ModeBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-serif-caps transition-colors " +
        (active ? "bg-[var(--gold-deep)] text-white" : "text-[var(--gold-deep)] hover:bg-white")
      }
    >
      {children}
    </button>
  );
}
