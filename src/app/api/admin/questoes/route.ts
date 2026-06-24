import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { texto, tipo, pontos, ordem, ativa, opcoes } = await req.json();

  const questao = await prisma.questao.create({
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
