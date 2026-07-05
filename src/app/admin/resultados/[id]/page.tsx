import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SubmissaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const submissao = await prisma.submissao.findUnique({
    where: { id },
    include: {
      grupo: true,
      respostas: {
        include: {
          questao: { include: { opcoes: true } },
          opcao: true,
        },
        orderBy: { questao: { ordem: "asc" } },
      },
    },
  });

  if (!submissao) notFound();

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/admin/resultados" className="text-sm text-brand-gold hover:text-brand-gold-dark hover:underline font-medium mb-4 block">
        ← Voltar
      </Link>

      <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6 mb-6">
        <h1 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>{submissao.nome}</h1>
        <p className="text-sm text-white/40 mt-1">WhatsApp: {submissao.whatsapp}</p>
        <p className="text-sm text-white/40">Grupo: {submissao.grupo ? `#${submissao.grupo.numero} — ${submissao.grupo.nome}` : "—"}</p>
        <p className="text-sm text-white/40">
          Enviado em: {new Date(submissao.createdAt).toLocaleString("pt-BR")}
        </p>
        <p className="text-2xl font-bold text-brand-gold mt-3">
          {submissao.pontuacao} pontos
        </p>
      </div>

      <div className="space-y-4">
        {submissao.respostas.map((r) => {
          const acertou = r.opcao?.correta ?? null;
          return (
            <div key={r.id} className="bg-white/[0.03] rounded-2xl border border-white/10 p-5">
              <p className="text-sm font-medium text-white/90 mb-2">
                {r.questao.ordem}. {r.questao.texto}
              </p>

              {r.textoLivre ? (
                <p className="text-sm text-white/60 bg-white/5 rounded-xl px-3 py-2">{r.textoLivre}</p>
              ) : (
                <div>
                  <p className={`text-sm font-medium ${acertou ? "text-green-400" : "text-brand-rose"}`}>
                    {acertou ? "✓ Acertou" : "✗ Errou"} — {r.opcao?.texto ?? "Sem resposta"}
                  </p>
                  {!acertou && (
                    <p className="text-xs text-white/35 mt-1">
                      Correta: {r.questao.opcoes.find((o) => o.correta)?.texto}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
