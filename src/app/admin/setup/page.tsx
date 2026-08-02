"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [edicaoNome, setEdicaoNome] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Se já existe admin, redireciona para login
    fetch("/api/admin/setup")
      .then((r) => r.json())
      .then((data) => {
        if (!data.setupNeeded) router.replace("/admin/login");
        else setChecking(false);
      });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (password !== confirm) {
      setErro("As senhas não coincidem.");
      return;
    }
    if (password.length < 8) {
      setErro("A senha deve ter ao menos 8 caracteres.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, edicaoNome }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErro(data.error ?? "Erro ao criar administrador.");
      return;
    }

    router.push("/admin/login");
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark">
        <p className="text-white/40 text-sm">Verificando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-gold/5" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-brand-rose/5" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 mb-4">
            <span className="text-brand-gold text-2xl font-bold" style={{ fontFamily: "var(--font-playfair)" }}>C</span>
          </div>
          <h1 className="text-white text-xl font-bold" style={{ fontFamily: "var(--font-playfair)" }}>
            Configuração Inicial
          </h1>
          <p className="text-white/40 text-sm mt-1">Crie o primeiro administrador do sistema</p>
        </div>

        <div className="bg-brand-dark-mid rounded-2xl border border-white/10 p-7">
          <div className="mb-5 p-3 rounded-xl bg-brand-gold/10 border border-brand-gold/20">
            <p className="text-brand-gold text-xs font-medium">
              Este formulário só está disponível na primeira configuração do sistema. Após criar o administrador, este acesso será bloqueado.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/30 transition-colors"
                placeholder="Seu nome"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/30 transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/30 transition-colors"
                placeholder="Mínimo 8 caracteres"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Confirmar senha</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/30 transition-colors"
                placeholder="Repita a senha"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Nome da edição atual</label>
              <input
                type="text"
                value={edicaoNome}
                onChange={(e) => setEdicaoNome(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/30 transition-colors"
                placeholder="Ex: CAP23"
                required
              />
            </div>

            {erro && (
              <p className="text-brand-rose text-sm bg-brand-rose/10 border border-brand-rose/20 rounded-lg px-3 py-2">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-gold hover:bg-brand-gold-dark disabled:opacity-50 text-brand-dark font-semibold py-3 rounded-xl text-sm transition-colors mt-2"
            >
              {loading ? "Criando..." : "Criar administrador"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
