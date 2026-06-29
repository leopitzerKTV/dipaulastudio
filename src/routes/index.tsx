import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { Mail, Calendar, MapPin, Gift, Heart, Wand2, BookOpen, Copy, Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Ornament } from "@/components/Ornament";
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
  const [copied, setCopied] = React.useState(false);
  const manualUrl = "https://dipaulastudio.lovable.app/manual";
  const defaultMessage = `Oi! Aqui está o Manual do Convidado do casamento da Amanda e Ricardo. Dá uma olhada em tudo que preparamos com carinho: ${manualUrl}`;
  const [message, setMessage] = React.useState(defaultMessage);


  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(manualUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
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

      <section className="mt-8 px-6">
        <div className="rounded-2xl border border-[var(--gold)]/25 bg-[var(--card)] p-6 text-center shadow-[var(--shadow-card)]">
          <p className="font-serif-caps text-[10px] text-[var(--gold-deep)]">Acesso Rápido</p>
          <h3 className="mt-2 font-display text-2xl text-[var(--cocoa)]">Manual do Convidado</h3>
          <p className="mt-1 text-xs text-[var(--cocoa)]/60">Aponte a câmera do celular para abrir</p>
          <div className="mt-5 inline-flex rounded-2xl bg-white p-3 shadow-[var(--shadow-card)]">
            <QRCodeSVG value={manualUrl} size={160} level="M" includeMargin={false} />
          </div>
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="flex w-full flex-wrap items-center justify-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-4 py-2 font-serif-caps text-[10px] text-[var(--gold-deep)] transition-colors hover:bg-[var(--gold)]/20"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Link copiado!" : "Copiar link"}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Oi! Aqui está o Manual do Convidado do casamento da Amanda e Ricardo. Dá uma olhada em tudo que preparamos com carinho: ${manualUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 font-serif-caps text-[10px] text-white transition-colors hover:bg-[#1ebd59]"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.521.074-.797.372-.275.297-1.05 1.027-1.05 2.503 0 1.476 1.077 2.904 1.227 3.105.149.198 2.123 3.238 5.146 4.54.719.31 1.28.497 1.718.635.722.23 1.379.197 1.898.12.579-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004c-1.06 0-2.107-.28-3.028-.81l-.217-.127-2.252.59.601-2.194-.142-.224c-.598-1.048-.903-2.255-.903-3.504C6.324 8.768 10.588 4.5 15.75 4.5c2.506 0 4.86.977 6.633 2.75 1.772 1.772 2.75 4.127 2.75 6.633 0 5.162-4.268 9.426-9.49 9.426M22.5 12.112C22.5 6.201 17.799 1.5 11.888 1.5 6.026 1.5 1.388 6.138 1.388 12c0 1.423.273 2.792.812 4.076l-.852 3.11 3.184-.836c1.198.654 2.55.998 3.93.998 5.913 0 10.612-4.699 10.612-10.612 0-2.834-1.103-5.497-3.105-7.499S14.696 1.612 11.888 1.612" />
                </svg>
                Compartilhar no WhatsApp
              </a>
            </div>
            <Link
              to="/manual"
              className="inline-block font-serif-caps text-[10px] text-[var(--gold-deep)] hover:underline"
            >
              ou abrir manualmente
            </Link>
          </div>

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
