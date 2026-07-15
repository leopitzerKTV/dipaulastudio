import * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import stylesUrl from "@/styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    links: [{ rel: "stylesheet", href: stylesUrl }],
  }),
  component: RootComponent,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ivory)] text-[var(--cocoa)]">
      <p className="text-lg">Página não encontrada</p>
    </div>
  ),
});

function RootComponent() {
  const queryClientRef = React.useRef<QueryClient | null>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href={stylesUrl} />
        <title>DiPaula Studio</title>
      </head>
      <body>
        <QueryClientProvider client={queryClientRef.current!}>
          <Outlet />
        </QueryClientProvider>
      </body>
    </html>
  );
}
