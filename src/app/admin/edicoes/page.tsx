"use client";

import { useState, useEffect, useCallback } from "react";

type Edicao = { id: string; nome: string; ativa: boolean; createdAt: string };

export default function EdicoesPage() {
  const [edicoes, setEdicoes] = useState<Edicao[]>([]);
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [saving, setSaving] = useState(false);
  const [ativandoId, setAtivandoId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const res = await fetch("/api/admin/edicoes");
    if (res.ok) setEdicoes(await res.json());
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSaving(true);

    const res = await fetch("/api/admin/edicoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) { setErro(data.error); return; }

    setNome("");
    carregar();
  }

  async function ativar(edicao: Edicao) {
    if (!confirm(`Ativar "${edicao.nome}"? A prova pública passará a usar os grupos, questões e configurações dela.`)) return;
    setAtivandoId(edicao.id);
    await fetch(`/api/admin/edicoes/${edicao.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativa: true }),
    });
    setAtivandoId(null);
    carregar();
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>Edições</h1>
        <p className="text-sm text-white/40 mt-1">Cada edição (CAP22, CAP23...) tem seus próprios grupos, questões e configurações</p>
      </div>

      {/* Formulário de criação */}
      <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6 mb-6">
        <h2 className="text-sm font-semibold text-white mb-4">Nova edição</h2>
        <form onSubmit={criar} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-white/40 font-medium mb-1">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-colors"
              placeholder="Ex: CAP24"
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-gold hover:bg-brand-gold-dark disabled:opacity-50 text-brand-dark font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
          >
            {saving ? "Criando..." : "+ Criar"}
          </button>
        </form>
        <p className="text-xs text-white/25 mt-3">
          Grupos, questões e configurações da edição ativa atual são copiados automaticamente para a nova.
        </p>
        {erro && <p className="text-brand-rose text-sm mt-3">{erro}</p>}
      </div>

      {/* Lista */}
      <div className="bg-white/[0.03] rounded-2xl border border-white/10 overflow-hidden">
        {edicoes.length === 0 ? (
          <div className="py-12 text-center text-white/25 text-sm">
            Nenhuma edição cadastrada ainda.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">Nome</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">Criada em</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {edicoes.map((e) => (
                <tr key={e.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-5 py-3.5 font-medium text-white/90">{e.nome}</td>
                  <td className="px-5 py-3.5">
                    {e.ativa ? (
                      <span className="text-xs bg-green-500/10 text-green-400 rounded-full px-2.5 py-1 font-medium">Ativa</span>
                    ) : (
                      <span className="text-xs bg-white/8 text-white/40 rounded-full px-2.5 py-1 font-medium">Inativa</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-white/35 text-xs">
                    {new Date(e.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {!e.ativa && (
                      <button
                        onClick={() => ativar(e)}
                        disabled={ativandoId === e.id}
                        className="text-xs text-brand-gold hover:text-brand-gold-dark font-medium disabled:opacity-50"
                      >
                        {ativandoId === e.id ? "Ativando..." : "Ativar"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
