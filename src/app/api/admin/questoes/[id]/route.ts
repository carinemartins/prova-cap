import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const { texto, tipo, pontos, ordem, ativa, opcoes } = await req.json();

  await prisma.opcao.deleteMany({ where: { questaoId: id } });

  const questao = await prisma.questao.update({
    where: { id },
    data: {
      texto,
      tipo,
      pontos: Number(pontos),
      ordem: Number(ordem),
      ativa,
      opcoes: {
        create: opcoes
          .filter((o: { texto: string }) => o.texto.trim())
          .map((o: { texto: string; correta: boolean; ordem: number }) => ({
            texto: o.texto.trim(),
            correta: o.correta,
            ordem: o.ordem,
          })),
      },
    },
  });

  return NextResponse.json(questao);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.questao.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
