import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import UsuarioForm from "@/components/UsuarioForm";

export const dynamic = "force-dynamic";

export default async function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await prisma.user.findUnique({ where: { id } });
  if (!usuario) notFound();

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>Editar usuário</h1>
        <p className="text-sm text-white/40 mt-1">Atualize os dados de acesso desta conta</p>
      </div>
      <UsuarioForm usuario={{ id: usuario.id, name: usuario.name, email: usuario.email, role: usuario.role, ativo: usuario.ativo }} />
    </div>
  );
}
