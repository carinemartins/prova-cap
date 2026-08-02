import { prisma } from "@/lib/prisma";
import { getEdicaoAtiva } from "@/lib/edicao";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function QuestoesPage() {
  const edicao = await getEdicaoAtiva();
  const questoes = await prisma.questao.findMany({
    where: { edicaoId: edicao.id },
    orderBy: { ordem: "asc" },
    include: { opcoes: { orderBy: { ordem: "asc" } } },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>Questões</h1>
          <p className="text-sm text-white/40 mt-1">{questoes.length} questão(ões) cadastrada(s)</p>
        </div>
        <Link
          href="/admin/questoes/nova"
          className="bg-brand-gold hover:bg-brand-gold-dark text-brand-dark text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          + Nova questão
        </Link>
      </div>

      <div className="space-y-3">
        {questoes.map((q) => (
          <div
            key={q.id}
            className={`bg-white/[0.03] rounded-2xl border p-5 flex items-start gap-4 transition-opacity ${
              q.ativa ? "border-white/10" : "border-white/10 opacity-50"
            }`}
          >
            <span className="text-sm font-bold text-brand-gold w-6 shrink-0">{q.ordem}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/90 mb-2 line-clamp-2">{q.texto}</p>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs bg-brand-gold/15 text-brand-gold rounded-full px-2.5 py-0.5 font-medium">
                  {q.tipo === "MULTIPLA_ESCOLHA" ? "Múltipla escolha" : q.tipo === "VERDADEIRO_FALSO" ? "V/F" : "Aberta"}
                </span>
                <span className="text-xs bg-white/8 text-white/55 rounded-full px-2.5 py-0.5">
                  {q.pontos} {q.pontos === 1 ? "ponto" : "pontos"}
                </span>
                {!q.ativa && (
                  <span className="text-xs bg-brand-rose/10 text-brand-rose rounded-full px-2.5 py-0.5">Inativa</span>
                )}
              </div>
              {q.opcoes.length > 0 && (
                <ul className="mt-2.5 space-y-1">
                  {q.opcoes.map((op) => (
                    <li key={op.id} className={`text-xs flex gap-1.5 items-center ${op.correta ? "text-brand-gold font-medium" : "text-white/35"}`}>
                      <span>{op.correta ? "✓" : "○"}</span>
                      {op.texto}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="shrink-0">
              <Link
                href={`/admin/questoes/${q.id}`}
                className="text-xs text-brand-gold hover:text-brand-gold-dark font-medium hover:underline"
              >
                Editar
              </Link>
            </div>
          </div>
        ))}
        {questoes.length === 0 && (
          <div className="text-center py-20 text-white/25 bg-white/[0.03] rounded-2xl border border-white/10">
            Nenhuma questão cadastrada ainda.
          </div>
        )}
      </div>
    </div>
  );
}
