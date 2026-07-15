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

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Error caught by boundary:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--ivory)] text-[var(--cocoa)] px-6">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-2">Algo deu errado</h1>
            <p className="text-sm text-[var(--cocoa)]/70 mb-4">
              Desculpe, encontramos um erro ao carregar a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[var(--gold-deep)] text-white text-sm font-medium"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function RootComponent() {
  const queryClientRef = React.useRef<QueryClient | null>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        query: {
          retry: 1,
          staleTime: 5 * 60 * 1000,
        },
      },
    });
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
        <ErrorBoundary>
          <QueryClientProvider client={queryClientRef.current!}>
            <Outlet />
          </QueryClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
