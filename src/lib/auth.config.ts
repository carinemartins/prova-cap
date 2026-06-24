import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      const isAdminRoute = path.startsWith("/admin");
      const isPublicAdminPage = path === "/admin/login" || path === "/admin/setup";

      if (!isAdminRoute) return true;
      if (isPublicAdminPage) return true;

      // Rotas admin protegidas exigem sessão autenticada
      return !!auth;
    },
  },
} satisfies NextAuthConfig;
