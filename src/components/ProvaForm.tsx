"use client";

import { useState, useEffect } from "react";

type Opcao = {
  id: string;
  texto: string;
  correta: boolean;
  ordem: number;
};

type Questao = {
  id: string;
  texto: string;
  tipo: "MULTIPLA_ESCOLHA" | "VERDADEIRO_FALSO" | "ABERTA";
  pontos: number;
  ordem: number;
  opcoes: Opcao[];
};

type Grupo = {
  id: string;
  numero: number;
  nome: string;
};

type Props = {
  questoes: Questao[];
  mensagemSucesso?: string;
};

export default function ProvaForm({ questoes, mensagemSucesso }: Props) {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [grupoId, setGrupoId] = useState<string | null>(null);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch("/api/prova/grupos")
      .then((r) => r.json())
      .then((data) => setGrupos(Array.isArray(data) ? data : []));
  }, []);

  function setResposta(questaoId: string, valor: string) {
    setRespostas((prev) => ({ ...prev, [questaoId]: valor }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!nome.trim()) { setErro("Informe seu nome."); return; }
    if (!whatsapp.trim()) { setErro("Informe seu WhatsApp."); return; }

    if (grupos.length > 0 && !grupoId) {
      setErro("Selecione seu grupo.");
      return;
    }

    for (const q of questoes) {
      if (!respostas[q.id]) {
        setErro(`Responda a questão ${q.ordem}.`);
        return;
      }
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/prova/submeter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, whatsapp, grupoId, respostas }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao enviar.");
      setEnviado(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao enviar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="px-6 py-14 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-brand-text mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
          Prova enviada!
        </h2>
        <p className="text-brand-text/60 text-sm max-w-xs mx-auto">
          {mensagemSucesso ?? "Parabéns por chegar até aqui. Agora me conta, você já decidiu ser uma CAP?"}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="divide-y divide-brand-cream-dark">
      {/* Dados pessoais */}
      <div className="px-6 py-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-text mb-1.5">
            Qual seu nome? <span className="text-brand-rose">*</span>
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border border-brand-cream-dark rounded-xl px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-colors"
            placeholder="Sua resposta"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-text mb-1.5">
            Qual seu WhatsApp? <span className="text-brand-rose">*</span>
          </label>
          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full border border-brand-cream-dark rounded-xl px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-colors"
            placeholder="(11) 99999-9999"
            required
          />
        </div>
      </div>

      {/* Questões */}
      {questoes.map((q) => (
        <div key={q.id} className="px-6 py-5">
          <p className="text-sm font-medium text-brand-text mb-3">
            <span className="text-brand-gold font-bold mr-1">{q.ordem}.</span>
            {q.texto} <span className="text-brand-rose">*</span>
            {q.pontos > 0 && (
              <span className="ml-2 text-xs text-brand-text/40 font-normal">
                {q.pontos} {q.pontos === 1 ? "ponto" : "pontos"}
              </span>
            )}
          </p>

          {q.tipo === "ABERTA" ? (
            <textarea
              value={respostas[q.id] ?? ""}
              onChange={(e) => setResposta(q.id, e.target.value)}
              className="w-full border border-brand-cream-dark rounded-xl px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-gold/30 min-h-[80px] resize-y"
              placeholder="Sua resposta"
            />
          ) : (
            <div className="space-y-2">
              {q.opcoes.map((op) => (
                <label key={op.id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={op.id}
                    checked={respostas[q.id] === op.id}
                    onChange={() => setResposta(q.id, op.id)}
                    className="accent-[#C9A84C] w-4 h-4 shrink-0"
                  />
                  <span className="text-sm text-brand-text/70 group-hover:text-brand-text transition-colors">{op.texto}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Grupo */}
      {grupos.length > 0 && (
        <div className="px-6 py-5">
          <p className="text-sm font-medium text-brand-text mb-3">
            Todo grupo de interessadas tem um número com uma consultora CAP para ajudar. Qual é o número do seu grupo? <span className="text-brand-rose">*</span>
          </p>
          <div className="space-y-2">
            {grupos.map((g) => (
              <label key={g.id} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="grupo"
                  value={g.id}
                  checked={grupoId === g.id}
                  onChange={() => setGrupoId(g.id)}
                  className="accent-[#C9A84C] w-4 h-4 shrink-0"
                />
                <span className="text-sm text-brand-text/70 group-hover:text-brand-text transition-colors">
                  <span className="font-semibold text-brand-gold">#{g.numero}</span> — {g.nome}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Enviar */}
      <div className="px-6 py-5">
        {erro && (
          <p className="text-brand-rose text-sm bg-brand-rose/10 border border-brand-rose/20 rounded-lg px-3 py-2 mb-3">
            {erro}
          </p>
        )}
        <button
          type="submit"
          disabled={enviando}
          className="bg-brand-gold hover:bg-brand-gold-dark disabled:opacity-60 text-brand-dark font-semibold px-8 py-3 rounded-xl text-sm transition-colors"
        >
          {enviando ? "Enviando..." : "Enviar prova"}
        </button>
        <p className="text-xs text-brand-text/30 mt-3">
          Nunca envie senhas por este formulário.
        </p>
      </div>
    </form>
  );
}
