/**
 * Seed de desenvolvimento — apenas questões para facilitar testes.
 * O administrador inicial deve ser criado em /admin/setup.
 * Grupos e configurações devem ser criados pelo painel admin.
 */
import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.questao.count();
  if (count > 0) {
    console.log("Questões já existem, pulando seed.");
    return;
  }

  let edicao = await prisma.edicao.findFirst({ where: { ativa: true } });
  if (!edicao) {
    edicao = await prisma.edicao.create({ data: { nome: "CAP23", ativa: true } });
    console.log(`✓ Edição "${edicao.nome}" criada`);
  }

  const questoes = [
    {
      ordem: 1,
      texto: 'Segundo a professora Carine é um mito (mentira) o dito popular: "Consertar roupa do meu é o trabalho de quem faz uma do zero."',
      tipo: "VERDADEIRO_FALSO" as const,
      pontos: 1,
      opcoes: [
        { texto: "a) Verdadeiro", correta: true, ordem: 1 },
        { texto: "b) Falso", correta: false, ordem: 2 },
      ],
    },
    {
      ordem: 2,
      texto: "O puxo de cós é uma técnica ensinada pela professora Carine para?",
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
        { texto: "a) Usar livretas no desmanche", correta: false, ordem: 1 },
        { texto: "b) Voltar todas as etiquetas para peça", correta: false, ordem: 2 },
        { texto: "c) Trabalhar com margem de segurança", correta: true, ordem: 3 },
        { texto: "d) Fazer o conserto de roupas e depois cobrar", correta: false, ordem: 4 },
      ],
    },
    {
      ordem: 4,
      texto: "O martelo e o cós-late são ferramentas desnecessárias no conserto de roupas?",
      tipo: "VERDADEIRO_FALSO" as const,
      pontos: 1,
      opcoes: [
        { texto: "a) Verdadeiro", correta: false, ordem: 1 },
        { texto: "b) Falso", correta: true, ordem: 2 },
      ],
    },
    {
      ordem: 5,
      texto: "Dar garantia do serviço fideliza o cliente. A prof. Carine ensina que para dar garantia do serviço a costureira precisa?",
      tipo: "MULTIPLA_ESCOLHA" as const,
      pontos: 1,
      opcoes: [
        { texto: "a) Fazer a nota para o cliente", correta: false, ordem: 1 },
        { texto: "b) Marcar ao corpo do cliente", correta: false, ordem: 2 },
        { texto: "c) Trazer uma roupa para servir de molde", correta: false, ordem: 3 },
        { texto: "d) Confiar que o cliente marcou certo a roupa", correta: true, ordem: 4 },
      ],
    },
    {
      ordem: 6,
      texto: "A técnica do cós-pronto do prof. Carine é para?",
      tipo: "MULTIPLA_ESCOLHA" as const,
      pontos: 1,
      opcoes: [
        { texto: "a) Não perder o ponto", correta: false, ordem: 1 },
        { texto: "b) Fazer uma exposição de roupas perfeita na vitrine", correta: false, ordem: 2 },
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
        { texto: "a) Tem margem de descobrida na barra", correta: false, ordem: 1 },
        { texto: "b) Não for calça jeans", correta: false, ordem: 2 },
        { texto: "c) A calça está certa", correta: false, ordem: 3 },
        { texto: "d) A barra da calça é feita do mesmo tom fora de cor", correta: true, ordem: 4 },
      ],
    },
    {
      ordem: 8,
      texto: "O Plano CAPTA que faz parte do curso do prof. Carine é para atrair clientes todos os dias?",
      tipo: "VERDADEIRO_FALSO" as const,
      pontos: 1,
      opcoes: [
        { texto: "a) Verdadeiro", correta: true, ordem: 1 },
        { texto: "b) Falso", correta: false, ordem: 2 },
      ],
    },
    {
      ordem: 9,
      texto: "Ao receber uma sacola com muitas roupas o indicado é?",
      tipo: "MULTIPLA_ESCOLHA" as const,
      pontos: 1,
      opcoes: [
        { texto: "a) Pegar sem orçamento pra não assustar o cliente", correta: false, ordem: 1 },
        { texto: "b) Informar o cliente que vai analisar as peças e depois passar o orçamento para aprovação", correta: true, ordem: 2 },
        { texto: "c) Passar o orçamento com o irmão de notas profissional", correta: false, ordem: 3 },
        { texto: "d) Dar um desconto para o cliente não desistir do trabalho", correta: false, ordem: 4 },
      ],
    },
    {
      ordem: 10,
      texto: "Para não estragar a roupa do cliente é preciso aplicar: ✓ A fina CAP - 3 As; Físico de desmanche; Trabalhar com margem de segurança.",
      tipo: "VERDADEIRO_FALSO" as const,
      pontos: 1,
      opcoes: [
        { texto: "a) Verdadeiro", correta: true, ordem: 1 },
        { texto: "b) Falso", correta: false, ordem: 2 },
      ],
    },
    {
      ordem: 11,
      texto: "Atualmente, você depende de quem na decisão de se tornar aluna do Método CAP? Se sim, quem?",
      tipo: "ABERTA" as const,
      pontos: 0,
      opcoes: [],
    },
    {
      ordem: 12,
      texto: "Você achou o valor do curso da professora caro? Qual é o valor máximo que você conseguiria investir em um curso agora?",
      tipo: "ABERTA" as const,
      pontos: 0,
      opcoes: [],
    },
    {
      ordem: 13,
      texto: "Me ajuda a melhorar o Treinamento gratuito. O que você mais gostou e o que não gostou, o que você gostaria de ter aprendido a mais?",
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
        edicaoId: edicao.id,
        texto: q.texto,
        tipo: q.tipo,
        pontos: q.pontos,
        ordem: q.ordem,
        ativa: true,
        opcoes: { create: q.opcoes },
      },
    });
  }

  console.log(`✓ ${questoes.length} questões criadas.`);
  console.log("→ Acesse /admin/setup para criar o primeiro administrador.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
