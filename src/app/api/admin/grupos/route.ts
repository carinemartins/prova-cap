import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function requireAdmin(session: Awaited<ReturnType<typeof auth>>) {
  const role = (session?.user as { role?: string })?.role;
  return session && (role === "ADMIN" || role === "EDITOR");
}

export async function GET() {
  const session = await auth();
  if (!requireAdmin(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const grupos = await prisma.grupo.findMany({ orderBy: { numero: "asc" } });
  return NextResponse.json(grupos);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "ADMIN") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

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
