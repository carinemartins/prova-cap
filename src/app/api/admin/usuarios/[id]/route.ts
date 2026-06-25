import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const { name, email, password, role: newRole, ativo } = await req.json();

  const data: Record<string, unknown> = { name, email, role: newRole, ativo };
  if (password) data.password = await bcrypt.hash(password, 12);

  const user = await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ id: user.id });
}
