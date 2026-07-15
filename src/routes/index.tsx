import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <html>
      <body style={{ padding: "40px", fontFamily: "Arial", textAlign: "center" }}>
        <h1>Olá Mundo!</h1>
        <p>Teste simples - se isso carrega, a rota funciona.</p>
      </body>
    </html>
  );
}
