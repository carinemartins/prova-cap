import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEdicaoAtiva } from "@/lib/edicao";
import { getCertificadoLayout } from "@/lib/certificado-server";

// A Vercel limita o corpo da requisição a 4,5 MB; o editor comprime antes de enviar.
const TAMANHO_MAXIMO = 4 * 1024 * 1024;
const TIPOS = ["image/png", "image/jpeg", "image/webp"];

async function exigirAdmin() {
  const session = await getServerSession();
  return session?.user?.role === "ADMIN";
}

export async function POST(req: NextRequest) {
  if (!(await exigirAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const form = await req.formData();
  const arquivo = form.get("imagem");
  if (!(arquivo instanceof File)) {
    return NextResponse.json({ error: "Envie uma imagem." }, { status: 400 });
  }
  if (!TIPOS.includes(arquivo.type)) {
    return NextResponse.json({ error: "Formato inválido. Use PNG, JPG ou WEBP." }, { status: 400 });
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    return NextResponse.json({ error: "Imagem muito grande (máx. 4 MB)." }, { status: 400 });
  }

  const imagem = new Uint8Array(await arquivo.arrayBuffer());
  const edicao = await getEdicaoAtiva();

  await prisma.certificadoModelo.upsert({
    where: { edicaoId: edicao.id },
    update: { imagem, imagemTipo: arquivo.type },
    create: { edicaoId: edicao.id, imagem, imagemTipo: arquivo.type },
    select: { id: true },
  });

  return NextResponse.json(await getCertificadoLayout(edicao.id));
}

/** Volta para a imagem padrão (public/certificado-fundo.png). */
export async function DELETE() {
  if (!(await exigirAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const edicao = await getEdicaoAtiva();
  await prisma.certificadoModelo.updateMany({
    where: { edicaoId: edicao.id },
    data: { imagem: null, imagemTipo: null },
  });

  return NextResponse.json(await getCertificadoLayout(edicao.id));
}
