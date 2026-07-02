import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { ArrowUpRight, Edit, Pencil, Search, Shield, ShieldAlert, Trash2, UserPlus, X } from "lucide-react";

import { AdminGate, useAdminAuth } from "@/components/admin/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";

type AdminRole = "super_admin" | "admin" | "editor" | "couple";

type AdminUser = {
  user_id: string;
  email: string;
  name: string | null;
  role: AdminRole;
  created_at: string;
};

const SUPER_ADMIN_EMAIL = "kriativagrupo@gmail.com";

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  admin: "Administrador",
  editor: "Editor",
  couple: "Casal",
};

const ROLE_ICONS: Record<AdminRole, React.ReactNode> = {
  super_admin: <ShieldAlert className="h-5 w-5" />,
  admin: <Shield className="h-5 w-5" />,
  editor: <Shield className="h-5 w-5" />,
  couple: <Shield className="h-5 w-5" />,
};

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Usuários Administrativos — Área Administrativa" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => (
    <AdminGate>
      <AdminUsersPage />
    </AdminGate>
  ),
});

function AdminUsersPage() {
  const { session } = useAdminAuth();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<AdminRole>("admin");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [removeConfirm, setRemoveConfirm] = useState<AdminUser | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<AdminRole>("admin");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const loadAdminUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("list_admin_users");
    if (error) {
      console.error("Erro ao carregar administradores:", error);
    } else {
      setAdminUsers(data || []);
    }
    setLoading(false);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setAddError("");

    if (newRole === "super_admin" && !sessionIsSuperAdmin) {
      setAddError("Apenas super admins podem atribuir este papel");
      setAdding(false);
      return;
    }

    const { data, error } = await supabase.rpc("add_admin_role", { _email: newEmail, _name: newName || null, _role: newRole });
    
    if (error) {
      setAddError("Erro ao adicionar administrador");
    } else if (!data?.success) {
      setAddError(data?.error || "Erro ao adicionar administrador");
    } else {
      setNewEmail("");
      setNewName("");
      setNewRole("admin");
      setShowAddForm(false);
      await loadAdminUsers();
    }
    
    setAdding(false);
  };

  const handleRemoveAdmin = async () => {
    if (!removeConfirm) return;
    
    setRemoving(true);
    setRemoveError("");

    const { data, error } = await supabase.rpc("remove_admin_role", { _user_id: removeConfirm.user_id });
    
    if (error) {
      setRemoveError("Erro ao remover administrador");
    } else if (!data?.success) {
      setRemoveError(data?.error || "Erro ao remover administrador");
    } else {
      setRemoveConfirm(null);
      await loadAdminUsers();
    }
    
    setRemoving(false);
  };

  const handleUpdateRole = async () => {
    if (!editUser) return;
    
    setUpdating(true);
    setUpdateError("");

    const { data, error } = await supabase.rpc("update_user_role", { 
      _user_id: editUser.user_id, 
      _new_role: isSuperAdmin(editUser.role) ? null : editRole, 
      _new_name: editName || null 
    });
    
    if (error) {
      setUpdateError("Erro ao atualizar papel");
    } else if (!data?.success) {
      setUpdateError(data?.error || "Erro ao atualizar papel");
    } else {
      setEditUser(null);
      setEditName("");
      setEditRole("admin");
      await loadAdminUsers();
    }
    
    setUpdating(false);
  };

  const openEditModal = (user: AdminUser) => {
    setEditUser(user);
    setEditName(user.name || "");
    setEditRole(user.role);
    setUpdateError("");
  };

  const isSuperAdmin = (role: string) => role === "super_admin";

  const sessionIsSuperAdmin = useMemo(() => {
    if (!session?.user.id) return false;
    return adminUsers.some((user) => user.user_id === session.user.id && user.role === "super_admin");
  }, [adminUsers, session?.user.id]);

  useEffect(() => {
    if (!sessionIsSuperAdmin && newRole === "super_admin") {
      setNewRole("admin");
    }
  }, [sessionIsSuperAdmin, newRole]);

  const roleSelectOptions: AdminRole[] = sessionIsSuperAdmin ? ["admin", "editor", "super_admin"] : ["admin", "editor"];

  const canEditUser = (user: AdminUser) => {
    if (isSuperAdmin(user.role)) {
      return session?.user.id === user.user_id || sessionIsSuperAdmin;
    }
    return true;
  };

  const filteredUsers = adminUsers.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Carregar usuários ao montar
  useEffect(() => {
    loadAdminUsers();
  }, []);

  return (
    <AdminShell>
      <header className="flex flex-col gap-4 border-b border-[var(--gold)]/25 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-serif-caps text-[11px] text-[var(--cocoa)]/70">Gestão de acessos</p>
          <h1 className="mt-2 font-display text-4xl text-[var(--cocoa)]">Usuários Administrativos</h1>
          <p className="mt-1 text-sm text-[var(--cocoa)]/65">
            Gerencie quem tem acesso à área administrativa do sistema.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--gold-deep)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          <UserPlus className="h-4 w-4" />
          {showAddForm ? "Cancelar" : "Adicionar administrador"}
        </button>
      </header>

      {showAddForm && (
        <div className="mt-6 rounded-3xl border border-[var(--gold)]/25 bg-[var(--champagne)]/35 p-6 shadow-[var(--shadow-card)]">
          <h2 className="font-display text-xl text-[var(--cocoa)]">Adicionar novo administrador</h2>
          <p className="mt-1 text-sm text-[var(--cocoa)]/70">
            Insira o email do usuário que deseja tornar administrador.
          </p>
          <form onSubmit={handleAddAdmin} className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full rounded-2xl border border-[var(--gold)]/30 bg-white/80 px-4 py-3 text-sm text-[var(--cocoa)] placeholder:text-[var(--cocoa)]/40 focus:border-[var(--gold-deep)] focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="w-full rounded-2xl border border-[var(--gold)]/30 bg-white/80 px-4 py-3 text-sm text-[var(--cocoa)] placeholder:text-[var(--cocoa)]/40 focus:border-[var(--gold-deep)] focus:outline-none"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="sm:w-48">
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AdminRole)}
                  className="w-full rounded-2xl border border-[var(--gold)]/30 bg-white/80 px-4 py-3 text-sm text-[var(--cocoa)] focus:border-[var(--gold-deep)] focus:outline-none"
                >
                  {roleSelectOptions.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={adding}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--gold-deep)] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {adding ? "Adicionando..." : "Adicionar"}
              </button>
            </div>
          </form>
          {addError && (
            <p className="mt-2 text-xs text-red-600">{addError}</p>
          )}
        </div>
      )}

      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[var(--gold)]/20 bg-white/80 px-4 py-3">
        <Search className="h-4 w-4 text-[var(--cocoa)]/50" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por email..."
          className="flex-1 bg-transparent text-sm text-[var(--cocoa)] placeholder:text-[var(--cocoa)]/40 focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-[var(--cocoa)]/50 hover:text-[var(--cocoa)]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="mt-8 flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--gold-deep)] border-t-transparent" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-[var(--gold)]/25 bg-white/80 p-12 text-center">
          <Shield className="mx-auto h-12 w-12 text-[var(--gold)]/50" />
          <p className="mt-4 text-sm text-[var(--cocoa)]/70">
            {searchQuery ? "Nenhum administrador encontrado com este email." : "Nenhum administrador cadastrado."}
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-3xl border border-[var(--gold)]/25 bg-white/90 shadow-[var(--shadow-card)]">
          <table className="w-full">
            <thead className="border-b border-[var(--gold)]/20 bg-[var(--champagne)]/20">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cocoa)]/60">
                  Nome
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cocoa)]/60">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cocoa)]/60">
                  Papel
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cocoa)]/60">
                  Data de criação
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cocoa)]/60">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.user_id} className="border-b border-[var(--gold)]/10 last:border-b-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gold)]/12 text-[var(--gold-deep)]">
                        {ROLE_ICONS[user.role] || <Shield className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--cocoa)]">{user.name || user.email}</p>
                        {user.name && (
                          <p className="text-xs text-[var(--cocoa)]/50">{user.email}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      user.role === 'super_admin' 
                        ? 'bg-[var(--gold)]/20 text-[var(--gold-deep)]' 
                        : user.role === 'admin'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--cocoa)]/70">
                    {new Date(user.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canEditUser(user) && (
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Editar
                        </button>
                      )}
                      {!isSuperAdmin(user.role) && (
                        <button
                          type="button"
                          onClick={() => setRemoveConfirm(user)}
                          className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remover
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {removeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl border border-[var(--gold)]/25 bg-white p-6 shadow-[var(--shadow-luxe)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-xl text-[var(--cocoa)]">Remover administrador</h3>
            <p className="mt-2 text-sm text-[var(--cocoa)]/70">
              Tem certeza que deseja remover o acesso administrativo de <strong>{removeConfirm.email}</strong>?
            </p>
            {removeError && (
              <p className="mt-3 text-xs text-red-600">{removeError}</p>
            )}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setRemoveConfirm(null);
                  setRemoveError("");
                }}
                className="rounded-full border border-[var(--gold)]/40 px-5 py-2.5 text-sm font-semibold text-[var(--gold-deep)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRemoveAdmin}
                disabled={removing}
                className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {removing ? "Removendo..." : "Confirmar remoção"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl border border-[var(--gold)]/25 bg-white p-6 shadow-[var(--shadow-luxe)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Edit className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-xl text-[var(--cocoa)]">Editar papel do usuário</h3>
            <p className="mt-2 text-sm text-[var(--cocoa)]/70">
              Alterar o nível de acesso de <strong>{editUser.email}</strong>
            </p>
            <div className="mt-4">
              <label className="block text-xs font-semibold text-[var(--cocoa)]/70 mb-2">Nome</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nome completo"
                className="w-full rounded-2xl border border-[var(--gold)]/30 bg-white/80 px-4 py-3 text-sm text-[var(--cocoa)] placeholder:text-[var(--cocoa)]/40 focus:border-[var(--gold-deep)] focus:outline-none"
              />
            </div>
            <div className="mt-4">
              <label className="block text-xs font-semibold text-[var(--cocoa)]/70 mb-2">Papel</label>
              {isSuperAdmin(editUser?.role || "") ? (
                <div className="rounded-2xl border border-[var(--gold)]/30 bg-[var(--champagne)]/35 px-4 py-3 text-sm text-[var(--cocoa)]">
                  Super Admin
                </div>
              ) : (
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as AdminRole)}
                  className="w-full rounded-2xl border border-[var(--gold)]/30 bg-white/80 px-4 py-3 text-sm text-[var(--cocoa)] focus:border-[var(--gold-deep)] focus:outline-none"
                >
                  {roleSelectOptions.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {updateError && (
              <p className="mt-3 text-xs text-red-600">{updateError}</p>
            )}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setEditUser(null);
                  setEditName("");
                  setEditRole("admin");
                  setUpdateError("");
                }}
                className="rounded-full border border-[var(--gold)]/40 px-5 py-2.5 text-sm font-semibold text-[var(--gold-deep)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleUpdateRole}
                disabled={updating}
                className="rounded-full bg-[var(--gold-deep)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {updating ? "Atualizando..." : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
