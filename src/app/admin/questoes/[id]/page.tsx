import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import QuestaoForm from "@/components/QuestaoForm";

export const dynamic = "force-dynamic";

export default async function EditarQuestaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const questao = await prisma.questao.findUnique({
    where: { id },
    include: { opcoes: { orderBy: { ordem: "asc" } } },
  });

  if (!questao) notFound();

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>Editar questão</h1>
        <p className="text-sm text-white/40 mt-1">Atualize o conteúdo ou as opções desta pergunta</p>
      </div>
      <QuestaoForm questao={questao} />
    </div>
  );
}
