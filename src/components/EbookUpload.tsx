"use client";

import { useState, useEffect, useRef } from "react";

type Ebook = { id: string; nome: string; tamanho: number; createdAt: string };

/**
 * Envio do PDF do ebook da edição ativa. O arquivo vai em partes (a Vercel
 * limita cada requisição a 4,5 MB); o servidor só troca o ebook quando todas chegam.
 */
export default function EbookUpload() {
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [progresso, setProgresso] = useState<number | null>(null);
  const [erro, setErro] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/ebook")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { setEbook(data); setCarregando(false); });
  }, []);

  async function enviar(arquivo: File) {
    setErro("");
    if (!/\.pdf$/i.test(arquivo.name)) { setErro("Escolha um arquivo PDF."); return; }

    setProgresso(0);
    try {
      const ini = await fetch("/api/admin/ebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: arquivo.name, tamanho: arquivo.size }),
      });
      const upload = await ini.json();
      if (!ini.ok) throw new Error(upload.error);

      for (let i = 0; i < upload.totalPartes; i++) {
        const parte = arquivo.slice(i * upload.tamanhoParte, (i + 1) * upload.tamanhoParte);
        const res = await fetch(`/api/admin/ebook/${upload.id}/partes/${i}`, {
          method: "PUT",
          headers: { "Content-Type": "application/octet-stream" },
          body: parte,
        });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Falha ao enviar o PDF.");
        setProgresso(Math.round(((i + 1) / upload.totalPartes) * 100));
      }

      const fim = await fetch(`/api/admin/ebook/${upload.id}/concluir`, { method: "POST" });
      const data = await fim.json();
      if (!fim.ok) throw new Error(data.error);
      setEbook(data);
    } catch (err) {
      setErro(err instanceof Error && err.message ? err.message : "Falha ao enviar o PDF.");
    } finally {
      setProgresso(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remover() {
    if (!confirm("Remover o PDF do ebook?")) return;
    await fetch("/api/admin/ebook", { method: "DELETE" });
    setEbook(null);
  }

  const enviando = progresso !== null;

  return (
    <div>
      <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">
        Arquivo do ebook (PDF)
      </label>

      {carregando ? (
        <p className="text-sm text-white/35">Carregando…</p>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 space-y-3">
          {ebook ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl">📘</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/85 font-medium truncate">{ebook.nome}</p>
                <p className="text-xs text-white/35">
                  {formatarTamanho(ebook.tamanho)} · enviado em {new Date(ebook.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              {!enviando && (
                <button type="button" onClick={remover} className="text-xs text-brand-rose/70 hover:text-brand-rose">
                  Remover
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-white/40">Nenhum PDF enviado ainda.</p>
          )}

          {enviando && (
            <div>
              <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full bg-brand-gold transition-all" style={{ width: `${progresso}%` }} />
              </div>
              <p className="text-xs text-white/40 mt-1">Enviando… {progresso}%</p>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) enviar(f); }}
          />
          <button
            type="button"
            disabled={enviando}
            onClick={() => inputRef.current?.click()}
            className="text-sm text-brand-gold hover:text-brand-gold-light font-medium disabled:opacity-50"
          >
            {ebook ? "Trocar PDF" : "+ Enviar PDF"}
          </button>
        </div>
      )}

      {erro && <p className="text-brand-rose text-sm mt-2">{erro}</p>}
    </div>
  );
}

function formatarTamanho(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
