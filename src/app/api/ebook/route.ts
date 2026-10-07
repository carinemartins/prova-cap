import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { streamEbook } from "@/lib/ebook";

// Download público do ebook — exige o id de uma submissão, ou seja,
// só quem respondeu a pesquisa recebe o link. A resposta é em streaming,
// o que libera o limite de 4,5 MB da Vercel.
export async function GET(req: NextRequest) {
  const submissaoId = req.nextUrl.searchParams.get("s");
  if (!submissaoId) return NextResponse.json({ error: "Link inválido." }, { status: 400 });

  const submissao = await prisma.submissao.findUnique({ where: { id: submissaoId }, select: { edicaoId: true } });
  if (!submissao) return NextResponse.json({ error: "Link inválido." }, { status: 404 });

  const arquivo = await prisma.ebookArquivo.findFirst({
    where: { edicaoId: submissao.edicaoId, completo: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, nome: true, totalPartes: true },
  });
  if (!arquivo) return NextResponse.json({ error: "Ebook indisponível." }, { status: 404 });

  const nomeAscii = arquivo.nome.normalize("NFD").replace(/[^\x20-\x7e]/g, "").replace(/"/g, "");

  return new Response(streamEbook(arquivo.id, arquivo.totalPartes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nomeAscii || "ebook.pdf"}"; filename*=UTF-8''${encodeURIComponent(arquivo.nome)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
