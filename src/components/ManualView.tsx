import { Link } from "@tanstack/react-router";
import { Calendar, MapPin, Car, Gift, Heart, Sparkles, Camera, Music, Cake, Utensils, Shirt, Church } from "lucide-react";
import { Ornament } from "@/components/Ornament";

export type ManualData = {
  ceremony_date: string | null;
  ceremony_time: string | null;
  ceremony_location: string | null;
  parking_info: string | null;
  location_info: string | null;
  gift_list_url: string | null;
  welcome_note: string | null;
  dress_code_note?: string | null;
  ceremony_note?: string | null;
  during_ceremony_note?: string | null;
  reception_note?: string | null;
  cake_note?: string | null;
  dancefloor_note?: string | null;
  album_note?: string | null;
  gift_note?: string | null;
  transport_note?: string | null;
  closing_note?: string | null;
};

export const MANUAL_DEFAULTS = {
  welcome_note:
    "Estamos muito felizes em compartilhar este momento tão especial com vocês. Preparamos algumas informações importantes para que todos possam aproveitar o nosso grande dia da melhor forma possível.",
  dress_code_note:
    "Traje sugerido: Esporte Fino / Social Elegante.\nMulheres: vestidos midi ou longos, tecidos leves e elegantes, saltos ou sapatos confortáveis.\nHomens: terno, blazer ou camisa social, sapatos sociais ou mocassins.\nEvitar: branco, off-white ou tons muito próximos ao vestido da noiva.",
  ceremony_note:
    "Pedimos a gentileza de chegarem com pelo menos 30 minutos de antecedência. Após o início da cerimônia, a entrada poderá ser restrita para preservar esse momento especial.",
  during_ceremony_note:
    "Convidamos todos a viverem esse momento conosco. Aproveitem cada instante, evitem o uso excessivo do celular durante a entrada dos noivos — nossa equipe de fotografia estará registrando tudo com muito carinho.",
  reception_note:
    "Após a cerimônia, os convidados serão recepcionados com coquetel de boas-vindas, jantar especial, mesa de doces, bolo e drinks.",
  cake_note:
    "Um dos momentos mais especiais da noite! Pedimos que todos se aproximem para celebrar conosco o brinde dos noivos, o corte do bolo e as fotos especiais.",
  dancefloor_note:
    "Prepare seu melhor sorriso e sua energia! Após os momentos protocolares, a pista será aberta com muita música, dança e diversão.",
  album_note:
    "Envie suas fotos no nosso álbum colaborativo e ajude a construir as memórias deste dia.",
  gift_note:
    "Sua presença já é o nosso maior presente. Caso desejem nos presentear, deixamos o link da lista abaixo.",
  transport_note: "",
  closing_note:
    "Sua presença torna este momento ainda mais especial. Obrigado por fazer parte da nossa história e por celebrar o amor ao nosso lado.",
} as const;

