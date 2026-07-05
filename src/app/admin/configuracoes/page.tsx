"use client";

import { useState, useEffect } from "react";

export default function ConfiguracoesPage() {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [provaAberta, setProvaAberta] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    fetch("/api/admin/configuracoes")
      .then((r) => r.json())
      .then((data) => {
        setTitulo(data.prova_titulo ?? "");
        setDescricao(data.prova_descricao ?? "");
        setMensagemSucesso(data.prova_mensagem_sucesso ?? "");
        setProvaAberta(data.prova_aberta !== "false");
        setLoading(false);
      });
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setOk(false);

    await fetch("/api/admin/configuracoes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prova_titulo: titulo,
        prova_descricao: descricao,
        prova_mensagem_sucesso: mensagemSucesso,
        prova_aberta: provaAberta ? "true" : "false",
      }),
    });

    setSaving(false);
    setOk(true);
    setTimeout(() => setOk(false), 3000);
  }

  if (loading) {
    return (
      <div className="p-8 text-white/40 text-sm">Carregando configurações...</div>
    );
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>Configurações</h1>
        <p className="text-sm text-white/40 mt-1">Personalize o conteúdo exibido na página da prova</p>
      </div>

      <form onSubmit={salvar} className="bg-white/[0.03] rounded-2xl border border-white/10 p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">
            Título da prova
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-colors"
            placeholder="Ex: Prova Final das Alunas CAP"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">
            Descrição / subtítulo
          </label>
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-colors"
            placeholder="Ex: Treinamento Conserto de Roupas Lucrativo"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">
            Mensagem após envio
          </label>
          <textarea
            value={mensagemSucesso}
            onChange={(e) => setMensagemSucesso(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-colors min-h-[80px] resize-y"
            placeholder="Ex: Prova enviada com sucesso! Parabéns..."
          />
        </div>

        <div className="flex items-center justify-between py-3 border-t border-white/10">
          <div>
            <p className="text-sm font-medium text-white/85">Prova aberta para respostas</p>
            <p className="text-xs text-white/35 mt-0.5">Quando desativada, a prova fica inacessível para alunas</p>
          </div>
          <button
            type="button"
            onClick={() => setProvaAberta(!provaAberta)}
            className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
              provaAberta ? "bg-brand-gold" : "bg-white/10"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform mt-0.5 ${
                provaAberta ? "translate-x-5.5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-gold hover:bg-brand-gold-dark disabled:opacity-50 text-brand-dark font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            {saving ? "Salvando..." : "Salvar configurações"}
          </button>
          {ok && (
            <span className="text-sm text-green-400 font-medium">✓ Salvo com sucesso</span>
          )}
        </div>
      </form>
    </div>
  );
}
