import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProvaForm from "@/components/ProvaForm";

export const dynamic = "force-dynamic";

async function getConfigs() {
  const configs = await prisma.configuracao.findMany();
  return Object.fromEntries(configs.map((c) => [c.chave, c.valor]));
}

export default async function Home() {
  const configs = await getConfigs();

  // Se a prova estiver fechada, exibe aviso
  if (configs.prova_aberta === "false") {
    return (
      <main className="min-h-screen bg-brand-dark flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 mb-6">
            <span className="text-brand-gold text-2xl font-bold" style={{ fontFamily: "var(--font-playfair)" }}>C</span>
          </div>
          <h1 className="text-white text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-playfair)" }}>
            Prova encerrada
          </h1>
          <p className="text-white/50 text-sm">A prova não está aceitando respostas no momento.</p>
        </div>
      </main>
    );
  }

  const questoes = await prisma.questao.findMany({
    where: { ativa: true },
    orderBy: { ordem: "asc" },
    include: {
      opcoes: { orderBy: { ordem: "asc" } },
    },
  });

  const titulo = configs.prova_titulo ?? "Prova Final das Alunas CAP";
  const descricao = configs.prova_descricao ?? "Treinamento Conserto de Roupas Lucrativo";
  const mensagemSucesso = configs.prova_mensagem_sucesso;

  return (
    <main className="min-h-screen bg-brand-cream py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Logo / Cabeçalho */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-brand-dark flex items-center justify-center shrink-0">
              <span className="text-brand-gold font-bold text-base" style={{ fontFamily: "var(--font-playfair)" }}>C</span>
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold tracking-widest text-brand-gold uppercase">CAP</p>
              <p className="text-xs text-brand-text/50 leading-none">Consertos e Ajustes Perfeitos</p>
            </div>
          </div>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-brand-cream-dark">

          {/* Header do card */}
          <div className="bg-brand-dark px-6 py-7 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-brand-gold/10" />
            <div className="absolute -right-2 -bottom-10 w-24 h-24 rounded-full bg-brand-gold/5" />
            <div className="relative">
              <span className="inline-block text-xs font-semibold tracking-widest text-brand-gold uppercase mb-2">
                {descricao}
              </span>
              <h1 className="text-white text-2xl font-bold leading-tight" style={{ fontFamily: "var(--font-playfair)" }}>
                {titulo}
              </h1>
              <p className="text-white/50 text-sm mt-2">🎓 Chegou a hora de mostrar o que você aprendeu</p>
            </div>
          </div>

          {/* Aviso motivacional */}
          <div className="px-6 py-4 bg-brand-gold/8 border-b border-brand-gold/20">
            <div className="space-y-1.5 text-sm text-brand-text">
              <p className="flex gap-2 items-start">
                <span className="text-brand-gold mt-0.5">✦</span>
                <span>Se tornar uma <strong>CAP certificada</strong>: reconhecida, bem paga e faturando de R$3.000 a R$8.000/mês.</span>
              </p>
              <p className="flex gap-2 items-start">
                <span className="text-brand-rose mt-0.5">✦</span>
                <span>Ou seguir do mesmo jeito, enquanto outras completam o futuro que poderia ser seu.</span>
              </p>
            </div>
            <p className="text-xs text-brand-text/40 mt-3">* Campos obrigatórios</p>
          </div>

          <ProvaForm questoes={questoes} mensagemSucesso={mensagemSucesso} />
        </div>

        <p className="text-center text-xs text-brand-text/30 mt-6">
          CAP — Consertos e Ajustes Perfeitos · Treinamento CARINE
        </p>
      </div>
    </main>
  );
}
