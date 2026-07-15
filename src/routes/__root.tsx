import { createRootRoute } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <div style={{ padding: "20px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Outlet />
    </div>
  ),
});
