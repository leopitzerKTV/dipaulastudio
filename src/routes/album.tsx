import { createFileRoute } from "@tanstack/react-router";
import { Upload, Heart, Share2 } from "lucide-react";

export const Route = createFileRoute("/album")({
  component: Album,
});

function Album() {
  return (
    <div style={{
      backgroundColor: "var(--ivory)",
      minHeight: "100vh",
      padding: "24px",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: "8px 16px",
            backgroundColor: "var(--gold-deep)",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginBottom: "24px"
          }}
        >
          ← Voltar
        </button>

        <h1 style={{ color: "var(--cocoa)", marginBottom: "24px" }}>Álbum Colaborativo</h1>

        <div style={{
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "8px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          marginBottom: "24px"
        }}>
          <p style={{ color: "var(--cocoa)", lineHeight: "1.6", marginBottom: "24px" }}>
            Queremos reviver cada momento desta celebração através das suas perspectivas. Compartilhe as suas fotos conosco e ajude a criar uma memória coletiva deste dia especial.
          </p>

          <div style={{
            backgroundColor: "rgba(156, 122, 58, 0.1)",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "24px",
            textAlign: "center"
          }}>
            <Upload size={40} style={{ color: "var(--gold-deep)", margin: "0 auto 12px" }} />
            <h3 style={{ color: "var(--cocoa)", marginBottom: "8px" }}>Enviando suas fotos</h3>
            <p style={{ color: "var(--cocoa)", opacity: 0.7, fontSize: "14px", marginBottom: "16px" }}>
              Clique no botão abaixo para compartilhar suas fotos do casamento
            </p>
            <button
              style={{
                padding: "12px 24px",
                backgroundColor: "var(--gold-deep)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "600"
              }}
              onClick={() => {
                window.location.href = "mailto:contato@dipaulastudio.com.br?subject=Fotos%20do%20Casamento&body=Gostaria%20de%20compartilhar%20minhas%20fotos%20do%20casamento%20de%20Amanda%20e%20Ricardo.";
              }}
            >
              📧 Compartilhar via Email
            </button>
          </div>

          <h3 style={{ color: "var(--cocoa)", marginTop: "24px", marginBottom: "12px" }}>Como funciona</h3>
          <div style={{ display: "grid", gap: "16px" }}>
            <StepCard number="1" title="Fotografe" description="Capture os momentos especiais através de sua lente" />
            <StepCard number="2" title="Organize" description="Prepare suas fotos melhores do dia" />
            <StepCard number="3" title="Compartilhe" description="Envie para nós via email com suas fotos" />
          </div>

          <h3 style={{ color: "var(--cocoa)", marginTop: "24px", marginBottom: "12px" }}>Dicas para boas fotos</h3>
          <ul style={{ color: "var(--cocoa)", opacity: 0.7, paddingLeft: "20px", lineHeight: "1.8" }}>
            <li>Capture momentos sinceros e naturais</li>
            <li>Não hesite em fotografar detalhes e decorações</li>
            <li>Fotos em grupo são sempre bem-vindas</li>
            <li>Use boa iluminação quando possível</li>
            <li>Diversidade de ângulos enriquece o álbum</li>
          </ul>

          <div style={{
            backgroundColor: "rgba(156, 122, 58, 0.1)",
            padding: "16px",
            borderRadius: "8px",
            marginTop: "24px"
          }}>
            <p style={{ color: "var(--cocoa)", opacity: 0.8, fontSize: "14px", margin: 0 }}>
              💡 <strong>Dica:</strong> Use a hashtag <code style={{ backgroundColor: "white", padding: "2px 6px", borderRadius: "3px" }}>#AmandaeRicardo2025</code> em redes sociais para maior alcance
            </p>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p style={{ fontSize: "12px", color: "var(--cocoa)", opacity: 0.6 }}>
            Dúvidas? Entre em contato conosco
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "12px" }}>
            <a href="mailto:contato@dipaulastudio.com.br" style={{ fontSize: "12px", color: "var(--gold-deep)", textDecoration: "none" }}>
              📧 Email
            </a>
            <a href="https://wa.me/5511999999999" style={{ fontSize: "12px", color: "var(--gold-deep)", textDecoration: "none" }}>
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div style={{ display: "flex", gap: "16px" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        backgroundColor: "var(--gold-deep)",
        color: "white",
        fontWeight: "bold",
        flexShrink: 0
      }}>
        {number}
      </div>
      <div>
        <p style={{ fontWeight: "600", color: "var(--cocoa)", margin: "0 0 4px 0" }}>{title}</p>
        <p style={{ color: "var(--cocoa)", opacity: 0.7, margin: 0, fontSize: "14px" }}>{description}</p>
      </div>
    </div>
  );
}
