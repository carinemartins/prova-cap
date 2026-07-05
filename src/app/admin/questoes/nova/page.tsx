import QuestaoForm from "@/components/QuestaoForm";

export default function NovaQuestaoPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>Nova questão</h1>
        <p className="text-sm text-white/40 mt-1">Cadastre uma nova pergunta para a prova</p>
      </div>
      <QuestaoForm />
    </div>
  );
}
