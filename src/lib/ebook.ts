import { prisma } from "@/lib/prisma";

// Cada parte vai numa requisição separada; a Vercel limita o corpo a 4,5 MB.
export const TAMANHO_PARTE = 3 * 1024 * 1024;
export const TAMANHO_MAXIMO = 100 * 1024 * 1024;

export type EbookInfo = { id: string; nome: string; tamanho: number; createdAt: Date };

/** Ebook pronto (upload concluído) da edição, sem os bytes. */
export async function getEbook(edicaoId: string): Promise<EbookInfo | null> {
  return prisma.ebookArquivo.findFirst({
    where: { edicaoId, completo: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, nome: true, tamanho: true, createdAt: true },
  });
}

/** Lê as partes uma a uma do banco, sem carregar o PDF inteiro na memória. */
export function streamEbook(arquivoId: string, totalPartes: number): ReadableStream<Uint8Array> {
  let indice = 0;
  return new ReadableStream({
    async pull(controller) {
      if (indice >= totalPartes) { controller.close(); return; }
      const parte = await prisma.ebookParte.findUnique({
        where: { arquivoId_indice: { arquivoId, indice } },
        select: { dados: true },
      });
      if (!parte) { controller.error(new Error(`Parte ${indice} do ebook não encontrada.`)); return; }
      controller.enqueue(new Uint8Array(parte.dados));
      indice++;
    },
  });
}
