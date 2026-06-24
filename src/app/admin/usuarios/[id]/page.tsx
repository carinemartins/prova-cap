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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Usuário</h1>
      <UsuarioForm usuario={{ id: usuario.id, name: usuario.name, email: usuario.email, role: usuario.role, ativo: usuario.ativo }} />
    </div>
  );
}
