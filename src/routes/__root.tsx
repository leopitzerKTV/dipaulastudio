import { createRootRoute } from "@tanstack/react-router";

// Minimal test - just HTML, no React components
export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>DiPaula Studio - Test</title>
      </head>
      <body style={{ background: "white", padding: "20px", fontFamily: "Arial" }}>
        <h1>Test - No providers, no components</h1>
        <p>If this shows without errors, the problem is in a provider or component.</p>
      </body>
    </html>
  );
}
