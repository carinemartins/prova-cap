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
    <div className="min-h-screen bg-brand-cream flex">
      {session && (
        <aside className="w-60 bg-brand-dark flex flex-col shrink-0">

          {/* Logo */}
          <div className="px-5 py-5 border-b border-white/10">
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
          <div className="px-5 py-3 border-b border-white/10">
            <p className="text-white/40 text-xs uppercase tracking-wider">Logado como</p>
            <p className="text-white/80 text-sm font-medium truncate mt-0.5">{session.user?.name}</p>
          </div>

          {/* Navegação */}
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            <NavLink href="/admin" icon="⊞">Dashboard</NavLink>
            <NavLink href="/admin/resultados" icon="◈">Resultados</NavLink>
            <NavLink href="/admin/questoes" icon="◇">Questões</NavLink>
            <NavLink href="/admin/grupos" icon="◉">Grupos</NavLink>
            <NavLink href="/admin/configuracoes" icon="◎">Configurações</NavLink>
            <NavLink href="/admin/usuarios" icon="◯">Usuários</NavLink>
          </nav>

          {/* Logout */}
          <div className="px-3 py-4 border-t border-white/10">
            <LogoutButton />
          </div>
        </aside>
      )}

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/8 hover:text-brand-gold transition-colors"
    >
      <span className="text-brand-gold/50 text-xs">{icon}</span>
      {children}
    </Link>
  );
}
