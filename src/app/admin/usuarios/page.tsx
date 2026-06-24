import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const session = await auth();
  const userRole = (session?.user as { role?: string })?.role;

  if (userRole !== "ADMIN") {
    return (
      <div className="p-8 text-center text-brand-text/40">
        Acesso restrito a administradores.
      </div>
    );
  }

  const usuarios = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-brand-text" style={{ fontFamily: 'var(--font-playfair)' }}>Usuários</h1>
          <p className="text-sm text-brand-text/50 mt-1">{usuarios.length} usuário(s) cadastrado(s)</p>
        </div>
        <Link
          href="/admin/usuarios/novo"
          className="bg-brand-gold hover:bg-brand-gold-dark text-brand-dark text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          + Novo usuário
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-brand-cream-dark overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-cream/60">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-brand-text/50 uppercase tracking-wider">Nome</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-brand-text/50 uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-brand-text/50 uppercase tracking-wider">Papel</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-brand-text/50 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-brand-text/50 uppercase tracking-wider">Criado em</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-cream-dark">
            {usuarios.map((u) => (
              <tr key={u.id} className="hover:bg-brand-cream/40 transition-colors">
                <td className="px-5 py-3.5 font-medium text-brand-text">{u.name}</td>
                <td className="px-5 py-3.5 text-brand-text/60">{u.email}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    u.role === "ADMIN"
                      ? "bg-brand-gold/15 text-brand-gold-dark"
                      : "bg-brand-cream-dark text-brand-text/60"
                  }`}>
                    {u.role === "ADMIN" ? "Admin" : "Editor"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    u.ativo
                      ? "bg-green-50 text-green-700"
                      : "bg-brand-rose/10 text-brand-rose"
                  }`}>
                    {u.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-brand-text/40 text-xs">
                  {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-5 py-3.5">
                  <Link href={`/admin/usuarios/${u.id}`} className="text-xs text-brand-gold hover:underline font-medium">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
