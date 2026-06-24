import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const submissoes = await prisma.submissao.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      respostas: {
        include: { questao: true, opcao: true },
        orderBy: { questao: { ordem: "asc" } },
      },
    },
  });

  const questoes = await prisma.questao.findMany({
    where: { ativa: true },
    orderBy: { ordem: "asc" },
  });

  const headers = ["Nome", "WhatsApp", "Grupo", "Pontuação", "Data", ...questoes.map((q) => `Q${q.ordem}`)];

  const rows = submissoes.map((s) => {
    const respostaMap = Object.fromEntries(s.respostas.map((r) => [r.questaoId, r]));
    return [
      s.nome,
      s.whatsapp,
      s.grupo ?? "",
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