export function ManualView({
  data,
  linkAlbum = true,
  innerRef,
}: {
  data: ManualData | null;
  linkAlbum?: boolean;
  innerRef?: React.Ref<HTMLDivElement>;
}) {
  const m = data;
  const ph = (v: string | null | undefined, fallback = "A confirmar") =>
    v && v.trim() ? v : <span className="italic text-[var(--cocoa)]/45">{fallback}</span>;

  const txt = (v: string | null | undefined, fallback: string) => {
    const value = v && v.trim() ? v : fallback;
    return value.split("\n").map((line, i) => (
      <p key={i} className={i > 0 ? "mt-2" : ""}>
        {line}
      </p>
    ));
  };

  return (
    <div ref={innerRef} className="bg-[var(--ivory)]">
      <section className="px-6 pt-8 text-center">
        <p className="font-serif-caps text-[10px] text-[var(--gold-deep)]">Manual do Convidado</p>
        <Ornament className="mt-4" />
        <h1 className="mt-4 font-display text-[40px] leading-none text-[var(--cocoa)]">
          Amanda <span className="italic text-[var(--gold-deep)]">&</span> Ricardo
        </h1>
        <p className="mt-2 font-display italic text-sm text-[var(--cocoa)]/65">
          Tudo o que você precisa saber para celebrar conosco ✨
        </p>
        <Ornament className="mt-4" />
      </section>

      <Section icon={Heart} title="Boas-vindas">
        {txt(m?.welcome_note, MANUAL_DEFAULTS.welcome_note)}
      </Section>

      <Section icon={Shirt} title="Dress Code">
        {txt(m?.dress_code_note, MANUAL_DEFAULTS.dress_code_note)}
      </Section>

      <Section icon={Church} title="Cerimônia">
        {txt(m?.ceremony_note, MANUAL_DEFAULTS.ceremony_note)}
        <div className="mt-3 space-y-2 rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)] p-4">
          <InfoLine icon={Calendar} label="Data">{ph(m?.ceremony_date)}</InfoLine>
          <InfoLine icon={Calendar} label="Horário">{ph(m?.ceremony_time)}</InfoLine>
          <InfoLine icon={MapPin} label="Local">{ph(m?.ceremony_location)}</InfoLine>
        </div>
      </Section>

      <Section icon={Camera} title="Durante a Cerimônia">
        {txt(m?.during_ceremony_note, MANUAL_DEFAULTS.during_ceremony_note)}
      </Section>

      <Section icon={Utensils} title="Recepção e Buffet">
        {txt(m?.reception_note, MANUAL_DEFAULTS.reception_note)}
      </Section>

      <Section icon={Cake} title="Momento do Bolo e Brinde">
        {txt(m?.cake_note, MANUAL_DEFAULTS.cake_note)}
      </Section>

      <Section icon={Music} title="Abertura da Pista">
        {txt(m?.dancefloor_note, MANUAL_DEFAULTS.dancefloor_note)}
      </Section>

      <Section icon={Camera} title="Compartilhe suas Fotos">
        {txt(m?.album_note, MANUAL_DEFAULTS.album_note)}
        {linkAlbum ? (
          <Link to="/album" className="mt-3 inline-block rounded-full bg-[var(--gold-deep)] px-4 py-2 text-xs font-serif-caps text-white">
            Abrir álbum
          </Link>
        ) : (
          <span className="mt-3 inline-block rounded-full bg-[var(--gold-deep)]/80 px-4 py-2 text-xs font-serif-caps text-white">
            Abrir álbum
          </span>
        )}
      </Section>

      <Section icon={Gift} title="Lista de Presentes">
        {txt(m?.gift_note, MANUAL_DEFAULTS.gift_note)}
        {m?.gift_list_url && m.gift_list_url.trim() ? (
          <a
            href={m.gift_list_url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block rounded-full bg-[var(--gold-deep)] px-4 py-2 text-xs font-serif-caps text-white"
          >
            Ver lista de presentes
          </a>
        ) : (
          <p className="mt-2 text-xs italic text-[var(--cocoa)]/55">Link a ser disponibilizado em breve.</p>
        )}
      </Section>

      <Section icon={Car} title="Transporte e Estacionamento">
        {m?.transport_note && m.transport_note.trim() ? (
          <div className="mb-3">{txt(m.transport_note, "")}</div>
        ) : null}
        <div className="space-y-2 rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)] p-4">
          <InfoLine icon={Car} label="Estacionamento">{ph(m?.parking_info)}</InfoLine>
          <InfoLine icon={MapPin} label="Localização">{ph(m?.location_info)}</InfoLine>
        </div>
      </Section>

      <Section icon={Sparkles} title="O Mais Importante">
        {txt(m?.closing_note, MANUAL_DEFAULTS.closing_note)}
        <p className="mt-3 text-right font-display italic text-[var(--gold-deep)]">— Os Noivos ✨</p>
      </Section>

      <Ornament className="mt-10" />
      <div className="h-6" />
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 px-6">
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)]/15 text-[var(--gold-deep)]">
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        </span>
        <h2 className="font-display text-2xl text-[var(--cocoa)]">{title}</h2>
      </div>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--cocoa)]/80">{children}</div>
    </section>
  );
}

function InfoLine({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <Icon className="h-4 w-4 text-[var(--gold-deep)]" strokeWidth={1.5} />
      <span className="font-serif-caps text-[10px] text-[var(--cocoa)]/55">{label}</span>
      <span className="ml-auto text-right text-[var(--cocoa)]">{children}</span>
    </div>
  );
}
