"use client";

import { useState, useEffect, useCallback } from "react";

type Grupo = { id: string; numero: number; nome: string; ativo: boolean };

export default function GruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [numero, setNumero] = useState("");
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [saving, setSaving] = useState(false);

  const carregar = useCallback(async () => {
    const res = await fetch("/api/admin/grupos");
    if (res.ok) setGrupos(await res.json());
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSaving(true);

    const res = await fetch("/api/admin/grupos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero: Number(numero), nome }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) { setErro(data.error); return; }

    setNumero("");
    setNome("");
    carregar();
  }

  async function toggleAtivo(g: Grupo) {
    await fetch(`/api/admin/grupos/${g.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !g.ativo }),
    });
    carregar();
  }

  async function remover(g: Grupo) {
    if (!confirm(`Remover o grupo #${g.numero} — ${g.nome}?`)) return;
    const res = await fetch(`/api/admin/grupos/${g.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error);
      return;
    }
    carregar();
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-brand-text" style={{ fontFamily: "var(--font-playfair)" }}>Grupos</h1>
        <p className="text-sm text-brand-text/50 mt-1">Gerencie os grupos de alunas que aparecem na prova</p>
      </div>

      {/* Formulário de criação */}
      <div className="bg-white rounded-2xl border border-brand-cream-dark p-6 mb-6">
        <h2 className="text-sm font-semibold text-brand-text mb-4">Novo grupo</h2>
        <form onSubmit={criar} className="flex gap-3 items-end">
          <div>
            <label className="block text-xs text-brand-text/50 font-medium mb-1">Número</label>
            <input
              type="number"
              min="1"
              max="99"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="w-20 border border-brand-cream-dark rounded-xl px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
              placeholder="1"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-brand-text/50 font-medium mb-1">Nome da consultora</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full border border-brand-cream-dark rounded-xl px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
              placeholder="Ex: Roberta"
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-gold hover:bg-brand-gold-dark disabled:opacity-50 text-brand-dark font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
          >
            {saving ? "Salvando..." : "+ Adicionar"}
          </button>
        </form>
        {erro && <p className="text-brand-rose text-sm mt-3">{erro}</p>}
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl border border-brand-cream-dark overflow-hidden">
        {grupos.length === 0 ? (
          <div className="py-12 text-center text-brand-text/30 text-sm">
            Nenhum grupo cadastrado ainda.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-brand-cream/60">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-text/50 uppercase tracking-wider">Nº</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-text/50 uppercase tracking-wider">Consultora</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-text/50 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-cream-dark">
              {grupos.map((g) => (
                <tr key={g.id} className="hover:bg-brand-cream/40 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-brand-gold">#{g.numero}</td>
                  <td className="px-5 py-3.5 font-medium text-brand-text">{g.nome}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => toggleAtivo(g)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                        g.ativo
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-brand-rose/10 text-brand-rose hover:bg-brand-rose/20"
                      }`}
                    >
                      {g.ativo ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => remover(g)}
                      className="text-xs text-brand-text/30 hover:text-brand-rose transition-colors"
                    >
                      Remover
                    </button>
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
