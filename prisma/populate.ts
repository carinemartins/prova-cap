/**
 * Popula o banco com questões, grupos e configurações da prova CAP.
 * Apaga dados existentes antes de inserir — seguro para reexecutar.
 * Uso: npm run db:populate
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const dbUrl = new URL(process.env.DATABASE_URL!);
const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port) || 3306,
  user: dbUrl.username,
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.slice(1),
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Limpar dados existentes ─────────────────────────────────────────────
  await prisma.resposta.deleteMany();
  await prisma.submissao.deleteMany();
  await prisma.opcao.deleteMany();
  await prisma.questao.deleteMany();
  await prisma.grupo.deleteMany();
  await prisma.configuracao.deleteMany();

  // ── Grupos ──────────────────────────────────────────────────────────────
  const grupos = [
    { numero: 1, nome: "Roberta" },
    { numero: 2, nome: "Andressa" },
    { numero: 3, nome: "Evelin" },
    { numero: 4, nome: "Camilla" },
    { numero: 5, nome: "Suellen" },
    { numero: 6, nome: "Tallita" },
    { numero: 7, nome: "Nicole" },
  ];
  for (const g of grupos) {
    await prisma.grupo.create({ data: { ...g, ativo: true } });
  }
  console.log(`✓ ${grupos.length} grupos criados`);

  // ── Configurações ────────────────────────────────────────────────────────
  const configuracoes = [
    { chave: "prova_titulo", valor: "Prova Treinamento Conserto de Roupas Lucrativo - Alunas CAP" },
    {
      chave: "prova_descricao",
      valor:
        "Chegou a hora da Prova Final ✨\n\nAo finalizar a prova, você vai receber o link para emitir o seu certificado 🏅\n\nEsse treinamento foi só o primeiro passo para você viver da costura.\nAgora, a decisão é sua:\n\n➡️ Se tornar uma CAP, reconhecida, bem paga, cheia de clientes e faturando de R$3.000 a R$8.000 por mês…\n➡️ Ou seguir do mesmo jeito, vendo outras mulheres conquistarem o futuro que você também sonha ter.",
    },
    {
      chave: "prova_mensagem_sucesso",
      valor:
        "Ao finalizar a prova, você vai receber o link para emitir o seu certificado 🏅\n\nTe espero dentro da CAP.\n\n🚀 Prof. Carine ✂️💚",
    },
    { chave: "prova_aberta", valor: "true" },
  ];
  for (const c of configuracoes) {
    await prisma.configuracao.create({ data: c });
  }
  console.log(`✓ ${configuracoes.length} configurações criadas`);

  // ── Questões ─────────────────────────────────────────────────────────────
  const questoes = [
    {
      ordem: 1,
      texto: 'Segundo a professora Carine é um mito (mentira) o dito popular. "Consertar roupa dá mais trabalho do que fazer uma do zero".',
      tipo: "VERDADEIRO_FALSO" as const,
      pontos: 1,
      opcoes: [
        { texto: "a) Verdadeiro", correta: true, ordem: 1 },
        { texto: "b) Falso", correta: false, ordem: 2 },
      ],
    },
    {
      ordem: 2,
      texto: "O pouso de avião é uma técnica ensinada pela professora Carine para?",
      tipo: "MULTIPLA_ESCOLHA" as const,
      pontos: 1,
      opcoes: [
        { texto: "a) Cortar o cós da calça da forma certa", correta: false, ordem: 1 },
        { texto: "b) Fazer o acabamento na barra", correta: false, ordem: 2 },
        { texto: "c) Fazer o ajuste lateral sem defeito", correta: false, ordem: 3 },
        { texto: "d) Para o cliente que vai viajar", correta: true, ordem: 4 },
      ],
    },
    {
      ordem: 3,
      texto: "Qual das opções abaixo é uma primícia do conserto profissional?",
      tipo: "MULTIPLA_ESCOLHA" as const,
      pontos: 1,
      opcoes: [
        { texto: "a) Usar lâmina no desmanche", correta: false, ordem: 1 },
        { texto: "b) Voltar todas as etiquetas para peça", correta: false, ordem: 2 },
        { texto: "c) Trabalhar com margem de segurança", correta: true, ordem: 3 },
        { texto: "d) Fazer o conserto de roupas e depois cobrar", correta: false, ordem: 4 },
      ],
    },
    {
      ordem: 4,
      texto: "O martelo e o alicate são ferramentas desnecessárias no conserto de roupas?",
      tipo: "VERDADEIRO_FALSO" as const,
      pontos: 1,
      opcoes: [
        { texto: "a) Verdadeiro", correta: false, ordem: 1 },
        { texto: "b) Falso", correta: true, ordem: 2 },
      ],
    },
    {
      ordem: 5,
      texto: "Dar garantia do serviço fideliza o cliente. A prof. Carine ensina que para dar a garantia do serviço a costureira precisa?",
      tipo: "MULTIPLA_ESCOLHA" as const,
      pontos: 1,
      opcoes: [
        { texto: "a) Fazer a nota para o cliente", correta: false, ordem: 1 },
        { texto: "b) Marcar a roupa no corpo do cliente", correta: false, ordem: 2 },
        { texto: "c) Trazer uma roupa para servir de médida", correta: false, ordem: 3 },
        { texto: "d) Confiar que o cliente marcou certo a roupa", correta: true, ordem: 4 },
      ],
    },
    {
      ordem: 6,
      texto: "A técnica do cataponto da prof. Carine é para?",
      tipo: "MULTIPLA_ESCOLHA" as const,
      pontos: 1,
      opcoes: [
        { texto: "a) Não perder o ponto", correta: false, ordem: 1 },
        { texto: "b) Fazer uma reposição de costura perfeita na costura", correta: false, ordem: 2 },
        { texto: "c) Ter mais clientes", correta: false, ordem: 3 },
        { texto: "d) Fazer a cobrança do conserto", correta: true, ordem: 4 },
      ],
    },
    {
      ordem: 7,
      texto: "A barra industrial é feita na calça quando?",
      tipo: "MULTIPLA_ESCOLHA" as const,
      pontos: 1,
      opcoes: [
        { texto: "a) Tem marquinhas de descoloração na barra", correta: false, ordem: 1 },
        { texto: "b) Não for calça jeans", correta: false, ordem: 2 },
        { texto: "c) A calça está curta", correta: false, ordem: 3 },
        { texto: "d) A barra da calça é inteira do mesmo tom de cor", correta: true, ordem: 4 },
      ],
    },
    {
      ordem: 8,
      texto: "O Plano CAPTA que faz parte do curso da prof. Carine é para atrair clientes todos os dias.",
      tipo: "VERDADEIRO_FALSO" as const,
      pontos: 1,
      opcoes: [
        { texto: "a) Verdadeiro", correta: true, ordem: 1 },
        { texto: "b) Falso", correta: false, ordem: 2 },
      ],
    },
    {
      ordem: 9,
      texto: "Ao receber uma sacola com muitas roupas o indicado é:",
      tipo: "MULTIPLA_ESCOLHA" as const,
      pontos: 1,
      opcoes: [
        { texto: "a) Passar um orçamento picado para não assustar a cliente", correta: false, ordem: 1 },
        { texto: "b) Informar o cliente que vai analisar as peças e depois passar o orçamento para aprovação", correta: true, ordem: 2 },
        { texto: "c) Passar o orçamento com o emissor de notas profissional", correta: false, ordem: 3 },
        { texto: "d) Dar um desconto para o cliente não desistir do trabalho", correta: false, ordem: 4 },
      ],
    },
    {
      ordem: 10,
      texto: "Para não estragar a roupa do cliente é preciso aplicar:\n✔️ Pilares CAP - 3 A's\n✔️ Plano de desmanche\n✔️ Trabalhar com margem de segurança",
      tipo: "VERDADEIRO_FALSO" as const,
      pontos: 1,
      opcoes: [
        { texto: "a) Verdadeiro", correta: true, ordem: 1 },
        { texto: "b) Falso", correta: false, ordem: 2 },
      ],
    },
    {
      ordem: 11,
      texto: "Atualmente, você depende de alguém na decisão de se tornar aluna do Método CAP? Se sim, quem?",
      tipo: "ABERTA" as const,
      pontos: 0,
      opcoes: [],
    },
    {
      ordem: 12,
      texto: "Você achou o valor do curso da professora caro? Qual é o valor máximo que você conseguiria investir em um curso dela agora?",
      tipo: "ABERTA" as const,
      pontos: 0,
      opcoes: [],
    },
    {
      ordem: 13,
      texto: "Me ajude a melhorar o Treinamento gratuito. O que você mais gostou e o que não gostou, o que você gostaria de ter aprendido mais?",
      tipo: "ABERTA" as const,
      pontos: 0,
      opcoes: [],
    },
    {
      ordem: 14,
      texto: "Parabéns por chegar até aqui. Agora me conta, você já decidiu ser uma CAP?",
      tipo: "ABERTA" as const,
      pontos: 0,
      opcoes: [],
    },
  ];

  for (const q of questoes) {
    await prisma.questao.create({
      data: {
        texto: q.texto,
        tipo: q.tipo,
        pontos: q.pontos,
        ordem: q.ordem,
        ativa: true,
        opcoes: { create: q.opcoes },
      },
    });
  }
  console.log(`✓ ${questoes.length} questões criadas`);

  console.log("\n✅ Banco populado com sucesso!");
  console.log("→ Acesse /admin/setup para criar o primeiro administrador (se ainda não criou).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
