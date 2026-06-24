import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { nome, whatsapp, grupoId, respostas } = await req.json();

    if (!nome?.trim() || !whatsapp?.trim() || !respostas) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Verifica se a prova está aberta
    const cfg = await prisma.configuracao.findUnique({ where: { chave: "prova_aberta" } });
    if (cfg?.valor === "false") {
      return NextResponse.json({ error: "A prova não está aceitando respostas no momento." }, { status: 403 });
    }

    // Valida o grupo se informado
    if (grupoId) {
      const grupoExiste = await prisma.grupo.findUnique({ where: { id: grupoId, ativo: true } });
      if (!grupoExiste) {
        return NextResponse.json({ error: "Grupo inválido." }, { status: 400 });
      }
    }

    const questoes = await prisma.questao.findMany({
      where: { ativa: true },
      include: { opcoes: true },
    });

    let pontuacao = 0;

    const submissao = await prisma.submissao.create({
      data: {
        nome: nome.trim(),
        whatsapp: whatsapp.trim(),
        grupoId: grupoId ?? null,
        respostas: {
          create: questoes.map((q) => {
            const resposta = respostas[q.id];
            let opcaoId: string | null = null;
            let textoLivre: string | null = null;

            if (q.tipo === "ABERTA") {
              textoLivre = typeof resposta === "string" ? resposta.trim() : null;
            } else {
              opcaoId = typeof resposta === "string" ? resposta : null;
              const opcaoCorreta = q.opcoes.find((o) => o.id === opcaoId && o.correta);
              if (opcaoCorreta) pontuacao += q.pontos;
            }

            return { questaoId: q.id, opcaoId, textoLivre };
          }),
        },
      },
    });

    await prisma.submissao.update({ where: { id: submissao.id }, data: { pontuacao } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
