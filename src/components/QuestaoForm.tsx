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
    <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6 space-y-5">
      <div>
        <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">Texto da questão</label>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-colors min-h-[80px]"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => handleTipoChange(e.target.value as Questao["tipo"])}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-colors [&>option]:text-brand-dark"
          >
            {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">Pontos</label>
          <input
            type="number"
            min={0}
            value={pontos}
            onChange={(e) => setPontos(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">Ordem</label>
          <input
            type="number"
            min={1}
            value={ordem}
            onChange={(e) => setOrdem(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="ativa"
          checked={ativa}
          onChange={(e) => setAtiva(e.target.checked)}
          className="accent-brand-gold"
        />
        <label htmlFor="ativa" className="text-sm text-white/70">Questão ativa</label>
      </div>

      {tipo !== "ABERTA" && (
        <div>
          <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
            Opções <span className="normal-case text-white/25">(marque a correta)</span>
          </label>
          <div className="space-y-2">
            {opcoes.map((op, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correta"
                  checked={op.correta}
                  onChange={() => setOpcaoCorreta(idx)}
                  className="accent-brand-gold shrink-0"
                />
                <input
                  type="text"
                  value={op.texto}
                  onChange={(e) => setOpcoes((prev) => prev.map((o, i) => i === idx ? { ...o, texto: e.target.value } : o))}
                  disabled={tipo === "VERDADEIRO_FALSO"}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-colors disabled:bg-white/[0.02] disabled:text-white/40"
                  placeholder={`Opção ${idx + 1}`}
                />
                {tipo !== "VERDADEIRO_FALSO" && opcoes.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOpcao(idx)}
                    className="text-brand-rose/60 hover:text-brand-rose text-xs"
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
              className="mt-2 text-sm text-brand-gold hover:text-brand-gold-light font-medium hover:underline"
            >
              + Adicionar opção
            </button>
          )}
        </div>
      )}

      {erro && <p className="text-brand-rose text-sm bg-brand-rose/10 border border-brand-rose/20 rounded-lg px-3 py-2">{erro}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-brand-gold hover:bg-brand-gold-dark disabled:opacity-60 text-brand-dark font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
        >
          {saving ? "Salvando..." : questao ? "Salvar alterações" : "Criar questão"}
        </button>
        {questao && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="border border-brand-rose/30 text-brand-rose hover:bg-brand-rose/10 disabled:opacity-60 px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            {deleting ? "Excluindo..." : "Excluir"}
          </button>
        )}
      </div>
    </div>
  );
}
