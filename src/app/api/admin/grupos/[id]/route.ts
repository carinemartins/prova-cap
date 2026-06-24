import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const { nome, ativo } = await req.json();

  const grupo = await prisma.grupo.update({
    where: { id },
    data: {
      ...(nome !== undefined && { nome: String(nome).trim() }),
      ...(ativo !== undefined && { ativo: Boolean(ativo) }),
    },
  });

  return NextResponse.json(grupo);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  // Verifica se há submissões vinculadas
  const emUso = await prisma.submissao.count({ where: { grupoId: id } });
  if (emUso > 0) {
    return NextResponse.json(
      { error: `Este grupo tem ${emUso} submissão(ões) vinculada(s) e não pode ser removido.` },
      { status: 400 }
    );
  }

  await prisma.grupo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
