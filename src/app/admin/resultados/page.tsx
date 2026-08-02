import { prisma } from "@/lib/prisma";
import { getEdicaoAtiva } from "@/lib/edicao";
import Link from "next/link";
import EdicaoSelect from "@/components/EdicaoSelect";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function ResultadosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; edicaoId?: string }>;
}) {
  const { page: pageParam, edicaoId: edicaoIdParam } = await searchParams;

  const [edicoes, edicaoAtiva] = await Promise.all([
    prisma.edicao.findMany({ orderBy: { createdAt: "desc" } }),
    getEdicaoAtiva(),
  ]);
  const edicaoId = edicaoIdParam && edicoes.some((e) => e.id === edicaoIdParam) ? edicaoIdParam : edicaoAtiva.id;

  const totalSubmissoes = await prisma.submissao.count({ where: { edicaoId } });
  const totalPages = Math.max(1, Math.ceil(totalSubmissoes / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);

  const [questoes, submissoes] = await Promise.all([
    prisma.questao.findMany({
      where: { edicaoId, ativa: true, tipo: { not: "ABERTA" } },
      orderBy: { ordem: "asc" },
      include: {
        opcoes: true,
        respostas: { include: { opcao: true } },
      },
    }),
    prisma.submissao.findMany({
      where: { edicaoId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
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
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>Resultados</h1>
          <p className="text-sm text-white/40 mt-1">{totalSubmissoes} submissão(ões)</p>
        </div>
        <div className="flex items-center gap-3">
          <EdicaoSelect edicoes={edicoes} selecionada={edicaoId} />
          <a
            href={`/api/admin/export?edicaoId=${edicaoId}`}
            className="text-sm bg-brand-gold text-brand-dark font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-gold-dark transition-colors whitespace-nowrap"
          >
            Exportar CSV
          </a>
        </div>
      </div>

      {/* Análise por questão */}
      <section>
        <h2 className="text-base font-semibold text-white mb-4">Análise por questão</h2>
        <div className="space-y-4">
          {questoes.map((q) => {
            const total = q.respostas.length;
            return (
              <div key={q.id} className="bg-white/[0.03] rounded-2xl border border-white/10 p-5">
                <p className="text-sm font-medium text-white/90 mb-3">
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
                          <span className={op.correta ? "text-brand-gold font-semibold" : "text-white/55"}>
                            {op.correta ? "✓ " : "○ "}{op.texto}
                          </span>
                          <span className="text-white/35">{count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${op.correta ? "bg-brand-gold" : "bg-brand-rose/50"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-white/25 mt-3">{total} respostas</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Lista de submissões */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Todas as submissões</h2>
          {totalSubmissoes > 0 && (
            <p className="text-xs text-white/35">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalSubmissoes)} de {totalSubmissoes}
            </p>
          )}
        </div>
        <div className="bg-white/[0.03] rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">Nome</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">WhatsApp</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">Grupo</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">Pontuação</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">Data</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {submissoes.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-5 py-3.5 font-medium text-white/90">{s.nome}</td>
                  <td className="px-5 py-3.5 text-white/55">{s.whatsapp}</td>
                  <td className="px-5 py-3.5 text-white/55">{s.grupo ? `#${s.grupo.numero} ${s.grupo.nome}` : "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-brand-gold">{s.pontuacao} pts</span>
                  </td>
                  <td className="px-5 py-3.5 text-white/35 text-xs">
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
                  <td colSpan={6} className="px-5 py-12 text-center text-white/25">
                    Nenhuma submissão ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && <Paginacao page={page} totalPages={totalPages} edicaoId={edicaoId} />}
      </section>
    </div>
  );
}

function Paginacao({ page, totalPages, edicaoId }: { page: number; totalPages: number; edicaoId: string }) {
  const janela = 2;
  const paginas = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === totalPages || Math.abs(n - page) <= janela
  );

  return (
    <div className="flex items-center justify-center gap-1.5 mt-4">
      <PageLink page={page - 1} edicaoId={edicaoId} disabled={page <= 1}>
        ← Anterior
      </PageLink>

      {paginas.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5">
          {i > 0 && paginas[i - 1] !== n - 1 && <span className="text-white/25 text-sm px-1">…</span>}
          <PageLink page={n} edicaoId={edicaoId} ativo={n === page}>{n}</PageLink>
        </span>
      ))}

      <PageLink page={page + 1} edicaoId={edicaoId} disabled={page >= totalPages}>
        Próxima →
      </PageLink>
    </div>
  );
}

function PageLink({
  page, edicaoId, ativo, disabled, children,
}: { page: number; edicaoId: string; ativo?: boolean; disabled?: boolean; children: React.ReactNode }) {
  const base = "min-w-9 h-9 px-2.5 flex items-center justify-center rounded-lg text-sm font-medium transition-colors";

  if (disabled) {
    return <span className={`${base} text-white/20 cursor-not-allowed`}>{children}</span>;
  }

  return (
    <Link
      href={`/admin/resultados?page=${page}&edicaoId=${edicaoId}`}
      className={`${base} ${
        ativo
          ? "bg-brand-gold text-brand-dark"
          : "text-white/60 hover:bg-white/8 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}
