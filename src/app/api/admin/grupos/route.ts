import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function requireAdmin(role?: string) {
  return role === "ADMIN" || role === "EDITOR";
}

export async function GET() {
  const session = await getServerSession();
  if (!session || !requireAdmin(session.user?.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const grupos = await prisma.grupo.findMany({ orderBy: { numero: "asc" } });
  return NextResponse.json(grupos);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { numero, nome } = await req.json();

  if (!numero || !nome?.trim()) {
    return NextResponse.json({ error: "Número e nome são obrigatórios." }, { status: 400 });
  }

  const existe = await prisma.grupo.findUnique({ where: { numero: Number(numero) } });
  if (existe) return NextResponse.json({ error: "Número de grupo já existe." }, { status: 400 });

  const grupo = await prisma.grupo.create({
    data: { numero: Number(numero), nome: nome.trim(), ativo: true },
  });

  return NextResponse.json(grupo, { status: 201 });
}
