import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession();
  if (!session || session.user?.role !== "ADMIN") return null;
  return session;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

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
  if (!await requireAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

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
