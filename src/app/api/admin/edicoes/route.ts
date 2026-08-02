import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function requireAdmin(role?: string) {
  return role === "ADMIN" || role === "EDITOR";
}

export async function GET() {
  const session = await getServerSession();
  if (!session || !requireAdmin(session.user?.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const edicoes = await prisma.edicao.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(edicoes);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { nome } = await req.json();
  if (!nome?.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
  }

  const existe = await prisma.edicao.findUnique({ where: { nome: nome.trim() } });
  if (existe) return NextResponse.json({ error: "Já existe uma edição com esse nome." }, { status: 400 });

  const anterior = await prisma.edicao.findFirst({ where: { ativa: true } });

  // Clona grupos, questões (com opções) e configurações da edição ativa atual
  const novaEdicao = await prisma.$transaction(async (tx) => {
    const nova = await tx.edicao.create({ data: { nome: nome.trim(), ativa: false } });

    if (anterior) {
      const [grupos, questoes, configuracoes] = await Promise.all([
        tx.grupo.findMany({ where: { edicaoId: anterior.id } }),
        tx.questao.findMany({ where: { edicaoId: anterior.id }, include: { opcoes: true } }),
        tx.configuracao.findMany({ where: { edicaoId: anterior.id } }),
      ]);

      for (const g of grupos) {
        await tx.grupo.create({
          data: { edicaoId: nova.id, numero: g.numero, nome: g.nome, ativo: g.ativo },
        });
      }

      for (const q of questoes) {
        await tx.questao.create({
          data: {
            edicaoId: nova.id,
            texto: q.texto,
            tipo: q.tipo,
            pontos: q.pontos,
            ordem: q.ordem,
            ativa: q.ativa,
            opcoes: {
              create: q.opcoes.map((o) => ({ texto: o.texto, correta: o.correta, ordem: o.ordem })),
            },
          },
        });
      }

      for (const c of configuracoes) {
        await tx.configuracao.create({
          data: { edicaoId: nova.id, chave: c.chave, valor: c.valor },
        });
      }
    }

    return nova;
  });

  return NextResponse.json(novaEdicao, { status: 201 });
}
