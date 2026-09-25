import { prisma } from "@/lib/prisma";
import { FONTES, IMAGEM_PADRAO, LAYOUT_PADRAO, type Alinhamento, type CertificadoLayout } from "@/lib/certificado";

/** Layout do certificado da edição (sem os bytes da imagem). */
export async function getCertificadoLayout(edicaoId: string): Promise<CertificadoLayout> {
  const modelo = await prisma.certificadoModelo.findUnique({
    where: { edicaoId },
    omit: { imagem: true },
  });
  if (!modelo) return LAYOUT_PADRAO;

  const imagemUrl = modelo.imagemTipo
    ? `/api/certificado/imagem?v=${modelo.updatedAt.getTime()}`
    : IMAGEM_PADRAO;

  return {
    ativo: modelo.ativo,
    imagemUrl,
    nomeX: modelo.nomeX,
    nomeY: modelo.nomeY,
    fonteTamanho: modelo.fonteTamanho,
    fonte: modelo.fonte,
    cor: modelo.cor,
    alinhamento: modelo.alinhamento as Alinhamento,
  };
}

const clamp = (n: unknown, min: number, max: number, padrao: number) => {
  const v = Number(n);
  return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : padrao;
};

/** Valida o corpo enviado pelo editor do admin. */
export function sanitizarLayout(body: Record<string, unknown>) {
  const p = LAYOUT_PADRAO;
  return {
    ativo: body.ativo !== false,
    nomeX: clamp(body.nomeX, 0, 100, p.nomeX),
    nomeY: clamp(body.nomeY, 0, 100, p.nomeY),
    fonteTamanho: clamp(body.fonteTamanho, 0.5, 20, p.fonteTamanho),
    fonte: (FONTES as readonly string[]).includes(String(body.fonte)) ? String(body.fonte) : p.fonte,
    cor: /^#[0-9a-fA-F]{6}$/.test(String(body.cor)) ? String(body.cor) : p.cor,
    alinhamento: (["left", "center", "right"].includes(String(body.alinhamento))
      ? body.alinhamento
      : p.alinhamento) as Alinhamento,
  };
}
