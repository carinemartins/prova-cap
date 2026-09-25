import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEdicaoAtiva } from "@/lib/edicao";
import { IMAGEM_PADRAO } from "@/lib/certificado";

// Imagem de fundo do certificado da edição ativa (pública — a aluna precisa dela).
// A URL leva ?v=<updatedAt>, então pode ficar em cache por bastante tempo.
export async function GET(req: Request) {
  const edicao = await getEdicaoAtiva();
  const modelo = await prisma.certificadoModelo.findUnique({
    where: { edicaoId: edicao.id },
    select: { imagem: true, imagemTipo: true },
  });

  if (!modelo?.imagem || !modelo.imagemTipo) {
    return NextResponse.redirect(new URL(IMAGEM_PADRAO, req.url));
  }

  return new Response(Buffer.from(modelo.imagem), {
    headers: {
      "Content-Type": modelo.imagemTipo,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
