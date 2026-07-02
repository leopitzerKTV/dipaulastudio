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
};

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
        <p>
          {ph(
            m?.welcome_note,
            "Estamos muito felizes em compartilhar este momento tão especial com vocês. Preparamos algumas informações importantes para que todos possam aproveitar o nosso grande dia da melhor forma possível.",
          )}
        </p>
      </Section>

      <Section icon={Shirt} title="Dress Code">
        <p className="font-display text-[var(--cocoa)]">
          Traje sugerido: <span className="text-[var(--gold-deep)]">Esporte Fino / Social Elegante</span>
        </p>
        <SubBlock title="Mulheres">
          <Bullet>Vestidos midi ou longos</Bullet>
          <Bullet>Tecidos leves e elegantes</Bullet>
          <Bullet>Saltos, sandálias ou sapatos confortáveis</Bullet>
        </SubBlock>
        <SubBlock title="Homens">
          <Bullet>Terno, blazer ou camisa social</Bullet>
          <Bullet>Sapatos sociais ou mocassins</Bullet>
        </SubBlock>
        <p className="mt-3 rounded-2xl bg-[var(--blush)]/40 px-4 py-3 text-xs text-[var(--cocoa)]/75">
          <strong>Evitar:</strong> branco, off-white ou tons muito próximos ao vestido da noiva.
        </p>
      </Section>

      <Section icon={Church} title="Cerimônia">
        <p>Pedimos a gentileza de chegarem com pelo menos <strong>30 minutos de antecedência</strong>.</p>
        <div className="mt-3 space-y-2 rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)] p-4">
          <InfoLine icon={Calendar} label="Data">{ph(m?.ceremony_date)}</InfoLine>
          <InfoLine icon={Calendar} label="Horário">{ph(m?.ceremony_time)}</InfoLine>
          <InfoLine icon={MapPin} label="Local">{ph(m?.ceremony_location)}</InfoLine>
        </div>
        <p className="mt-3 text-xs italic text-[var(--cocoa)]/70">
          Após o início da cerimônia, a entrada poderá ser restrita para preservar esse momento especial.
        </p>
      </Section>

      <Section icon={Camera} title="Durante a Cerimônia">
        <p>Convidamos todos a viverem esse momento conosco.</p>
        <ul className="mt-2 space-y-1.5">
          <Bullet>💖 Aproveitem cada instante</Bullet>
          <Bullet>📱 Evitem o uso excessivo do celular durante a entrada dos noivos</Bullet>
          <Bullet>📷 Nossa equipe de fotografia estará registrando tudo com muito carinho</Bullet>
        </ul>
      </Section>

      <Section icon={Utensils} title="Recepção e Buffet">
        <p>Após a cerimônia, os convidados serão recepcionados para a celebração.</p>
        <ul className="mt-2 space-y-1.5">
          <Bullet>🥂 Coquetel de boas-vindas</Bullet>
          <Bullet>🍴 Jantar ou buffet especial</Bullet>
          <Bullet>🍰 Mesa de doces e bolo</Bullet>
          <Bullet>🍹 Bebidas e drinks</Bullet>
        </ul>
      </Section>

      <Section icon={Cake} title="Momento do Bolo e Brinde">
        <p>Um dos momentos mais especiais da noite! Pedimos que todos se aproximem para celebrar conosco durante:</p>
        <ul className="mt-2 space-y-1.5">
          <Bullet>🥂 O brinde dos noivos</Bullet>
          <Bullet>🎂 O corte do bolo</Bullet>
          <Bullet>📸 As fotos especiais</Bullet>
        </ul>
      </Section>

      <Section icon={Music} title="Abertura da Pista">
        <p>Prepare seu melhor sorriso e sua energia! Após os momentos protocolares, a pista será aberta.</p>
        <ul className="mt-2 space-y-1.5">
          <Bullet>🎶 Música</Bullet>
          <Bullet>💃 Dança</Bullet>
          <Bullet>🎉 Diversão</Bullet>
        </ul>
      </Section>

      <Section icon={Camera} title="Compartilhe suas Fotos">
        <p>Envie suas fotos no nosso álbum colaborativo e ajude a construir as memórias deste dia.</p>
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
        <p>Sua presença já é o nosso maior presente. Caso desejem nos presentear:</p>
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
        <div className="space-y-2 rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)] p-4">
          <InfoLine icon={Car} label="Estacionamento">{ph(m?.parking_info)}</InfoLine>
          <InfoLine icon={MapPin} label="Localização">{ph(m?.location_info)}</InfoLine>
        </div>
      </Section>

      <Section icon={Sparkles} title="O Mais Importante">
        <p>Sua presença torna este momento ainda mais especial. Obrigado por fazer parte da nossa história e por celebrar o amor ao nosso lado.</p>
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

function SubBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <p className="font-serif-caps text-[10px] text-[var(--gold-deep)]">{title}</p>
      <ul className="mt-1.5 space-y-1.5">{children}</ul>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-[var(--gold-deep)]" />
      <span>{children}</span>
    </li>
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
