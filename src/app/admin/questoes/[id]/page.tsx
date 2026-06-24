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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Questão</h1>
      <QuestaoForm questao={questao} />
    </div>
  );
}
