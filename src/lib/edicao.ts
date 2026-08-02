import { prisma } from "@/lib/prisma";

export async function getEdicaoAtiva() {
  const edicao = await prisma.edicao.findFirst({ where: { ativa: true } });
  if (!edicao) throw new Error("Nenhuma edição ativa configurada.");
  return edicao;
}
