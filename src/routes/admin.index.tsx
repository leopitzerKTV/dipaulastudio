import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Users,
  Settings,
  Sparkles,
  ClipboardCheck,
  UserPlus,
  CalendarClock,
  LogOut,
  Shield,
} from "lucide-react";

import { AdminGate, useAdminAuth } from "@/components/admin/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";

const stats = [
  { label: "Convites ativos", value: "18", badge: "+2 esta semana" },
  { label: "Casais em onboarding", value: "6", badge: "3 aguardando briefing" },
  { label: "Usuários gerados", value: "42", badge: "12 com acesso recente" },
];

const quickLinks = [
  {
    title: "Criar convite",
    description: "Escolha um template e personalize a timeline do casal.",
    action: "Iniciar",
    icon: Sparkles,
    to: "/admin",
  },
  {
    title: "Casais",
    description: "Gerencie acessos, envie credenciais e acompanhe progresso.",
    action: "Abrir lista",
    icon: Users,
    to: "/admin",
  },
  {
    title: "Usuários administrativos",
    description: "Gerencie quem tem acesso à área administrativa do sistema.",
    action: "Gerenciar",
    icon: Shield,
    to: "/admin/users",
  },
  {
    title: "Configurações",
    description: "Atualize temas, textos padrão e integrações.",
    action: "Configurar",
    icon: Settings,
    to: "/admin",
  },
];

const nextSteps = [
  { title: "Enviar checklist para Julia & Renato", due: "Hoje às 16h" },
  { title: "Liberar acesso dos noivos — Marcela & Iuri", due: "Amanhã" },
  { title: "Revisar template minimalista", due: "Sexta-feira" },
];

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Área Administrativa" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <AdminGate>
      <AdminDashboard />
    </AdminGate>
  ),
});

function AdminDashboard() {
  const { session, signOut } = useAdminAuth();

  return (
    <AdminShell>
      <header className="flex flex-col gap-6 border-b border-[var(--gold)]/25 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-serif-caps text-[11px] text-[var(--cocoa)]/70">Painel estratégico</p>
          <h1 className="mt-2 font-display text-4xl text-[var(--cocoa)]">Bem-vindo de volta</h1>
          <p className="mt-1 text-sm text-[var(--cocoa)]/65">
            Centralize convites, credenciais dos casais e configurações do sistema em um só lugar.
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-[var(--gold)]/30 bg-white/70 px-5 py-3">
          <div>
            <p className="text-sm font-medium text-[var(--cocoa)]">{session?.user.email}</p>
            <p className="text-xs text-[var(--cocoa)]/60">Administrador</p>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--gold-deep)] px-4 py-2 text-xs font-semibold text-white"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </header>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-[var(--gold)]/20 bg-[var(--champagne)]/35 p-6 shadow-[var(--shadow-card)]">
          <p className="font-serif-caps text-[11px] text-[var(--gold-deep)]">Próximo passo</p>
          <h2 className="mt-2 font-display text-3xl text-[var(--cocoa)]">
            Crie o convite do novo casal
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--cocoa)]/70">
            Configure layouts, agenda, fotos e gere as credenciais dos noivos sem sair deste painel.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-[var(--gold-deep)] px-5 py-2.5 text-sm font-semibold text-white">
              <Sparkles className="h-4 w-4" /> Criar novo convite
            </button>
            <button className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 px-5 py-2.5 text-sm font-semibold text-[var(--gold-deep)]">
              <ClipboardCheck className="h-4 w-4" /> Checklist dos casais
            </button>
          </div>
        </div>
        <div className="rounded-[28px] border border-[var(--gold)]/25 bg-white/80 p-6 shadow-[var(--shadow-card)]">
          <p className="font-serif-caps text-[11px] text-[var(--gold-deep)]">Próximas entregas</p>
          <ul className="mt-4 space-y-4">
            {nextSteps.map((step) => (
              <li
                key={step.title}
                className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--gold)]/20 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--cocoa)]">{step.title}</p>
                  <p className="text-xs text-[var(--cocoa)]/60">{step.due}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-[var(--gold-deep)]" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-3xl border border-[var(--gold)]/25 bg-white/85 p-5 shadow-[var(--shadow-card)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cocoa)]/60">
              {stat.label}
            </p>
            <p className="mt-3 font-display text-4xl text-[var(--cocoa)]">{stat.value}</p>
            <p className="mt-2 text-xs text-[var(--gold-deep)]">{stat.badge}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <article
            key={link.title}
            className="flex h-full flex-col rounded-3xl border border-[var(--gold)]/25 bg-white/90 p-5 shadow-[var(--shadow-card)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--gold)]/12 text-[var(--gold-deep)]">
              <link.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl text-[var(--cocoa)]">{link.title}</h3>
            <p className="mt-2 flex-1 text-sm text-[var(--cocoa)]/70">{link.description}</p>
            <Link
              to={link.to}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--gold-deep)]"
            >
              {link.action}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-2">
        <article className="rounded-3xl border border-[var(--gold)]/25 bg-white/90 p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3">
            <UserPlus className="h-5 w-5 text-[var(--gold-deep)]" />
            <div>
              <h3 className="text-lg text-[var(--cocoa)]">Casais aguardando credenciais</h3>
              <p className="text-xs text-[var(--cocoa)]/60">
                Libere usuários assim que o convite estiver publicado.
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl border border-[var(--gold)]/20 px-4 py-3">
              <div>
                <p className="font-medium text-[var(--cocoa)]">Bianca & Thiago</p>
                <p className="text-xs text-[var(--cocoa)]/60">
                  Convite floral — versão final enviada
                </p>
              </div>
              <button className="rounded-full border border-[var(--gold)]/50 px-4 py-1 text-xs font-semibold text-[var(--gold-deep)]">
                Gerar acesso
              </button>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-[var(--gold)]/20 px-4 py-3">
              <div>
                <p className="font-medium text-[var(--cocoa)]">Marina & Pedro</p>
                <p className="text-xs text-[var(--cocoa)]/60">Aguardando briefing final</p>
              </div>
              <span className="text-xs font-semibold text-[var(--gold-deep)]">Follow-up</span>
            </div>
          </div>
        </article>
        <article className="rounded-3xl border border-[var(--gold)]/25 bg-white/90 p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3">
            <CalendarClock className="h-5 w-5 text-[var(--gold-deep)]" />
            <div>
              <h3 className="text-lg text-[var(--cocoa)]">Status dos templates</h3>
              <p className="text-xs text-[var(--cocoa)]/60">Acompanhe o que precisa de revisão.</p>
            </div>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center justify-between rounded-2xl border border-[var(--gold)]/20 px-4 py-3">
              <div>
                <p className="font-medium text-[var(--cocoa)]">Minimalista dourado</p>
                <p className="text-xs text-[var(--cocoa)]/60">Última atualização há 3 dias</p>
              </div>
              <span className="text-xs font-semibold text-[var(--gold-deep)]">Revisar</span>
            </li>
            <li className="flex items-center justify-between rounded-2xl border border-[var(--gold)]/20 px-4 py-3">
              <div>
                <p className="font-medium text-[var(--cocoa)]">Clássico jardim</p>
                <p className="text-xs text-[var(--cocoa)]/60">Publicado</p>
              </div>
              <span className="text-xs font-semibold text-emerald-700">OK</span>
            </li>
          </ul>
        </article>
      </section>
    </AdminShell>
  );
}
