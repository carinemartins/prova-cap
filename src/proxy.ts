import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";

const { auth } = NextAuth(authConfig);

export const proxy = auth(async function proxy(req: NextAuthRequest) {
  // auth(fn) não aplica o callback `authorized` sozinho quando recebe uma
  // função — precisa ser checado manualmente aqui, senão /admin/* fica público.
  // authConfig.callbacks.authorized só retorna boolean neste projeto.
  const authorized = await authConfig.callbacks.authorized({ request: req, auth: req.auth }) as boolean;

  if (!authorized) {
    const signInUrl = req.nextUrl.clone();
    signInUrl.pathname = "/admin/login";
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return NextResponse.redirect(signInUrl);
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", req.nextUrl.pathname);
  return response;
});

export const config = {
  matcher: ["/admin/:path*"],
};
