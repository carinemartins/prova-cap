"use client";

import { useEffect, useState } from "react";
import { carregarFontes, estiloNome, gerarCertificadoPng, type CertificadoLayout } from "@/lib/certificado";

// Posição, fonte e imagem vêm do modelo cadastrado em /admin/certificado.
export default function Certificado({ nome, layout }: { nome: string; layout: CertificadoLayout }) {
  const [salvando, setSalvando] = useState(false);

  useEffect(() => { carregarFontes(); }, []);

  async function salvarImagem() {
    setSalvando(true);
    try {
      const blob = await gerarCertificadoPng(layout, nome);
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
      <div
        className="w-full max-w-lg animate-[slideUp_0.5s_ease-out_0.15s_both] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 relative"
        style={{ containerType: "inline-size" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={layout.imagemUrl}
          alt="Certificado"
          className="w-full h-auto block"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <span className="pointer-events-none" style={estiloNome(layout)}>{nome}</span>
      </div>

      <button
        onClick={salvarImagem}
        disabled={salvando}
        className="w-full max-w-lg bg-brand-gold hover:bg-brand-gold-dark disabled:opacity-60 text-brand-dark font-bold py-5 rounded-2xl text-base tracking-wide transition-all active:scale-[0.98] shadow-lg shadow-brand-gold/20 animate-[slideUp_0.5s_ease-out_0.3s_both]"
      >
        {salvando ? "Gerando imagem…" : "Salvar certificado →"}
      </button>

      <p className="text-white/20 text-xs text-center animate-[slideUp_0.5s_ease-out_0.4s_both]">
        No celular, escolha &quot;Salvar na Galeria&quot; após tocar no botão.
      </p>
    </div>
  );
}
