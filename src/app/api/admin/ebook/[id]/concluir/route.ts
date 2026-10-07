import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEbook } from "@/lib/ebook";

/** Confere se todas as partes chegaram e troca o ebook da edição pelo novo. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const arquivo = await prisma.ebookArquivo.findUnique({ where: { id } });
  if (!arquivo) return NextResponse.json({ error: "Upload não encontrado." }, { status: 404 });

  const partes = await prisma.ebookParte.count({ where: { arquivoId: id } });
  if (partes !== arquivo.totalPartes) {
    return NextResponse.json({ error: "O envio ficou incompleto. Tente novamente." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.ebookArquivo.update({ where: { id }, data: { completo: true } }),
    prisma.ebookArquivo.deleteMany({ where: { edicaoId: arquivo.edicaoId, id: { not: id } } }),
  ]);

  return NextResponse.json(await getEbook(arquivo.edicaoId));
}
