import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ResultadosPage() {
  const [questoes, submissoes] = await Promise.all([
    prisma.questao.findMany({
      where: { ativa: true, tipo: { not: "ABERTA" } },
      orderBy: { ordem: "asc" },
      include: {
        opcoes: true,
        respostas: { include: { opcao: true } },
      },
    }),
    prisma.submissao.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        grupo: true,
        respostas: { include: { questao: true, opcao: true } },
      },
    }),
  ]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-text" style={{ fontFamily: 'var(--font-playfair)' }}>Resultados</h1>
          <p className="text-sm text-brand-text/50 mt-1">{submissoes.length} submissão(ões)</p>
        </div>
        <a
          href="/api/admin/export"
          className="text-sm bg-brand-dark text-white font-medium px-4 py-2.5 rounded-xl hover:bg-brand-dark-mid transition-colors"
        >
          Exportar CSV
        </a>
      </div>

      {/* Análise por questão */}
      <section>
        <h2 className="text-base font-semibold text-brand-text mb-4">Análise por questão</h2>
        <div className="space-y-4">
          {questoes.map((q) => {
            const total = q.respostas.length;
            return (
              <div key={q.id} className="bg-white rounded-2xl border border-brand-cream-dark p-5">
                <p className="text-sm font-medium text-brand-text mb-3">
                  <span className="text-brand-gold font-bold mr-1.5">{q.ordem}.</span>
                  {q.texto}
                </p>
                <div className="space-y-2.5">
                  {q.opcoes.map((op) => {
                    const count = q.respostas.filter((r) => r.opcaoId === op.id).length;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={op.id}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className={op.correta ? "text-brand-gold font-semibold" : "text-brand-text/60"}>
                            {op.correta ? "✓ " : "○ "}{op.texto}
                          </span>
                          <span className="text-brand-text/40">{count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-brand-cream-dark rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${op.correta ? "bg-brand-gold" : "bg-brand-rose/50"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-brand-text/30 mt-3">{total} respostas</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Lista de submissões */}
      <section>
        <h2 className="text-base font-semibold text-brand-text mb-4">Todas as submissões</h2>
        <div className="bg-white rounded-2xl border border-brand-cream-dark overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-cream/60">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-text/50 uppercase tracking-wider">Nome</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-text/50 uppercase tracking-wider">WhatsApp</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-text/50 uppercase tracking-wider">Grupo</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-text/50 uppercase tracking-wider">Pontuação</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-text/50 uppercase tracking-wider">Data</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-cream-dark">
              {submissoes.map((s) => (
                <tr key={s.id} className="hover:bg-brand-cream/40 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-brand-text">{s.nome}</td>
                  <td className="px-5 py-3.5 text-brand-text/60">{s.whatsapp}</td>
                  <td className="px-5 py-3.5 text-brand-text/60">{s.grupo ? `#${s.grupo.numero} ${s.grupo.nome}` : "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-brand-gold">{s.pontuacao} pts</span>
                  </td>
                  <td className="px-5 py-3.5 text-brand-text/40 text-xs">
                    {new Date(s.createdAt).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/resultados/${s.id}`} className="text-xs text-brand-gold hover:underline font-medium">
                      Ver detalhes
                    </Link>
                  </td>
                </tr>
              ))}
              {submissoes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-brand-text/30">
                    Nenhuma submissão ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
