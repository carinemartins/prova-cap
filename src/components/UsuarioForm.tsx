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
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {usuario ? "Nova senha (deixe vazio para não alterar)" : "Senha"}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Papel</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "ADMIN" | "EDITOR")}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
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
          className="accent-purple-600"
        />
        <label htmlFor="ativo" className="text-sm text-gray-700">Usuário ativo</label>
      </div>

      {erro && <p className="text-red-500 text-sm">{erro}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
      >
        {saving ? "Salvando..." : usuario ? "Salvar alterações" : "Criar usuário"}
      </button>
    </div>
  );
}
