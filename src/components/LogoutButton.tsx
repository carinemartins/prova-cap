"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/40 hover:bg-white/8 hover:text-brand-rose transition-colors"
    >
      Sair
    </button>
  );
}
