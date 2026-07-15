import { Outlet, createFileRoute } from "@tanstack/react-router";

import { AdminAuthProvider } from "@/components/admin/admin-auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Área Administrativa" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  );
}
