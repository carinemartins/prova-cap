import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  // Setup e login são públicas — não verificam admin nem sessão
  const isPublic = pathname === "/admin/setup" || pathname === "/admin/login";

  if (!isPublic) {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount === 0) {
      redirect("/admin/setup");
    }
  }

  const session = await auth();

  return (
    <div className="min-h-screen bg-brand-dark">
      {session && (
        <aside className="fixed inset-y-0 left-0 z-20 w-60 bg-brand-dark-mid border-r border-white/8 flex flex-col">

          {/* Logo */}
          <div className="px-5 py-5 border-b border-white/8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-gold flex items-center justify-center shrink-0">
                <span className="text-brand-dark font-bold text-sm" style={{ fontFamily: "var(--font-playfair)" }}>C</span>
              </div>
              <div>
                <p className="text-white text-sm font-semibold leading-none">CAP Admin</p>
                <p className="text-white/40 text-xs mt-0.5 leading-none">Consertos e Ajustes</p>
              </div>
            </div>
          </div>

          {/* Usuário logado */}
          <div className="px-5 py-3 border-b border-white/8">
            <p className="text-white/35 text-[10px] uppercase tracking-wider font-semibold">Logado como</p>
            <p className="text-white/85 text-sm font-medium truncate mt-0.5">{session.user?.name}</p>
          </div>

          {/* Navegação */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            <NavLink href="/admin" icon={<IconDashboard />} pathname={pathname} exact>Dashboard</NavLink>
            <NavLink href="/admin/resultados" icon={<IconResultados />} pathname={pathname}>Resultados</NavLink>
            <NavLink href="/admin/questoes" icon={<IconQuestoes />} pathname={pathname}>Questões</NavLink>
            <NavLink href="/admin/grupos" icon={<IconGrupos />} pathname={pathname}>Grupos</NavLink>
            <NavLink href="/admin/configuracoes" icon={<IconConfiguracoes />} pathname={pathname}>Configurações</NavLink>
            <NavLink href="/admin/edicoes" icon={<IconEdicoes />} pathname={pathname}>Edições</NavLink>
            <NavLink href="/admin/usuarios" icon={<IconUsuarios />} pathname={pathname}>Usuários</NavLink>
          </nav>

          {/* Logout */}
          <div className="px-3 py-4 border-t border-white/8">
            <LogoutButton />
          </div>
        </aside>
      )}

      <main className={`min-h-screen bg-brand-dark ${session ? "ml-60" : ""}`}>{children}</main>
    </div>
  );
}

function NavLink({
  href, icon, children, pathname, exact,
}: { href: string; icon: React.ReactNode; children: React.ReactNode; pathname: string; exact?: boolean }) {
  const ativo = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
        ativo
          ? "bg-brand-gold/12 text-brand-gold font-medium"
          : "text-white/55 hover:bg-white/6 hover:text-white/85"
      }`}
    >
      {ativo && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full bg-brand-gold" />}
      <span className={ativo ? "text-brand-gold" : "text-white/35"}>{icon}</span>
      {children}
    </Link>
  );
}

// ── Ícones ───────────────────────────────────────────────────────────────────
const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "w-[18px] h-[18px] shrink-0",
};

function IconDashboard() {
  return (
    <svg {...iconProps}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconResultados() {
  return (
    <svg {...iconProps}>
      <rect x="4" y="12" width="4" height="8" rx="1" />
      <rect x="10" y="7" width="4" height="13" rx="1" />
      <rect x="16" y="3" width="4" height="17" rx="1" />
    </svg>
  );
}

function IconQuestoes() {
  return (
    <svg {...iconProps}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="12" y2="16" />
    </svg>
  );
}

function IconGrupos() {
  return (
    <svg {...iconProps}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19.5C3.5 15.9 6 13.5 9 13.5C12 13.5 14.5 15.9 14.5 19.5" />
      <circle cx="17" cy="9.5" r="2.4" />
      <path d="M14.5 19.5C14.7 16.8 16 15 17.8 14.2" />
    </svg>
  );
}

function IconConfiguracoes() {
  return (
    <svg {...iconProps}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <circle cx="9" cy="6" r="2" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <circle cx="15" cy="12" r="2" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  );
}

function IconEdicoes() {
  return (
    <svg {...iconProps}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <line x1="4" y1="9.5" x2="20" y2="9.5" />
      <line x1="8" y1="3" x2="8" y2="6.5" />
      <line x1="16" y1="3" x2="16" y2="6.5" />
    </svg>
  );
}

function IconUsuarios() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20C4.5 15.5 7.8 12.8 12 12.8C16.2 12.8 19.5 15.5 19.5 20" />
    </svg>
  );
}
