"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Usuario = { id: string; name: string; email: string; role: "ADMIN" | "EDITOR"; ativo: boolean };
type Props = { usuario?: Usuario };

export default function UsuarioForm({ usuario }: Props) {
  const router = useRouter();
  const [name, setName] = useState(usuario?.name ?? "");
  const [email, setEmail] = useState(usuario?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "EDITOR">(usuario?.role ?? "EDITOR");
  const [ativo, setAtivo] = useState(usuario?.ativo ?? true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSave() {
    setErro("");
    if (!name.trim() || !email.trim()) { setErro("Nome e email são obrigatórios."); return; }
    if (!usuario && !password) { setErro("Defina uma senha."); return; }

    setSaving(true);
    try {
      const url = usuario ? `/api/admin/usuarios/${usuario.id}` : "/api/admin/usuarios";
      const method = usuario ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: password || undefined, role, ativo }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro");
      }

      router.push("/admin/usuarios");
      router.refresh();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">
          {usuario ? "Nova senha (deixe vazio para não alterar)" : "Senha"}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">Papel</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "ADMIN" | "EDITOR")}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-colors [&>option]:text-brand-dark"
        >
          <option value="ADMIN">Admin</option>
          <option value="EDITOR">Editor</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="ativo"
          checked={ativo}
          onChange={(e) => setAtivo(e.target.checked)}
          className="accent-brand-gold"
        />
        <label htmlFor="ativo" className="text-sm text-white/70">Usuário ativo</label>
      </div>

      {erro && <p className="text-brand-rose text-sm bg-brand-rose/10 border border-brand-rose/20 rounded-lg px-3 py-2">{erro}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="bg-brand-gold hover:bg-brand-gold-dark disabled:opacity-60 text-brand-dark font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
      >
        {saving ? "Salvando..." : usuario ? "Salvar alterações" : "Criar usuário"}
      </button>
    </div>
  );
}
