import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEdicaoAtiva } from "@/lib/edicao";
import { getEbook } from "@/lib/ebook";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    // respostas: { [questaoId]: opcaoId | opcaoId[] (múltipla seleção) | texto (aberta) }
    // outros:    { [questaoId]: texto digitado na opção "Outro" }
    const { nome, whatsapp, email, grupoId, respostas, outros = {} } = await req.json();

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

    const emailLimpo = typeof email === "string" ? email.trim() : "";
    if (pesquisa && !EMAIL_RE.test(emailLimpo)) {
      return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
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
    const linhas: { questaoId: string; opcaoId: string | null; textoLivre: string | null }[] = [];

    for (const q of questoes) {
      const resposta = respostas[q.id];
      const outro = typeof outros[q.id] === "string" ? outros[q.id].trim() : "";

      if (q.tipo === "ABERTA") {
        linhas.push({ questaoId: q.id, opcaoId: null, textoLivre: typeof resposta === "string" ? resposta.trim() : null });
        continue;
      }

      // Só aceita opções que pertencem à questão
      const marcadas = (Array.isArray(resposta) ? resposta : [resposta])
        .map((id) => q.opcoes.find((o) => o.id === id))
        .filter((o) => o !== undefined)
        .slice(0, q.tipo === "MULTIPLA_SELECAO" ? undefined : 1);

      if (marcadas.length === 0) {
        linhas.push({ questaoId: q.id, opcaoId: null, textoLivre: null });
        continue;
      }

      for (const o of new Set(marcadas)) {
        linhas.push({ questaoId: q.id, opcaoId: o.id, textoLivre: o.permiteTexto && outro ? outro : null });
      }

      if (!pesquisa && q.tipo !== "MULTIPLA_SELECAO" && marcadas[0].correta) pontuacao += q.pontos;
    }

    const submissao = await prisma.submissao.create({
      data: {
        edicaoId: edicao.id,
        nome: nome.trim(),
        whatsapp: whatsapp.trim(),
        email: emailLimpo || null,
        grupoId: grupoId ?? null,
        pontuacao,
        respostas: { create: linhas },
      },
    });

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
