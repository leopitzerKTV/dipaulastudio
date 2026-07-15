import { createRootRoute } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          :root {
            --ivory: #f5f1e8;
            --cocoa: #3d2817;
            --gold: #c9a55b;
            --gold-deep: #9c7a3a;
            --shadow-card: 0 4px 16px rgba(0, 0, 0, 0.1);
            --shadow-luxe: 0 8px 32px rgba(0, 0, 0, 0.2);
            --gradient-gold: linear-gradient(135deg, #9c7a3a, #c9a55b);
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          html, body {
            font-family: system-ui, -apple-system, sans-serif;
            background-color: var(--ivory);
            color: var(--cocoa);
            line-height: 1.6;
          }

          a {
            color: inherit;
            text-decoration: none;
          }

          button {
            font-family: inherit;
          }
        `}</style>
      </head>
      <body>
        <Outlet />
      </body>
    </html>
  ),
});
