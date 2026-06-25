"use client";

import { useState } from "react";

// Coloque o arquivo da logo em /public/logo.png
// Se não encontrar a imagem, exibe o texto da marca como fallback.
export default function LogoHeader() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="text-center select-none">
        <p
          className="text-brand-gold font-bold text-xl tracking-[0.2em] uppercase"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Carine <span className="text-white">CM</span> Martins
        </p>
        <p className="text-white/25 text-[10px] tracking-[0.3em] uppercase mt-1">
          Conserto de Roupas Lucrativo
        </p>
      </div>
    );
  }

  return (
    <img
      src="/logo.png"
      alt="CAP – Carine Martins"
      className="h-14 max-w-[220px] object-contain"
      onError={() => setFailed(true)}
    />
  );
}
