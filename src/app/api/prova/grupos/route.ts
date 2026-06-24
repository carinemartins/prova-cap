import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const grupos = await prisma.grupo.findMany({
    where: { ativo: true },
    orderBy: { numero: "asc" },
    select: { id: true, numero: true, nome: true },
  });
  return NextResponse.json(grupos);
}
