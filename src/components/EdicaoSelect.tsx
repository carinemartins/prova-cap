"use client";

import { useRouter, usePathname } from "next/navigation";

type Edicao = { id: string; nome: string; ativa: boolean };

export default function EdicaoSelect({ edicoes, selecionada }: { edicoes: Edicao[]; selecionada: string }) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.push(`${pathname}?edicaoId=${e.target.value}`);
  }

  return (
    <select
      value={selecionada}
      onChange={handleChange}
      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-colors [&>option]:text-brand-dark"
    >
      {edicoes.map((e) => (
        <option key={e.id} value={e.id}>{e.nome}{e.ativa ? " (ativa)" : ""}</option>
      ))}
    </select>
  );
}
