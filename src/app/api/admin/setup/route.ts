import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Verifica se já existe algum admin — usado pela página de setup
export async function GET() {
  const count = await prisma.user.count({ where: { role: "ADMIN" } });
  return NextResponse.json({ setupNeeded: count === 0 });
}

export async function POST(req: NextRequest) {
  // Proteção: só funciona se não existir nenhum admin
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (adminCount > 0) {
    return NextResponse.json({ error: "Setup já concluído." }, { status: 403 });
  }

  const { name, email, password, edicaoNome } = await req.json();

  if (!name?.trim() || !email?.trim() || !password || !edicaoNome?.trim()) {
    return NextResponse.json({ error: "Todos os campos são obrigatórios." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "A senha deve ter ao menos 8 caracteres." }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Email já cadastrado." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { name: name.trim(), email: email.trim().toLowerCase(), password: hashed, role: "ADMIN", ativo: true },
  });

  const edicao = await prisma.edicao.create({
    data: { nome: edicaoNome.trim(), ativa: true },
  });

  // Cria as configurações padrão da edição
  const configsDefault = [
    { chave: "prova_titulo", valor: "Prova Final das Alunas CAP" },
    { chave: "prova_descricao", valor: "Treinamento Conserto de Roupas Lucrativo" },
    { chave: "prova_mensagem_sucesso", valor: "Prova enviada com sucesso! Parabéns por chegar até aqui." },
    { chave: "prova_aberta", valor: "true" },
  ];

  for (const c of configsDefault) {
    await prisma.configuracao.create({ data: { edicaoId: edicao.id, ...c } });
  }

  return NextResponse.json({ ok: true });
}
