import { createFileRoute } from "@tanstack/react-router";
import { Heart, Sparkles } from "lucide-react";

export const Route = createFileRoute("/linha-do-tempo")({
  component: Timeline,
});

function Timeline() {
  const timelineEvents = [
    {
      year: "2018",
      title: "O Encontro",
      description: "Quando nossos caminhos se cruzaram e tudo mudou para melhor."
    },
    {
      year: "2019",
      title: "Primeiras Aventuras",
      description: "Exploramos o mundo juntos, criando memórias inesquecíveis."
    },
    {
      year: "2020",
      title: "Um Novo Capítulo",
      description: "Decidimos trilhar a vida juntos, consolidando nossos sonhos."
    },
    {
      year: "2022",
      title: "O Sim",
      description: "Ricardo fez o grande pedido e Amanda disse o tão esperado SIM."
    },
    {
      year: "2024",
      title: "Os Preparativos",
      description: "Cada detalhe foi pensado com carinho para tornar este dia perfeito."
    },
    {
      year: "2025",
      title: "O Grande Dia",
      description: "Finalmente chegou o momento de unir nossas vidas em uma celebração de amor."
    }
  ];

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

        <h1 style={{ color: "var(--cocoa)", marginBottom: "12px", textAlign: "center" }}>
          Linha do Tempo
        </h1>
        <p style={{ color: "var(--cocoa)", opacity: 0.7, marginBottom: "40px", textAlign: "center", lineHeight: "1.6" }}>
          Uma jornada de amor, crescimento e momentos inesquecíveis que nos levaram até aqui.
        </p>

        <div style={{ position: "relative" }}>
          {/* Timeline vertical line */}
          <div style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: "2px",
            backgroundColor: "var(--gold-deep)",
            transform: "translateX(-1px)"
          }} />

          {/* Timeline events */}
          <div>
            {timelineEvents.map((event, index) => (
              <div key={index} style={{ marginBottom: "40px", position: "relative" }}>
                {/* Timeline dot */}
                <div style={{
                  position: "absolute",
                  left: "50%",
                  top: "20px",
                  width: "16px",
                  height: "16px",
                  backgroundColor: "var(--gold-deep)",
                  borderRadius: "50%",
                  transform: "translateX(-50%)",
                  border: "4px solid var(--ivory)",
                  zIndex: 2
                }} />

                {/* Content box */}
                <div style={{
                  width: "calc(50% - 40px)",
                  marginLeft: index % 2 === 0 ? "0" : "calc(50% + 40px)",
                  marginRight: index % 2 === 0 ? "auto" : "0",
                  textAlign: index % 2 === 0 ? "right" : "left"
                }}>
                  <div style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                      justifyContent: index % 2 === 0 ? "flex-end" : "flex-start"
                    }}>
                      <Heart size={16} style={{ color: "var(--gold-deep)" }} />
                      <p style={{
                        fontSize: "13px",
                        fontWeight: "bold",
                        color: "var(--gold-deep)",
                        margin: 0
                      }}>
                        {event.year}
                      </p>
                    </div>
                    <h3 style={{
                      color: "var(--cocoa)",
                      fontSize: "16px",
                      fontWeight: "600",
                      margin: "8px 0",
                      lineHeight: "1.4"
                    }}>
                      {event.title}
                    </h3>
                    <p style={{
                      color: "var(--cocoa)",
                      opacity: 0.7,
                      fontSize: "14px",
                      margin: "8px 0 0 0",
                      lineHeight: "1.5"
                    }}>
                      {event.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          backgroundColor: "rgba(156, 122, 58, 0.1)",
          padding: "24px",
          borderRadius: "8px",
          marginTop: "40px",
          textAlign: "center"
        }}>
          <Sparkles size={32} style={{ color: "var(--gold-deep)", margin: "0 auto 12px" }} />
          <h3 style={{ color: "var(--cocoa)", marginBottom: "8px" }}>
            E agora...
          </h3>
          <p style={{ color: "var(--cocoa)", opacity: 0.8, lineHeight: "1.6", margin: 0 }}>
            Estamos prontos para escrever o próximo capítulo de nossas vidas, lado a lado, em um casamento celebrado com amor, alegria e a presença daqueles que nos importam.
          </p>
        </div>

        <div style={{ textAlign: "center", marginTop: "40px", marginBottom: "40px" }}>
          <p style={{ fontSize: "12px", color: "var(--cocoa)", opacity: 0.6 }}>
            Obrigado por fazer parte desta história
          </p>
          <Heart size={24} style={{ color: "var(--gold-deep)", margin: "12px auto 0", display: "inline-block" }} />
        </div>
      </div>
    </div>
  );
}
