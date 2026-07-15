import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { Mail, Calendar, MapPin, Gift, Heart, Wand2, BookOpen, Copy, Check } from "lucide-react";
import { Ornament } from "@/components/Ornament";
import ceremonyImg from "@/assets/ceremony.jpg";

export const Route = createFileRoute("/")({
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
    <div style={{ backgroundColor: "var(--ivory)", color: "var(--cocoa)", minHeight: "100vh" }}>
      {/* Cover */}
      <section style={{ position: "relative", padding: "24px", paddingTop: "40px" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "serif", fontSize: "10px", color: "var(--gold-deep)", letterSpacing: "2px" }}>Convite Digital</p>
          <Ornament style={{ marginTop: "16px" }} />
          <p style={{ marginTop: "20px", fontStyle: "italic", color: "var(--cocoa)", opacity: 0.7, fontSize: "14px" }}>
            você está convidado para o nosso casamento
          </p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              marginTop: "12px",
              fontFamily: "serif",
              fontSize: "64px",
              lineHeight: "0.95",
              letterSpacing: "-1px",
              color: "var(--cocoa)",
              margin: "12px 0"
            }}
          >
            Amanda
            <span style={{ display: "block", fontStyle: "italic", fontSize: "42px", color: "var(--gold-deep)", margin: "4px 0" }}>
              e
            </span>
            Ricardo
          </motion.h1>
          <Ornament style={{ marginTop: "20px" }} />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          style={{
            position: "relative",
            margin: "0 auto",
            marginTop: "24px",
            aspectRatio: "9/16",
            width: "100%",
            maxWidth: "20rem",
            overflow: "hidden",
            borderRadius: "32px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
          }}
        >
          <img
            src={ceremonyImg}
            alt="Cerimônia"
            style={{ height: "100%", width: "100%", objectFit: "cover" }}
            width={896}
            height={1600}
          />
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)"
          }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px", color: "var(--ivory)" }}>
            <p style={{ fontFamily: "serif", fontSize: "10px", letterSpacing: "2px", opacity: 0.9 }}>24 · Maio · 2025</p>
            <p style={{ fontFamily: "serif", fontSize: "18px", marginTop: "4px" }}>Sábado, às 16h30</p>
          </div>
        </motion.div>

        <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <InfoRow Icon={Calendar} title="Cerimônia" sub="Sábado, 24 de Maio · 16h30" />
          <InfoRow Icon={MapPin} title="Espaço Jardim Secreto" sub="São Paulo · SP" />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          style={{
            marginTop: "28px",
            width: "100%",
            borderRadius: "9999px",
            padding: "16px",
            fontFamily: "serif",
            fontSize: "12px",
            color: "var(--ivory)",
            background: "linear-gradient(135deg, #9c7a3a, #c9a55b)",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
          }}
        >
          Confirmar Presença
        </motion.button>

        <p style={{ marginTop: "12px", textAlign: "center", fontStyle: "italic", fontSize: "14px", color: "var(--cocoa)", opacity: 0.7 }}>
          "Transforme cada momento em uma lembrança eterna."
        </p>
      </section>

      {/* Quick actions */}
      <section style={{ marginTop: "40px", padding: "0 24px" }}>
        <Ornament />
        <h2 style={{ marginTop: "20px", textAlign: "center", fontFamily: "serif", fontSize: "30px", color: "var(--cocoa)" }}>
          Tudo do nosso casamento
        </h2>
        <p style={{ marginTop: "8px", textAlign: "center", fontSize: "14px", color: "var(--cocoa)", opacity: 0.65 }}>
          Em um só lugar, organizado para vocês reviverem quando quiserem.
        </p>

        <div style={{ marginTop: "24px", display: "grid", gap: "12px" }}>
          <ActionCard
            Icon={BookOpen}
            title="Manual do Convidado"
            description="Guia completo com dicas e informações"
            href="/manual"
          />
          <ActionCard
            Icon={Heart}
            title="Linha do Tempo"
            description="Nossa história em fotos e momentos"
            href="/linha-do-tempo"
          />
          <ActionCard
            Icon={Gift}
            title="Álbum Colaborativo"
            description="Compartilhe suas fotos conosco"
            href="/album"
          />
        </div>

        <div style={{ marginTop: "40px", paddingBottom: "40px", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "var(--cocoa)", opacity: 0.6, marginBottom: "16px" }}>
            Qualquer dúvida, nos contacte:
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
            <a href="mailto:contato@dipaulastudio.com.br" style={{ fontSize: "12px", color: "var(--gold-deep)", textDecoration: "none" }}>
              📧 Email
            </a>
            <a href="https://wa.me/5511999999999" style={{ fontSize: "12px", color: "var(--gold-deep)", textDecoration: "none" }}>
              💬 WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoRow({ Icon, title, sub }: { Icon: any; title: string; sub: string }) {
  return (
    <div style={{ display: "flex", gap: "12px", padding: "12px", backgroundColor: "rgba(255,255,255,0.5)", borderRadius: "8px" }}>
      <Icon size={20} style={{ color: "var(--gold-deep)", flexShrink: 0, marginTop: "2px" }} />
      <div>
        <p style={{ fontSize: "12px", fontWeight: "600", color: "var(--cocoa)" }}>{title}</p>
        <p style={{ fontSize: "12px", color: "var(--cocoa)", opacity: 0.7 }}>{sub}</p>
      </div>
    </div>
  );
}

function ActionCard({ Icon, title, description, href }: { Icon: any; title: string; description: string; href: string }) {
  return (
    <a
      href={href}
      style={{
        display: "block",
        padding: "20px",
        backgroundColor: "rgba(255,255,255,0.6)",
        borderRadius: "12px",
        textDecoration: "none",
        color: "var(--cocoa)",
        border: "1px solid rgba(156, 122, 58, 0.2)",
        transition: "all 0.3s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.8)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.6)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
        <Icon size={24} style={{ color: "var(--gold-deep)", flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: "14px", fontWeight: "600" }}>{title}</p>
          <p style={{ fontSize: "12px", color: "var(--cocoa)", opacity: 0.7, marginTop: "4px" }}>{description}</p>
        </div>
      </div>
    </a>
  );
}
