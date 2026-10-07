import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getModo } from "@/lib/edicao";

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
  const pesquisa = (await getModo(submissao.edicaoId)) === "pesquisa";

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/admin/resultados" className="text-sm text-brand-gold hover:text-brand-gold-dark hover:underline font-medium mb-4 block">
        ← Voltar
      </Link>

      <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6 mb-6">
        <h1 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>{submissao.nome}</h1>
        <p className="text-sm text-white/40 mt-1">WhatsApp: {submissao.whatsapp}</p>
        {submissao.email && <p className="text-sm text-white/40">E-mail: {submissao.email}</p>}
        <p className="text-sm text-white/40">Grupo: {submissao.grupo ? `#${submissao.grupo.numero} — ${submissao.grupo.nome}` : "—"}</p>
        <p className="text-sm text-white/40">
          Enviado em: {new Date(submissao.createdAt).toLocaleString("pt-BR")}
        </p>
        {!pesquisa && (
          <p className="text-2xl font-bold text-brand-gold mt-3">
            {submissao.pontuacao} pontos
          </p>
        )}
      </div>

      <div className="space-y-4">
        {agruparPorQuestao(submissao.respostas).map((linhas) => {
          const r = linhas[0];
          const q = r.questao;
          const acertou = r.opcao?.correta ?? null;
          const comGabarito = !pesquisa && q.tipo !== "ABERTA" && q.tipo !== "MULTIPLA_SELECAO";
          return (
            <div key={q.id} className="bg-white/[0.03] rounded-2xl border border-white/10 p-5">
              <p className="text-sm font-medium text-white/90 mb-2">
                {q.ordem}. {q.texto}
              </p>

              {q.tipo === "ABERTA" ? (
                <p className="text-sm text-white/60 bg-white/5 rounded-xl px-3 py-2 whitespace-pre-line">{r.textoLivre || "Sem resposta"}</p>
              ) : comGabarito ? (
                <div>
                  <p className={`text-sm font-medium ${acertou ? "text-green-400" : "text-brand-rose"}`}>
                    {acertou ? "✓ Acertou" : "✗ Errou"} — {rotulo(r)}
                  </p>
                  {!acertou && (
                    <p className="text-xs text-white/35 mt-1">
                      Correta: {q.opcoes.find((o) => o.correta)?.texto}
                    </p>
                  )}
                </div>
              ) : (
                <ul className="space-y-1">
                  {linhas.map((l) => (
                    <li key={l.id} className="text-sm font-medium text-white/75">• {rotulo(l)}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type Linha = { id: string; textoLivre: string | null; opcao: { texto: string } | null; questao: { id: string } };

/** Junta as linhas da mesma questão (perguntas de "marcar várias" têm uma linha por opção). */
function agruparPorQuestao<T extends Linha>(respostas: T[]): T[][] {
  const grupos = new Map<string, T[]>();
  for (const r of respostas) grupos.set(r.questao.id, [...(grupos.get(r.questao.id) ?? []), r]);
  return [...grupos.values()];
}

/** Texto da opção marcada; na opção "Outro" inclui o que a pessoa escreveu. */
function rotulo(r: Linha) {
  if (!r.opcao) return "Sem resposta";
  return r.textoLivre ? `${r.opcao.texto}: ${r.textoLivre}` : r.opcao.texto;
}
