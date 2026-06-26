"use client";

import { useEffect, useState } from "react";

// ─── AJUSTES DE POSIÇÃO DO NOME ─────────────────────────────────────────────
const NOME_TOP  = "30%";   // sobe/desce o nome sobre o certificado
const NOME_LEFT = "12%";   // move para esquerda/direita (50% = centro)
const NOME_TAMANHO = 0.034; // tamanho da fonte ÷ largura da imagem (aumente para fonte maior)
// ─────────────────────────────────────────────────────────────────────────────

export default function Certificado({ nome }: { nome: string }) {
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const id = "dancing-script-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  async function salvarImagem() {
    setSalvando(true);
    try {
      // 1. Carrega a imagem de fundo
      const img = new Image();
      img.src = "/certificado-fundo.png";
      await new Promise<void>((resolve, reject) => {
        img.onload  = () => resolve();
        img.onerror = () => reject(new Error("Imagem do certificado não encontrada."));
      });

      // 2. Desenha no canvas
      const canvas = document.createElement("canvas");
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      // 3. Escreve o nome com a fonte cursiva
      const fontSize = Math.round(canvas.width * NOME_TAMANHO);
      await document.fonts.load(`bold ${fontSize}px "Dancing Script"`);
      ctx.font         = `bold ${fontSize}px "Dancing Script", cursive`;
      ctx.fillStyle    = "#1a1208";
      ctx.textBaseline = "top";
      const x = canvas.width  * (parseFloat(NOME_LEFT) / 100);
      const y = canvas.height * (parseFloat(NOME_TOP)  / 100);
      ctx.fillText(nome, x, y);

      // 4. Compartilha ou baixa
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/png"));
      const file = new File([blob], "certificado-cap.png", { type: "image/png" });

      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile && navigator.canShare?.({ files: [file] })) {
        // Mobile: abre menu nativo com "Salvar na Galeria"
        await navigator.share({ files: [file], title: "Meu Certificado CAP" });
      } else {
        // Desktop: download direto
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "certificado-cap.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao gerar o certificado.";
      alert(msg);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center px-5 py-10 gap-8 animate-fade-in">
      <div className="text-center space-y-2 animate-[slideUp_0.5s_ease-out_both]">
        <div className="text-5xl mb-4">🏅</div>
        <p className="text-brand-gold text-[11px] font-bold tracking-[0.3em] uppercase">Parabéns!</p>
        <h2 className="text-white text-2xl font-bold" style={{ fontFamily: "var(--font-playfair)" }}>
          Você foi aprovada!
        </h2>
        <p className="text-white/40 text-sm">Seu certificado está pronto para salvar.</p>
      </div>

      {/* Preview */}
      <div className="w-full max-w-lg animate-[slideUp_0.5s_ease-out_0.15s_both] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/certificado-fundo.png"
          alt="Certificado"
          className="w-full h-auto block"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute" style={{ top: NOME_TOP, left: NOME_LEFT }}>
            <span
              style={{
                fontFamily: "'Dancing Script', cursive",
                fontSize: "clamp(14px, 3.5vw, 28px)",
                fontWeight: 700,
                color: "#1a1208",
                whiteSpace: "nowrap",
              }}
            >
              {nome}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={salvarImagem}
        disabled={salvando}
        className="w-full max-w-lg bg-brand-gold hover:bg-brand-gold-dark disabled:opacity-60 text-brand-dark font-bold py-5 rounded-2xl text-base tracking-wide transition-all active:scale-[0.98] shadow-lg shadow-brand-gold/20 animate-[slideUp_0.5s_ease-out_0.3s_both]"
      >
        {salvando ? "Gerando imagem…" : "Salvar certificado →"}
      </button>

      <p className="text-white/20 text-xs text-center animate-[slideUp_0.5s_ease-out_0.4s_both]">
        No celular, escolha "Salvar na Galeria" após tocar no botão.
      </p>
    </div>
  );
}
