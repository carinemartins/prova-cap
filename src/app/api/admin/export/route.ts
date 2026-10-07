import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getModo } from "@/lib/edicao";
import { getEdicaoAtiva } from "@/lib/edicao";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const edicaoIdParam = req.nextUrl.searchParams.get("edicaoId");
  const edicaoId = edicaoIdParam ?? (await getEdicaoAtiva()).id;

  const submissoes = await prisma.submissao.findMany({
    where: { edicaoId },
    orderBy: { createdAt: "asc" },
    include: {
      grupo: true,
      respostas: {
        include: { questao: true, opcao: true },
        orderBy: { questao: { ordem: "asc" } },
      },
    },
  });

  const questoes = await prisma.questao.findMany({
    where: { edicaoId, ativa: true },
    orderBy: { ordem: "asc" },
  });

  const pesquisa = (await getModo(edicaoId)) === "pesquisa";
  const headers = [
    "Nome", "WhatsApp",
    ...(pesquisa ? ["E-mail"] : ["Grupo", "Pontuação"]),
    "Data",
    // Na pesquisa o cabeçalho leva a pergunta inteira, para ler a planilha sem consultar o sistema
    ...questoes.map((q) => (pesquisa ? q.texto.replace(/\s+/g, " ").trim() : `Q${q.ordem}`)),
  ];

  const rows = submissoes.map((s) => {
    return [
      s.nome,
      s.whatsapp,
      ...(pesquisa
        ? [s.email ?? ""]
        : [s.grupo ? `#${s.grupo.numero} ${s.grupo.nome}` : "", s.pontuacao]),
      new Date(s.createdAt).toLocaleString("pt-BR"),
      ...questoes.map((q) =>
        // "Marcar várias" gera uma linha por opção; ficam juntas na mesma célula
        s.respostas
          .filter((r) => r.questaoId === q.id)
          .map((r) => (r.opcao ? (r.textoLivre ? `${r.opcao.texto}: ${r.textoLivre}` : r.opcao.texto) : r.textoLivre ?? ""))
          .filter(Boolean)
          .join("; ")
      ),
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`);
  });

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="resultados-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
