import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const { ativa } = await req.json();

  if (ativa !== true) {
    return NextResponse.json({ error: "Só é possível ativar uma edição." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.edicao.updateMany({ where: { ativa: true }, data: { ativa: false } }),
    prisma.edicao.update({ where: { id }, data: { ativa: true } }),
  ]);

  return NextResponse.json({ ok: true });
}
