import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [totalSubmissoes, totalQuestoes, ultimasSubmissoes] = await Promise.all([
    prisma.submissao.count(),
    prisma.questao.count({ where: { ativa: true } }),
    prisma.submissao.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, nome: true, pontuacao: true, createdAt: true },
    }),
  ]);

  const mediaPontuacao = totalSubmissoes > 0
    ? (await prisma.submissao.aggregate({ _avg: { pontuacao: true } }))._avg.pontuacao ?? 0
    : 0;

  return (
    <div className="p-8">

      {/* Título */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-brand-text" style={{ fontFamily: 'var(--font-playfair)' }}>
          Dashboard
        </h1>
        <p className="text-sm text-brand-text/50 mt-1">Visão geral das provas e alunas</p>
      </div>

      {/* Cards de stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Provas enviadas" value={totalSubmissoes} icon="📋" />
        <StatCard label="Média de pontuação" value={mediaPontuacao.toFixed(1)} icon="⭐" />
        <StatCard label="Questões ativas" value={totalQuestoes} icon="✏️" />
      </div>

      {/* Tabela de últimas respostas */}
      <div className="bg-white rounded-2xl border border-brand-cream-dark overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-cream-dark flex items-center justify-between">
          <h2 className="font-semibold text-brand-text">Últimas respostas</h2>
          <span className="text-xs text-brand-text/40 bg-brand-cream px-2 py-1 rounded-full">
            últimas 5
          </span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-brand-cream/60">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-brand-text/50 uppercase tracking-wider">Nome</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-brand-text/50 uppercase tracking-wider">Pontuação</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-brand-text/50 uppercase tracking-wider">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-cream-dark">
            {ultimasSubmissoes.map((s: { id: string; nome: string; pontuacao: number; createdAt: Date }) => (
              <tr key={s.id} className="hover:bg-brand-cream/40 transition-colors">
                <td className="px-6 py-3.5 font-medium text-brand-text">{s.nome}</td>
                <td className="px-6 py-3.5">
                  <span className="inline-flex items-center gap-1 text-brand-gold font-semibold">
                    {s.pontuacao} pts
                  </span>
                </td>
                <td className="px-6 py-3.5 text-brand-text/40 text-xs">
                  {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
            {ultimasSubmissoes.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-brand-text/30">
                  Nenhuma resposta ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-2xl border border-brand-cream-dark px-6 py-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-brand-text/50">{label}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-brand-gold">{value}</p>
    </div>
  );
}
