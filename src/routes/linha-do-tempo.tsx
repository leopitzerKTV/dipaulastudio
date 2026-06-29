import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/linha-do-tempo")({
  component: () => <Outlet />,
});
