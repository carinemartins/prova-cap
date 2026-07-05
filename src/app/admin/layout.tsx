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
    <div className="min-h-screen bg-brand-dark flex">
      {session && (
        <aside className="w-60 bg-brand-dark-mid border-r border-white/8 flex flex-col shrink-0">

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
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            <NavLink href="/admin" icon="⊞" pathname={pathname} exact>Dashboard</NavLink>
            <NavLink href="/admin/resultados" icon="◈" pathname={pathname}>Resultados</NavLink>
            <NavLink href="/admin/questoes" icon="◇" pathname={pathname}>Questões</NavLink>
            <NavLink href="/admin/grupos" icon="◉" pathname={pathname}>Grupos</NavLink>
            <NavLink href="/admin/configuracoes" icon="◎" pathname={pathname}>Configurações</NavLink>
            <NavLink href="/admin/usuarios" icon="◯" pathname={pathname}>Usuários</NavLink>
          </nav>

          {/* Logout */}
          <div className="px-3 py-4 border-t border-white/8">
            <LogoutButton />
          </div>
        </aside>
      )}

      <main className="flex-1 overflow-auto bg-brand-dark">{children}</main>
    </div>
  );
}

function NavLink({
  href, icon, children, pathname, exact,
}: { href: string; icon: string; children: React.ReactNode; pathname: string; exact?: boolean }) {
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
      <span className={`text-xs ${ativo ? "text-brand-gold" : "text-white/35"}`}>{icon}</span>
      {children}
    </Link>
  );
}
