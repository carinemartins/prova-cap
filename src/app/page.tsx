import { prisma } from "@/lib/prisma";
import { getEdicaoAtiva } from "@/lib/edicao";
import ProvaForm from "@/components/ProvaForm";
import LogoHeader from "@/components/LogoHeader";

export const dynamic = "force-dynamic";

async function getConfigs(edicaoId: string) {
  const rows = await prisma.configuracao.findMany({ where: { edicaoId } });
  return Object.fromEntries(rows.map((c) => [c.chave, c.valor]));
}

export default async function Home() {
  const edicao = await getEdicaoAtiva();
  const configs = await getConfigs(edicao.id);

  if (configs.prova_aberta === "false") {
    return (
      <main className="min-h-screen bg-brand-dark flex flex-col items-center justify-center gap-6 px-4">
        <LogoHeader />
        <div className="text-center space-y-2">
          <h1
            className="text-white text-2xl font-bold"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Prova encerrada
          </h1>
          <p className="text-white/35 text-sm">
            A prova não está aceitando respostas no momento.
          </p>
        </div>
      </main>
    );
  }

  const questoes = await prisma.questao.findMany({
    where: { edicaoId: edicao.id, ativa: true },
    orderBy: { ordem: "asc" },
    include: { opcoes: { orderBy: { ordem: "asc" } } },
  });

  return (
    <ProvaForm
      questoes={questoes}
      titulo={configs.prova_titulo}
      descricao={configs.prova_descricao}
      mensagemSucesso={configs.prova_mensagem_sucesso}
    />
  );
}
