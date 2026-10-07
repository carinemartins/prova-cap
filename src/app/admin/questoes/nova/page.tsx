import QuestaoForm from "@/components/QuestaoForm";
import { getEdicaoAtiva, getModo } from "@/lib/edicao";

export const dynamic = "force-dynamic";

export default async function NovaQuestaoPage() {
  const edicao = await getEdicaoAtiva();
  const pesquisa = (await getModo(edicao.id)) === "pesquisa";

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>Nova questão</h1>
        <p className="text-sm text-white/40 mt-1">Cadastre uma nova pergunta para a {pesquisa ? "pesquisa" : "prova"}</p>
      </div>
      <QuestaoForm pesquisa={pesquisa} />
    </div>
  );
}
