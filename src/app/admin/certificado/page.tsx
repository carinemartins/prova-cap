"use client";

import { useEffect, useRef, useState } from "react";
import {
  FONTES, LAYOUT_PADRAO, carregarFontes, estiloNome, gerarCertificadoPng,
  type Alinhamento, type CertificadoLayout,
} from "@/lib/certificado";

const LIMITE_UPLOAD = 3.5 * 1024 * 1024;
const LARGURA_MAXIMA = 3508; // A4 paisagem a 300 dpi

const inputCls =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-colors";
const labelCls = "block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5";

/** Reduz/comprime a imagem no navegador para caber no limite de upload. */
async function prepararImagem(arquivo: File): Promise<Blob> {
  if (arquivo.size <= LIMITE_UPLOAD) return arquivo;

  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, LARGURA_MAXIMA / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  for (const qualidade of [0.92, 0.85, 0.75, 0.6]) {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", qualidade));
    if (blob && blob.size <= LIMITE_UPLOAD) return blob;
  }
  throw new Error("Não foi possível reduzir a imagem para menos de 3,5 MB.");
}

export default function CertificadoPage() {
  const [layout, setLayout] = useState<CertificadoLayout>(LAYOUT_PADRAO);
  const [edicao, setEdicao] = useState("");
  const [nomeExemplo, setNomeExemplo] = useState("Maria Aparecida da Silva");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [arrastando, setArrastando] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    carregarFontes();
    fetch("/api/admin/certificado")
      .then((r) => r.json())
      .then(({ edicao, ...data }) => {
        setLayout(data);
        setEdicao(edicao);
        setLoading(false);
      });
  }, []);

  function avisar(tipo: "ok" | "erro", texto: string) {
    setMsg({ tipo, texto });
    if (tipo === "ok") setTimeout(() => setMsg(null), 3000);
  }

  const set = <K extends keyof CertificadoLayout>(k: K, v: CertificadoLayout[K]) =>
    setLayout((l) => ({ ...l, [k]: v }));

  // ── Arrastar o nome ────────────────────────────────────────────────────────
  function moverPara(e: React.PointerEvent) {
    const rect = previewRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLayout((l) => ({
      ...l,
      nomeX: Math.round(Math.min(100, Math.max(0, x)) * 10) / 10,
      nomeY: Math.round(Math.min(100, Math.max(0, y)) * 10) / 10,
    }));
  }

  function onPointerDown(e: React.PointerEvent) {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setArrastando(true);
    moverPara(e);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (arrastando) moverPara(e);
  }

  function onPointerUp() {
    setArrastando(false);
  }

  // ── Ações ──────────────────────────────────────────────────────────────────
  async function salvar() {
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/admin/certificado", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(layout),
    });
    setSaving(false);
    if (!res.ok) return avisar("erro", "Erro ao salvar. Apenas administradores podem alterar.");
    setLayout(await res.json());
    avisar("ok", "✓ Certificado salvo");
  }

  async function enviarImagem(arquivo: File) {
    setEnviando(true);
    setMsg(null);
    try {
      const blob = await prepararImagem(arquivo);
      const form = new FormData();
      form.append("imagem", blob, arquivo.name);
      const res = await fetch("/api/admin/certificado/imagem", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao enviar imagem.");
      // Mantém os ajustes ainda não salvos; só troca a imagem.
      setLayout((l) => ({ ...l, imagemUrl: data.imagemUrl }));
      avisar("ok", "✓ Imagem enviada");
    } catch (err) {
      avisar("erro", err instanceof Error ? err.message : "Erro ao enviar imagem.");
    } finally {
      setEnviando(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function restaurarImagem() {
    if (!confirm("Voltar para a imagem padrão do certificado?")) return;
    const res = await fetch("/api/admin/certificado/imagem", { method: "DELETE" });
    if (!res.ok) return avisar("erro", "Erro ao remover imagem.");
    const data = await res.json();
    setLayout((l) => ({ ...l, imagemUrl: data.imagemUrl }));
  }

  async function baixarTeste() {
    try {
      const blob = await gerarCertificadoPng(layout, nomeExemplo || "Nome da Aluna");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "certificado-teste.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      avisar("erro", err instanceof Error ? err.message : "Erro ao gerar certificado.");
    }
  }

  if (loading) {
    return <div className="p-8 text-white/40 text-sm">Carregando certificado...</div>;
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>
          Certificado
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Modelo da edição <span className="text-brand-gold font-medium">{edicao}</span> — arraste o nome
          da aluna para posicioná-lo sobre o certificado
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
        {/* Prévia */}
        <div className="space-y-3">
          <div
            ref={previewRef}
            className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/40 select-none touch-none"
            style={{ containerType: "inline-size" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={layout.imagemUrl} alt="Fundo do certificado" className="w-full h-auto block" draggable={false} />
            <span
              style={estiloNome(layout)}
              className={`cursor-move outline-dashed outline-1 outline-offset-4 ${
                arrastando ? "outline-brand-gold" : "outline-brand-gold/60"
              }`}
            >
              {nomeExemplo || "Nome da Aluna"}
            </span>
          </div>
          <p className="text-xs text-white/30">
            Clique ou arraste sobre a imagem para mover o nome. Posição: {layout.nomeX}% × {layout.nomeY}%
          </p>
        </div>

        {/* Controles */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-5 space-y-5">
          <div>
            <label className={labelCls}>Imagem de fundo</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && enviarImagem(e.target.files[0])}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={enviando}
                className="flex-1 bg-white/8 hover:bg-white/12 disabled:opacity-50 text-white/85 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                {enviando ? "Enviando..." : "Enviar imagem"}
              </button>
              <button
                type="button"
                onClick={restaurarImagem}
                title="Usar imagem padrão"
                className="bg-white/5 hover:bg-white/10 text-white/50 text-sm px-3 py-2.5 rounded-xl transition-colors"
              >
                Padrão
              </button>
            </div>
            <p className="text-[11px] text-white/30 mt-1.5">PNG, JPG ou WEBP. Imagens grandes são comprimidas.</p>
          </div>

          <div>
            <label className={labelCls}>Nome de exemplo</label>
            <input type="text" value={nomeExemplo} onChange={(e) => setNomeExemplo(e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Fonte</label>
            <select value={layout.fonte} onChange={(e) => set("fonte", e.target.value)} className={inputCls}>
              {FONTES.map((f) => (
                <option key={f} value={f} className="bg-brand-dark" style={{ fontFamily: f }}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Tamanho — {layout.fonteTamanho.toFixed(1)}</label>
            <input
              type="range" min={1} max={10} step={0.1}
              value={layout.fonteTamanho}
              onChange={(e) => set("fonteTamanho", Number(e.target.value))}
              className="w-full accent-brand-gold"
            />
          </div>

          <div className="flex gap-4">
            <div>
              <label className={labelCls}>Cor</label>
              <input
                type="color" value={layout.cor}
                onChange={(e) => set("cor", e.target.value)}
                className="h-10 w-14 bg-transparent rounded cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <label className={labelCls}>Alinhamento</label>
              <div className="flex rounded-xl overflow-hidden border border-white/10">
                {(["left", "center", "right"] as Alinhamento[]).map((a) => (
                  <button
                    key={a} type="button"
                    onClick={() => set("alinhamento", a)}
                    className={`flex-1 py-2.5 text-xs transition-colors ${
                      layout.alinhamento === a ? "bg-brand-gold/15 text-brand-gold" : "text-white/50 hover:bg-white/5"
                    }`}
                  >
                    {{ left: "Esq.", center: "Centro", right: "Dir." }[a]}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-white/30 -mt-3">
            Com &quot;Centro&quot;, nomes longos crescem para os dois lados a partir do ponto marcado.
          </p>

          <div className="flex items-center justify-between py-3 border-t border-white/10">
            <div>
              <p className="text-sm font-medium text-white/85">Emitir certificado</p>
              <p className="text-xs text-white/35 mt-0.5">Mostrar à aluna após enviar a prova</p>
            </div>
            <button
              type="button"
              onClick={() => set("ativo", !layout.ativo)}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
                layout.ativo ? "bg-brand-gold" : "bg-white/10"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform mt-0.5 ${
                  layout.ativo ? "translate-x-5.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div className="space-y-2">
            <button
              type="button" onClick={salvar} disabled={saving}
              className="w-full bg-brand-gold hover:bg-brand-gold-dark disabled:opacity-50 text-brand-dark font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              {saving ? "Salvando..." : "Salvar certificado"}
            </button>
            <button
              type="button" onClick={baixarTeste}
              className="w-full bg-white/5 hover:bg-white/10 text-white/70 text-sm px-6 py-2.5 rounded-xl transition-colors"
            >
              Baixar certificado de teste
            </button>
            {msg && (
              <p className={`text-sm font-medium ${msg.tipo === "ok" ? "text-green-400" : "text-red-400"}`}>
                {msg.texto}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
