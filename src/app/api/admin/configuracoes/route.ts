import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const configs = await prisma.configuracao.findMany();
  const map = Object.fromEntries(configs.map((c) => [c.chave, c.valor]));
  return NextResponse.json(map);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body: Record<string, string> = await req.json();

  const allowed = ["prova_titulo", "prova_descricao", "prova_mensagem_sucesso", "prova_aberta"];

  for (const chave of allowed) {
    if (chave in body) {
      await prisma.configuracao.upsert({
        where: { chave },
        update: { valor: String(body[chave]) },
        create: { chave, valor: String(body[chave]) },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
