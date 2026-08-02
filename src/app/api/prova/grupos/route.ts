import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEdicaoAtiva } from "@/lib/edicao";

export async function GET() {
  const edicao = await getEdicaoAtiva();
  const grupos = await prisma.grupo.findMany({
    where: { edicaoId: edicao.id, ativo: true },
    orderBy: { numero: "asc" },
    select: { id: true, numero: true, nome: true },
  });
  return NextResponse.json(grupos);
}
