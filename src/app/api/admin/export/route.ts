import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  const headers = ["Nome", "WhatsApp", "Grupo", "Pontuação", "Data", ...questoes.map((q) => `Q${q.ordem}`)];

  const rows = submissoes.map((s) => {
    const respostaMap = Object.fromEntries(s.respostas.map((r) => [r.questaoId, r]));
    return [
      s.nome,
      s.whatsapp,
      s.grupo ? `#${s.grupo.numero} ${s.grupo.nome}` : "",
      s.pontuacao,
      new Date(s.createdAt).toLocaleString("pt-BR"),
      ...questoes.map((q) => {
        const r = respostaMap[q.id];
        if (!r) return "";
        return r.textoLivre ?? r.opcao?.texto ?? "";
      }),
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
