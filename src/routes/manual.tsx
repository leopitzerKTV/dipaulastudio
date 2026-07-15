import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/manual")({
  component: Manual,
});

function Manual() {
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

        <h1 style={{ color: "var(--cocoa)", marginBottom: "24px" }}>Manual do Convidado</h1>

        <div style={{
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "8px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ color: "var(--gold-deep)", marginTop: "24px", marginBottom: "12px" }}>
            Bem-vindo ao nosso casamento!
          </h2>
          <p style={{ color: "var(--cocoa)", lineHeight: "1.6", marginBottom: "16px" }}>
            Este manual foi preparado com carinho para que você possa aproveitar ao máximo este dia especial.
          </p>

          <h3 style={{ color: "var(--cocoa)", marginTop: "20px", marginBottom: "8px" }}>Local e Horário</h3>
          <p style={{ color: "var(--cocoa)", opacity: 0.7 }}>
            📍 Espaço Jardim Secreto, São Paulo - SP<br />
            🕓 Sábado, 24 de Maio de 2025 às 16h30
          </p>

          <h3 style={{ color: "var(--cocoa)", marginTop: "20px", marginBottom: "8px" }}>Informações Importantes</h3>
          <ul style={{ color: "var(--cocoa)", opacity: 0.7, paddingLeft: "20px" }}>
            <li>Chegue com 30 minutos de antecedência</li>
            <li>Dress code: Social</li>
            <li>Favor confirmar presença até 15 de Maio</li>
          </ul>

          <h3 style={{ color: "var(--cocoa)", marginTop: "20px", marginBottom: "8px" }}>Contato</h3>
          <p style={{ color: "var(--cocoa)", opacity: 0.7 }}>
            📧 contato@dipaulastudio.com.br<br />
            📱 (11) 99999-9999
          </p>
        </div>
      </div>
    </div>
  );
}
