"use client";

import { useState, useEffect, useRef } from "react";
import LogoHeader from "./LogoHeader";

type Opcao   = { id: string; texto: string; ordem: number };
type Questao = {
  id: string; texto: string;
  tipo: "MULTIPLA_ESCOLHA" | "VERDADEIRO_FALSO" | "ABERTA";
  pontos: number; ordem: number; opcoes: Opcao[];
};
type Grupo = { id: string; numero: number; nome: string };

type Props = {
  questoes: Questao[];
  titulo?: string;
  descricao?: string;
  mensagemSucesso?: string;
};

/**
 * Steps:
 *   0       → boas-vindas (logo + foto + info)
 *   1       → identidade (nome + whatsapp)
 *   2..N+1  → questões
 *   N+2     → grupo (se houver)
 *   enviado → sucesso
 */
export default function ProvaForm({ questoes, descricao, mensagemSucesso }: Props) {
  const [step,     setStep]     = useState(0);
  const [animKey,  setAnimKey]  = useState(0);
  const [nome,     setNome]     = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [grupoId,  setGrupoId]  = useState<string | null>(null);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [grupos,   setGrupos]   = useState<Grupo[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [enviado,  setEnviado]  = useState(false);
  const [erro,     setErro]     = useState("");
  const [fotoOk,   setFotoOk]   = useState(true);
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/prova/grupos")
      .then((r) => r.json())
      .then((d) => setGrupos(Array.isArray(d) ? d : []));
    return () => { if (autoRef.current) clearTimeout(autoRef.current); };
  }, []);

  const hasGrupos   = grupos.length > 0;
  const totalQ      = questoes.length;
  const questaoIdx  = step - 2;
  const questaoAtual = questaoIdx >= 0 && questaoIdx < totalQ ? questoes[questaoIdx] : null;
  const isGrupoStep  = step === totalQ + 2 && hasGrupos;
  const isLastQ      = questaoIdx === totalQ - 1;
  const progressPct  = step < 2 ? 0 : Math.round((questaoIdx / totalQ) * 100);
  const pontuacaoTotal = questoes.reduce((s, q) => s + q.pontos, 0);

  function goTo(n: number) {
    setAnimKey((k) => k + 1);
    setStep(n);
    setErro("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleIdentidadeNext() {
    if (!nome.trim())     { setErro("Por favor, informe seu nome."); return; }
    if (!whatsapp.trim()) { setErro("Por favor, informe seu WhatsApp."); return; }
    goTo(step + 1);
  }

  function handleOpcaoSelect(questaoId: string, opcaoId: string) {
    setRespostas((p) => ({ ...p, [questaoId]: opcaoId }));
    setErro("");
  }

  function handleConfirmar() {
    if (!questaoAtual) return;
    const r = respostas;
    if (!r[questaoAtual.id]) { setErro("Selecione uma opção antes de continuar."); return; }
    if (isLastQ && !hasGrupos) submitForm(r);
    else goTo(step + 1);
  }

  function handleAbertaNext(questaoId: string) {
    if (!respostas[questaoId]?.trim()) { setErro("Por favor, responda esta questão."); return; }
    if (isLastQ && !hasGrupos) submitForm(respostas);
    else goTo(step + 1);
  }

  function handleGrupoNext() {
    if (!grupoId) { setErro("Por favor, selecione seu grupo."); return; }
    submitForm(respostas);
  }

  async function submitForm(r: Record<string, string>) {
    setEnviando(true); setErro("");
    try {
      const res  = await fetch("/api/prova/submeter", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, whatsapp, grupoId, respostas: r }),
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

  if (enviado) return <Sucesso mensagem={mensagemSucesso} />;

  // ═══════════════════════════════════════════════
  // QUESTÃO — layout tela cheia (estilo quiz)
  // ═══════════════════════════════════════════════
  if (questaoAtual) {
    const sel = respostas[questaoAtual.id];

    return (
      <div key={animKey} className="min-h-screen bg-brand-dark flex flex-col animate-slide-up">

        {/* ── Cabeçalho fixo ── */}
        <div className="shrink-0">
          {/* Barra de progresso */}
          <div className="h-[3px] bg-white/8">
            <div
              className="h-full bg-brand-gold transition-all duration-600 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Nav: voltar | contador | pontos */}
          <div className="flex items-center justify-between px-5 py-4">
            <button
              onClick={() => step > 2 ? goTo(step - 1) : goTo(1)}
              className="text-white/30 hover:text-white/60 transition-colors p-1 -ml-1"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </button>

            <div className="flex items-center gap-1.5">
              {/* dots mini */}
              {questoes.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i < questaoIdx
                      ? "w-2 h-2 bg-brand-gold"
                      : i === questaoIdx
                      ? "w-3 h-2 bg-brand-gold/90 rounded-full"
                      : "w-2 h-2 bg-white/10"
                  }`}
                />
              ))}
            </div>

            {questaoAtual.pontos > 0 ? (
              <span className="text-[11px] font-bold text-brand-gold border border-brand-gold/30 rounded-full px-2.5 py-1">
                ⭐ {questaoAtual.pontos} pt
              </span>
            ) : (
              <span className="w-16" />
            )}
          </div>
        </div>

        {/* ── Conteúdo principal ── */}
        <div className="flex-1 flex flex-col justify-between px-5 pb-8 gap-8">

          {/* Número + pergunta */}
          <div className="flex-1 flex flex-col justify-center gap-5 py-6 max-w-lg mx-auto w-full">
            <span className="text-brand-gold/50 text-sm font-bold tracking-widest uppercase">
              Questão {questaoAtual.ordem} de {totalQ}
            </span>
            <p className="text-white text-[22px] sm:text-[26px] leading-snug font-semibold whitespace-pre-line">
              {questaoAtual.texto}
            </p>
          </div>

          {/* Opções */}
          <div className="max-w-lg mx-auto w-full">
            {questaoAtual.tipo === "ABERTA" ? (
              <div className="flex flex-col gap-4">
                <textarea
                  value={respostas[questaoAtual.id] ?? ""}
                  onChange={(e) => setRespostas((p) => ({ ...p, [questaoAtual.id]: e.target.value }))}
                  placeholder="Escreva sua resposta aqui…"
                  rows={5}
                  className="w-full bg-white/[0.05] border border-white/12 rounded-2xl px-5 py-4 text-white text-base placeholder-white/25 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-all resize-none leading-relaxed"
                  autoFocus
                />
                {erro && <MsgErro>{erro}</MsgErro>}
                <button
                  onClick={() => handleAbertaNext(questaoAtual.id)}
                  disabled={enviando}
                  className="w-full bg-brand-gold hover:bg-brand-gold-dark disabled:opacity-50 text-brand-dark font-bold py-5 rounded-2xl text-base tracking-wide transition-all active:scale-[0.98]"
                >
                  {isLastQ && !hasGrupos
                    ? (enviando ? "Enviando…" : "Enviar prova →")
                    : "Próxima →"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {questaoAtual.opcoes.map((op) => {
                  const { letra, conteudo } = parsearOpcao(op.texto);
                  const ativa = sel === op.id;
                  return (
                    <button
                      key={op.id}
                      onClick={() => handleOpcaoSelect(questaoAtual.id, op.id)}
                      className={`w-full text-left flex items-center gap-4 px-5 py-5 rounded-2xl border-2 text-base font-medium transition-all duration-200 active:scale-[0.99] ${
                        ativa
                          ? "bg-brand-gold/15 border-brand-gold text-white"
                          : "bg-white/[0.04] border-white/10 text-white/80 hover:bg-white/[0.08] hover:border-white/25 hover:text-white"
                      }`}
                    >
                      <span className={`flex items-center justify-center w-9 h-9 rounded-xl text-sm font-bold shrink-0 transition-all ${
                        ativa ? "bg-brand-gold text-brand-dark" : "bg-white/8 text-white/40"
                      }`}>
                        {ativa ? "✓" : letra}
                      </span>
                      <span className="leading-snug">{conteudo}</span>
                    </button>
                  );
                })}

                {/* Botão confirmar — desliza para cima após selecionar */}
                <div className={`transition-all duration-300 overflow-hidden ${sel ? "max-h-32 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                  {erro && <MsgErro>{erro}</MsgErro>}
                  <button
                    onClick={handleConfirmar}
                    disabled={enviando}
                    className="w-full bg-brand-gold hover:bg-brand-gold-dark disabled:opacity-50 text-brand-dark font-bold py-5 rounded-2xl text-base tracking-wide transition-all active:scale-[0.98]"
                  >
                    {isLastQ && !hasGrupos
                      ? (enviando ? "Enviando…" : "Confirmar e enviar →")
                      : "Confirmar →"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // OUTROS STEPS — shell padrão
  // ═══════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-5 py-10">
        <div key={animKey} className="animate-slide-up flex-1 flex flex-col gap-8">

          {/* ───────── STEP 0: Boas-vindas ───────── */}
          {step === 0 && (
            <div className="flex flex-col items-center text-center gap-7">
              <div className="pt-2">
                <LogoHeader />
              </div>

              {/* Foto */}
              <div className="relative">
                <div className="w-40 h-40 rounded-full p-[3px] bg-gradient-to-br from-brand-gold via-brand-gold-light to-brand-gold-dark">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#1a1208]">
                    {fotoOk ? (
                      <img
                        src="/avatar-carine.jpeg"
                        alt="Prof. Carine Martins"
                        className="w-full h-full object-cover"
                        onError={() => setFotoOk(false)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1208] to-[#2a1a0e]">
                        <span className="text-brand-gold text-3xl font-bold" style={{ fontFamily: "var(--font-playfair)" }}>CM</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-brand-dark border-2 border-brand-gold/30 flex items-center justify-center text-xl">🏅</div>
              </div>

              {/* Título */}
              <div className="space-y-2">
                <p className="text-brand-gold text-[11px] font-bold tracking-[0.3em] uppercase">Prova Final</p>
                <h1 className="text-white text-[26px] font-bold leading-tight" style={{ fontFamily: "var(--font-playfair)" }}>
                  Treinamento Conserto<br />de Roupas Lucrativo
                </h1>
                <p className="text-white/40 text-sm">Prof. Carine Martins ✂️</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 w-full">
                <Stat valor={String(totalQ)}           label="questões"    icon="📋" />
                <Stat valor={String(pontuacaoTotal)}   label="pontos"      icon="⭐" />
                <Stat valor="1"                        label="certificado" icon="🏅" />
              </div>

              {descricao && (
                <p className="text-white/45 text-sm leading-relaxed max-w-xs">
                  {descricao.split("\n")[0]}
                </p>
              )}

              <button
                onClick={() => goTo(1)}
                className="w-full bg-brand-gold hover:bg-brand-gold-dark text-brand-dark font-bold py-5 rounded-2xl text-base tracking-wide transition-all active:scale-[0.98] shadow-lg shadow-brand-gold/10"
              >
                Começar agora →
              </button>

              <p className="text-white/20 text-xs">
                Responda todas as questões para receber seu certificado
              </p>
            </div>
          )}

          {/* ───────── STEP 1: Identidade ───────── */}
          {step === 1 && (
            <div className="flex flex-col gap-8">
              <div className="space-y-1.5">
                <p className="text-brand-gold text-[11px] font-bold tracking-[0.25em] uppercase">Antes de começar</p>
                <h2 className="text-white text-2xl font-bold" style={{ fontFamily: "var(--font-playfair)" }}>
                  Quem é você?
                </h2>
                <p className="text-white/35 text-sm">
                  Usaremos esses dados para emitir seu certificado.
                </p>
              </div>

              <div className="space-y-4">
                <Campo label="Qual é o seu nome?" obrigatorio>
                  <InputTexto type="text" value={nome} onChange={setNome}
                    placeholder="Seu nome completo" onEnter={handleIdentidadeNext} autoFocus />
                </Campo>
                <Campo label="Qual é o seu WhatsApp?" obrigatorio>
                  <InputTexto type="tel" value={whatsapp} onChange={setWhatsapp}
                    placeholder="(11) 99999-9999" onEnter={handleIdentidadeNext} mask="telefone" />
                </Campo>
              </div>

              {erro && <MsgErro>{erro}</MsgErro>}

              <button
                onClick={handleIdentidadeNext}
                className="w-full bg-brand-gold hover:bg-brand-gold-dark text-brand-dark font-bold py-5 rounded-2xl text-base tracking-wide transition-all active:scale-[0.98]"
              >
                Continuar →
              </button>
            </div>
          )}

          {/* ───────── STEP N+2: Grupo ───────── */}
          {isGrupoStep && (
            <div className="flex flex-col gap-7">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-[2px] bg-brand-gold" />
                  <p className="text-brand-gold text-[11px] font-bold tracking-[0.25em] uppercase">Última etapa</p>
                </div>
                <h2 className="text-white text-xl font-bold leading-snug" style={{ fontFamily: "var(--font-playfair)" }}>
                  Qual é o número do seu grupo?
                </h2>
                <p className="text-white/35 text-sm">
                  Cada grupo tem uma consultora CAP pronta para te ajudar.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                {grupos.map((g) => {
                  const ativo = grupoId === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setGrupoId(g.id)}
                      className={`w-full text-left flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-sm font-medium transition-all ${
                        ativo
                          ? "bg-brand-gold/15 border-brand-gold text-white"
                          : "bg-white/[0.04] border-white/10 text-white/70 hover:bg-white/[0.07] hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <span className={`flex items-center justify-center w-9 h-9 rounded-xl text-sm font-bold shrink-0 ${
                        ativo ? "bg-brand-gold text-brand-dark" : "bg-white/8 text-white/40"
                      }`}>
                        {g.numero}
                      </span>
                      <span>{g.nome}</span>
                      {ativo && <span className="ml-auto text-brand-gold">✓</span>}
                    </button>
                  );
                })}
              </div>

              {erro && <MsgErro>{erro}</MsgErro>}

              <div className="flex gap-3">
                <button
                  onClick={() => goTo(step - 1)}
                  className="px-5 py-4 rounded-2xl border border-white/10 text-white/35 hover:text-white/60 text-sm font-medium transition-all"
                >
                  ← Voltar
                </button>
                <button
                  onClick={handleGrupoNext}
                  disabled={enviando}
                  className="flex-1 bg-brand-gold hover:bg-brand-gold-dark disabled:opacity-50 text-brand-dark font-bold py-4 rounded-2xl text-sm tracking-wide transition-all active:scale-[0.98]"
                >
                  {enviando ? "Enviando…" : "Enviar prova →"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Tela de sucesso ──────────────────────────────────────────────────────────
function Sucesso({ mensagem }: { mensagem?: string }) {
  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center px-5 animate-fade-in">
      <div className="max-w-sm w-full text-center flex flex-col items-center gap-6">
        <div className="text-6xl animate-[slideUp_0.6s_ease-out_0.1s_both]">🏅</div>
        <div className="space-y-3 animate-[slideUp_0.6s_ease-out_0.2s_both]">
          <h2 className="text-white text-2xl font-bold" style={{ fontFamily: "var(--font-playfair)" }}>
            Prova concluída!
          </h2>
          <div className="w-12 h-[2px] bg-brand-gold mx-auto" />
        </div>
        <p className="text-white/50 text-sm leading-relaxed whitespace-pre-line animate-[slideUp_0.6s_ease-out_0.3s_both]">
          {mensagem ?? "Parabéns por chegar até aqui!\n\nTe espero dentro da CAP.\n\n🚀 Prof. Carine ✂️"}
        </p>
        <p className="text-brand-gold/50 text-[11px] font-bold tracking-[0.25em] uppercase animate-[slideUp_0.6s_ease-out_0.4s_both]">
          CAP — Consertos e Ajustes Perfeitos
        </p>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Extrai "a)" → letra "A" e o texto limpo da opção */
function parsearOpcao(texto: string): { letra: string; conteudo: string } {
  const m = texto.match(/^([a-zA-Z])\)\s*(.+)/);
  if (m) return { letra: m[1].toUpperCase(), conteudo: m[2].trim() };
  return { letra: "", conteudo: texto.trim() };
}

function Stat({ valor, label, icon }: { valor: string; label: string; icon: string }) {
  return (
    <div className="bg-white/[0.04] border border-white/8 rounded-2xl px-3 py-4 flex flex-col items-center gap-1.5">
      <span className="text-xl">{icon}</span>
      <span className="text-white font-bold text-lg tabular-nums leading-none">{valor}</span>
      <span className="text-white/30 text-[10px] uppercase tracking-wide font-medium">{label}</span>
    </div>
  );
}

function Campo({ label, obrigatorio, children }: { label: string; obrigatorio?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-white/60 text-sm font-medium">
        {label}{obrigatorio && <span className="text-brand-rose ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function mascaraTelefone(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2)  return d.length ? `(${d}` : "";
  if (d.length <= 6)  return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

function InputTexto({
  type, value, onChange, placeholder, onEnter, autoFocus, mask,
}: { type: string; value: string; onChange: (v: string) => void; placeholder?: string; onEnter?: () => void; autoFocus?: boolean; mask?: "telefone" }) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    onChange(mask === "telefone" ? mascaraTelefone(raw) : raw);
  }
  return (
    <input
      type={type} value={value}
      onChange={handleChange}
      onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
      placeholder={placeholder} autoFocus={autoFocus}
      inputMode={mask === "telefone" ? "numeric" : undefined}
      className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-4 text-white text-base placeholder-white/20 focus:outline-none focus:border-brand-gold/40 focus:ring-1 focus:ring-brand-gold/20 transition-all"
    />
  );
}

function MsgErro({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm text-red-400 bg-red-400/8 border border-red-400/20 rounded-xl px-4 py-3">
      {children}
    </div>
  );
}
