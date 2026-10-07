import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEdicaoAtiva } from "@/lib/edicao";
import { getEbook } from "@/lib/ebook";

export async function POST(req: NextRequest) {
  try {
    const { nome, whatsapp, grupoId, respostas } = await req.json();

    if (!nome?.trim() || !whatsapp?.trim() || !respostas) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const edicao = await getEdicaoAtiva();

    const cfgs = Object.fromEntries(
      (await prisma.configuracao.findMany({
        where: { edicaoId: edicao.id, chave: { in: ["prova_aberta", "modo", "ebook_titulo"] } },
      })).map((c) => [c.chave, c.valor])
    );
    const pesquisa = cfgs.modo === "pesquisa";

    // Verifica se a prova/pesquisa está aberta
    if (cfgs.prova_aberta === "false") {
      const msg = pesquisa ? "A pesquisa não está aceitando respostas no momento." : "A prova não está aceitando respostas no momento.";
      return NextResponse.json({ error: msg }, { status: 403 });
    }

    // Valida o grupo se informado
    if (grupoId) {
      const grupoExiste = await prisma.grupo.findUnique({
        where: { id: grupoId, edicaoId: edicao.id, ativo: true },
      });
      if (!grupoExiste) {
        return NextResponse.json({ error: "Grupo inválido." }, { status: 400 });
      }
    }

    const questoes = await prisma.questao.findMany({
      where: { edicaoId: edicao.id, ativa: true },
      include: { opcoes: true },
    });

    let pontuacao = 0;

    const submissao = await prisma.submissao.create({
      data: {
        edicaoId: edicao.id,
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
              if (opcaoCorreta && !pesquisa) pontuacao += q.pontos;
            }

            return { questaoId: q.id, opcaoId, textoLivre };
          }),
        },
      },
    });

    await prisma.submissao.update({ where: { id: submissao.id }, data: { pontuacao } });

    // Na pesquisa, o link do ebook só existe depois do envio (leva o id da submissão)
    const ebook = pesquisa && (await getEbook(edicao.id))
      ? { url: `/api/ebook?s=${submissao.id}`, titulo: cfgs.ebook_titulo || null }
      : null;

    return NextResponse.json({ ok: true, submissaoId: submissao.id, pontuacao, ebook });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
