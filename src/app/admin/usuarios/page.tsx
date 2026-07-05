import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const session = await getServerSession();
  const userRole = session?.user?.role;

  if (userRole !== "ADMIN") {
    return (
      <div className="p-8 text-center text-white/40">
        Acesso restrito a administradores.
      </div>
    );
  }

  const usuarios = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>Usuários</h1>
          <p className="text-sm text-white/40 mt-1">{usuarios.length} usuário(s) cadastrado(s)</p>
        </div>
        <Link
          href="/admin/usuarios/novo"
          className="bg-brand-gold hover:bg-brand-gold-dark text-brand-dark text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          + Novo usuário
        </Link>
      </div>

      <div className="bg-white/[0.03] rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">Nome</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">Papel</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">Criado em</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {usuarios.map((u) => (
              <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                <td className="px-5 py-3.5 font-medium text-white/90">{u.name}</td>
                <td className="px-5 py-3.5 text-white/55">{u.email}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    u.role === "ADMIN"
                      ? "bg-brand-gold/15 text-brand-gold"
                      : "bg-white/8 text-white/55"
                  }`}>
                    {u.role === "ADMIN" ? "Admin" : "Editor"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    u.ativo
                      ? "bg-green-500/10 text-green-400"
                      : "bg-brand-rose/10 text-brand-rose"
                  }`}>
                    {u.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-white/35 text-xs">
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
