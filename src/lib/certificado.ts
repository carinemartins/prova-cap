// Tipos e renderização do certificado — seguro para usar no cliente.
import type { CSSProperties } from "react";

export type Alinhamento = "left" | "center" | "right";

export type CertificadoLayout = {
  ativo: boolean;
  imagemUrl: string;
  nomeX: number;        // % da largura da imagem
  nomeY: number;        // % da altura da imagem (centro vertical do texto)
  fonteTamanho: number; // % da largura da imagem
  fonte: string;
  cor: string;
  alinhamento: Alinhamento;
};

export const IMAGEM_PADRAO = "/certificado-fundo.png";

export const FONTES = [
  "Dancing Script",
  "Great Vibes",
  "Alex Brush",
  "Parisienne",
  "Pinyon Script",
  "Playfair Display",
] as const;

export const LAYOUT_PADRAO: CertificadoLayout = {
  ativo: true,
  imagemUrl: IMAGEM_PADRAO,
  nomeX: 12,
  nomeY: 32.4,
  fonteTamanho: 3.4,
  fonte: "Dancing Script",
  cor: "#1a1208",
  alinhamento: "left",
};

const TRANSLATE_X: Record<Alinhamento, string> = { left: "0", center: "-50%", right: "-100%" };

/** Estilo do nome sobre a prévia. O container precisa de `container-type: inline-size`. */
export function estiloNome(l: CertificadoLayout): CSSProperties {
  return {
    position: "absolute",
    left: `${l.nomeX}%`,
    top: `${l.nomeY}%`,
    transform: `translate(${TRANSLATE_X[l.alinhamento]}, -50%)`,
    fontFamily: `"${l.fonte}", cursive`,
    fontSize: `${l.fonteTamanho}cqw`,
    fontWeight: 700,
    lineHeight: 1,
    color: l.cor,
    whiteSpace: "nowrap",
  };
}

/** Injeta o CSS do Google Fonts com todas as fontes disponíveis (uma vez). */
export function carregarFontes() {
  const id = "certificado-fontes";
  if (document.getElementById(id)) return;
  const familias = FONTES.map((f) => `family=${f.replace(/ /g, "+")}:wght@400;700`).join("&");
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?${familias}&display=swap`;
  document.head.appendChild(link);
}

/** Desenha o certificado em alta resolução e retorna o PNG. */
export async function gerarCertificadoPng(l: CertificadoLayout, nome: string): Promise<Blob> {
  const img = new Image();
  img.src = l.imagemUrl;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Imagem do certificado não encontrada."));
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const fontSize = Math.round(canvas.width * (l.fonteTamanho / 100));
  const font = `bold ${fontSize}px "${l.fonte}"`;
  await document.fonts.load(font, nome);
  ctx.font = `${font}, cursive`;
  ctx.fillStyle = l.cor;
  ctx.textAlign = l.alinhamento;
  ctx.textBaseline = "middle";
  ctx.fillText(nome, canvas.width * (l.nomeX / 100), canvas.height * (l.nomeY / 100));

  return new Promise<Blob>((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("Falha ao gerar imagem."))), "image/png"),
  );
}
