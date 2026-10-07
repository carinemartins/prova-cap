import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEdicaoAtiva } from "@/lib/edicao";

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const edicao = await getEdicaoAtiva();
  const configs = await prisma.configuracao.findMany({ where: { edicaoId: edicao.id } });
  const map = Object.fromEntries(configs.map((c) => [c.chave, c.valor]));
  return NextResponse.json(map);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body: Record<string, string> = await req.json();
  const edicao = await getEdicaoAtiva();

  const allowed = [
    "prova_titulo", "prova_descricao", "prova_mensagem_sucesso", "prova_aberta",
    "modo", "ebook_titulo", "ebook_url",
  ];

  if ("modo" in body && body.modo !== "prova" && body.modo !== "pesquisa") {
    return NextResponse.json({ error: "Modo inválido." }, { status: 400 });
  }
  const ebookUrl = String(body.ebook_url ?? "").trim();
  if (ebookUrl && !/^https?:\/\//i.test(ebookUrl)) {
    return NextResponse.json({ error: "O link do ebook deve começar com http:// ou https://" }, { status: 400 });
  }
  if (body.modo === "pesquisa" && !ebookUrl) {
    return NextResponse.json({ error: "Informe o link do ebook para o modo pesquisa." }, { status: 400 });
  }

  for (const chave of allowed) {
    if (chave in body) {
      await prisma.configuracao.upsert({
        where: { edicaoId_chave: { edicaoId: edicao.id, chave } },
        update: { valor: String(body[chave]) },
        create: { edicaoId: edicao.id, chave, valor: String(body[chave]) },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
