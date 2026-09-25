import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEdicaoAtiva } from "@/lib/edicao";
import { getCertificadoLayout, sanitizarLayout } from "@/lib/certificado-server";

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const edicao = await getEdicaoAtiva();
  const layout = await getCertificadoLayout(edicao.id);
  return NextResponse.json({ ...layout, edicao: edicao.nome });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const data = sanitizarLayout(await req.json());
  const edicao = await getEdicaoAtiva();

  await prisma.certificadoModelo.upsert({
    where: { edicaoId: edicao.id },
    update: data,
    create: { edicaoId: edicao.id, ...data },
    select: { id: true },
  });

  return NextResponse.json(await getCertificadoLayout(edicao.id));
}
