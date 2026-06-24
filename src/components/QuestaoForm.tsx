"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Opcao = { id?: string; texto: string; correta: boolean; ordem: number };

type Questao = {
  id: string;
  texto: string;
  tipo: "MULTIPLA_ESCOLHA" | "VERDADEIRO_FALSO" | "ABERTA";
  pontos: number;
  ordem: number;
  ativa: boolean;
  opcoes: Opcao[];
};

type Props = { questao?: Questao };

const TIPOS = [
  { value: "MULTIPLA_ESCOLHA", label: "Múltipla escolha" },
  { value: "VERDADEIRO_FALSO", label: "Verdadeiro ou Falso" },
  { value: "ABERTA", label: "Resposta aberta" },
];

const VF_OPCOES: Opcao[] = [
  { texto: "a) Verdadeiro", correta: false, ordem: 1 },
  { texto: "b) Falso", correta: false, ordem: 2 },
];

export default function QuestaoForm({ questao }: Props) {
  const router = useRouter();
  const [texto, setTexto] = useState(questao?.texto ?? "");
  const [tipo, setTipo] = useState<Questao["tipo"]>(questao?.tipo ?? "MULTIPLA_ESCOLHA");
  const [pontos, setPontos] = useState(questao?.pontos ?? 1);
  const [ordem, setOrdem] = useState(questao?.ordem ?? 1);
  const [ativa, setAtiva] = useState(questao?.ativa ?? true);
  const [opcoes, setOpcoes] = useState<Opcao[]>(
    questao?.opcoes ?? [
      { texto: "", correta: false, ordem: 1 },
      { texto: "", correta: false, ordem: 2 },
    ]
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [erro, setErro] = useState("");

  function addOpcao() {
    setOpcoes((prev) => [...prev, { texto: "", correta: false, ordem: prev.length + 1 }]);
  }

  function removeOpcao(idx: number) {
    setOpcoes((prev) => prev.filter((_, i) => i !== idx).map((o, i) => ({ ...o, ordem: i + 1 })));
  }

  function setOpcaoCorreta(idx: number) {
    setOpcoes((prev) => prev.map((o, i) => ({ ...o, correta: i === idx })));
  }

  function handleTipoChange(novoTipo: Questao["tipo"]) {
    setTipo(novoTipo);
    if (novoTipo === "VERDADEIRO_FALSO") setOpcoes(VF_OPCOES);
    else if (novoTipo === "ABERTA") setOpcoes([]);
    else setOpcoes([{ texto: "", correta: false, ordem: 1 }, { texto: "", correta: false, ordem: 2 }]);
  }

  async function handleSave() {
    setErro("");
    if (!texto.trim()) { setErro("Escreva o texto da questão."); return; }
    if (tipo !== "ABERTA" && opcoes.filter((o) => o.texto.trim()).length < 2) {
      setErro("Adicione pelo menos 2 opções."); return;
    }
    if (tipo !== "ABERTA" && !opcoes.some((o) => o.correta)) {
      setErro("Marque a opção correta."); return;
    }

    setSaving(true);
    try {
      const url = questao ? `/api/admin/questoes/${questao.id}` : "/api/admin/questoes";
      const method = questao ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, tipo, pontos, ordem, ativa, opcoes }),
      });

      if (!res.ok) throw new Error();
      router.push("/admin/questoes");
      router.refresh();
    } catch {
      setErro("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!questao || !confirm("Excluir esta questão permanentemente?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/questoes/${questao.id}`, { method: "DELETE" });
      router.push("/admin/questoes");
      router.refresh();
    } catch {
      setErro("Erro ao excluir.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Texto da questão</label>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 min-h-[80px]"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => handleTipoChange(e.target.value as Questao["tipo"])}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pontos</label>
          <input
            type="number"
            min={0}
            value={pontos}
            onChange={(e) => setPontos(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
          <input
            type="number"
            min={1}
            value={ordem}
            onChange={(e) => setOrdem(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="ativa"
          checked={ativa}
          onChange={(e) => setAtiva(e.target.checked)}
          className="accent-purple-600"
        />
        <label htmlFor="ativa" className="text-sm text-gray-700">Questão ativa</label>
      </div>

      {tipo !== "ABERTA" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Opções <span className="text-xs text-gray-400">(marque a correta)</span>
          </label>
          <div className="space-y-2">
            {opcoes.map((op, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correta"
                  checked={op.correta}
                  onChange={() => setOpcaoCorreta(idx)}
                  className="accent-purple-600 shrink-0"
                />
                <input
                  type="text"
                  value={op.texto}
                  onChange={(e) => setOpcoes((prev) => prev.map((o, i) => i === idx ? { ...o, texto: e.target.value } : o))}
                  disabled={tipo === "VERDADEIRO_FALSO"}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-50"
                  placeholder={`Opção ${idx + 1}`}
                />
                {tipo !== "VERDADEIRO_FALSO" && opcoes.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOpcao(idx)}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          {tipo === "MULTIPLA_ESCOLHA" && (
            <button
              type="button"
              onClick={addOpcao}
              className="mt-2 text-sm text-purple-600 hover:underline"
            >
              + Adicionar opção
            </button>
          )}
        </div>
      )}

      {erro && <p className="text-red-500 text-sm">{erro}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          {saving ? "Salvando..." : questao ? "Salvar alterações" : "Criar questão"}
        </button>
        {questao && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="border border-red-300 text-red-500 hover:bg-red-50 disabled:opacity-60 px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            {deleting ? "Excluindo..." : "Excluir"}
          </button>
        )}
      </div>
    </div>
  );
}
