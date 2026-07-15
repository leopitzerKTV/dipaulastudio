import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement real authentication
    // For now, just mark as loading complete
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "var(--ivory)"
      }}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "var(--ivory)",
        padding: "20px"
      }}>
        <div style={{
          maxWidth: "400px",
          textAlign: "center",
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ marginBottom: "20px", color: "var(--cocoa)" }}>Área Administrativa</h2>
          <p style={{ color: "var(--cocoa)", opacity: 0.7, marginBottom: "20px" }}>
            Esta área requer autenticação
          </p>
          <a href="/" style={{
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "var(--gold-deep)",
            color: "white",
            borderRadius: "4px",
            textDecoration: "none"
          }}>
            Voltar para Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--ivory)", minHeight: "100vh", padding: "20px" }}>
      <Outlet />
    </div>
  );
}
