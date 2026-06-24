import QuestaoForm from "@/components/QuestaoForm";

export default function NovaQuestaoPage() {
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nova Questão</h1>
      <QuestaoForm />
    </div>
  );
}
