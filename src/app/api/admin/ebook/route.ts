import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEdicaoAtiva } from "@/lib/edicao";
import { getEbook, TAMANHO_MAXIMO, TAMANHO_PARTE } from "@/lib/ebook";

async function exigirAdmin() {
  const session = await getServerSession();
  return session?.user?.role === "ADMIN";
}

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const edicao = await getEdicaoAtiva();
  return NextResponse.json(await getEbook(edicao.id));
}

/** Inicia o upload: o navegador depois envia as partes e chama /concluir. */
export async function POST(req: NextRequest) {
  if (!(await exigirAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { nome, tamanho } = await req.json();
  if (typeof nome !== "string" || !/\.pdf$/i.test(nome.trim())) {
    return NextResponse.json({ error: "Envie um arquivo PDF." }, { status: 400 });
  }
  if (!Number.isInteger(tamanho) || tamanho <= 0) {
    return NextResponse.json({ error: "Arquivo vazio." }, { status: 400 });
  }
  if (tamanho > TAMANHO_MAXIMO) {
    return NextResponse.json({ error: "PDF muito grande (máx. 100 MB)." }, { status: 400 });
  }

  const edicao = await getEdicaoAtiva();

  // Descarta uploads anteriores que não foram concluídos
  await prisma.ebookArquivo.deleteMany({ where: { edicaoId: edicao.id, completo: false } });

  const arquivo = await prisma.ebookArquivo.create({
    data: {
      edicaoId: edicao.id,
      nome: nome.trim(),
      tamanho,
      totalPartes: Math.ceil(tamanho / TAMANHO_PARTE),
    },
    select: { id: true, totalPartes: true },
  });

  return NextResponse.json({ ...arquivo, tamanhoParte: TAMANHO_PARTE }, { status: 201 });
}

export async function DELETE() {
  if (!(await exigirAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const edicao = await getEdicaoAtiva();
  await prisma.ebookArquivo.deleteMany({ where: { edicaoId: edicao.id } });
  return NextResponse.json({ ok: true });
}
