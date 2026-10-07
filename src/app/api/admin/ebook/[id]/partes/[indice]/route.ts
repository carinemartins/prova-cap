import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TAMANHO_PARTE } from "@/lib/ebook";

// Recebe uma parte do PDF como corpo binário (application/octet-stream).
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; indice: string }> }) {
  const session = await getServerSession();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id, indice: indiceParam } = await params;
  const indice = Number(indiceParam);

  const arquivo = await prisma.ebookArquivo.findUnique({ where: { id }, select: { totalPartes: true, completo: true } });
  if (!arquivo || arquivo.completo) {
    return NextResponse.json({ error: "Upload não encontrado." }, { status: 404 });
  }
  if (!Number.isInteger(indice) || indice < 0 || indice >= arquivo.totalPartes) {
    return NextResponse.json({ error: "Parte inválida." }, { status: 400 });
  }

  const dados = new Uint8Array(await req.arrayBuffer());
  if (dados.length === 0 || dados.length > TAMANHO_PARTE) {
    return NextResponse.json({ error: "Tamanho da parte inválido." }, { status: 400 });
  }
  if (indice === 0 && new TextDecoder().decode(dados.subarray(0, 5)) !== "%PDF-") {
    return NextResponse.json({ error: "O arquivo não é um PDF válido." }, { status: 400 });
  }

  await prisma.ebookParte.upsert({
    where: { arquivoId_indice: { arquivoId: id, indice } },
    update: { dados },
    create: { arquivoId: id, indice, dados },
    select: { id: true },
  });

  return NextResponse.json({ ok: true });
}
