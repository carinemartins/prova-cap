import { prisma } from "@/lib/prisma";

export async function getEdicaoAtiva() {
  const edicao = await prisma.edicao.findFirst({ where: { ativa: true } });
  if (!edicao) throw new Error("Nenhuma edição ativa configurada.");
  return edicao;
}

/** "prova" (com pontuação e certificado) ou "pesquisa" (sem nota, entrega um ebook no final). */
export type Modo = "prova" | "pesquisa";

export async function getModo(edicaoId: string): Promise<Modo> {
  const cfg = await prisma.configuracao.findUnique({
    where: { edicaoId_chave: { edicaoId, chave: "modo" } },
  });
  return cfg?.valor === "pesquisa" ? "pesquisa" : "prova";
}
