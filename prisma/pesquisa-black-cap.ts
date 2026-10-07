/**
 * Configura uma edição como a pesquisa BLACK CAP VITALÍCIA (cópia do Google Forms
 * https://docs.google.com/forms/d/e/1FAIpQLScFFMTN_k2NbHB0axtm3_9CMZp5t3UAtYeTgDPwlsL-DT-vmw/viewform).
 *
 * Substitui as questões da edição e grava título, descrição, mensagem e modo "pesquisa".
 * Não mexe no PDF do ebook nem nas outras edições. Recusa se a edição já tem respostas.
 * Nome, telefone e e-mail do formulário são coletados na tela de identificação.
 *
 * Uso: npx tsx prisma/pesquisa-black-cap.ts "<nome da edição>"
 */
import "dotenv/config";
import { PrismaClient, type TipoQuestao } from "../src/generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const dbUrl = new URL(process.env.DATABASE_URL!);
const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port) || 3306,
    user: dbUrl.username,
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.slice(1),
    allowPublicKeyRetrieval: true,
  }),
});

const OUTRO = { texto: "Outro", permiteTexto: true };

type Pergunta = { texto: string; tipo: TipoQuestao; opcoes?: (string | typeof OUTRO)[] };

const CONFIGS = {
  modo: "pesquisa",
  prova_aberta: "true",
  prova_titulo: "BLACK CAP VITALÍCIA - A melhor oferta da história do conserto de roupas! ♾️✂️",
  prova_descricao: `Olá, Amiga da costura,
Vem aí a BLACK CAP VITALÍCIA, um evento com uma oportunidade ABSURDA: a CAP + 4 CURSOS DE ESPECIALIZAÇÃO + 2 NOVOS CURSOS + PRESENTES EXCLUSIVOS, com acesso VITALÍCIO, no menor preço do ano!
Ajude a melhorar ainda mais ainda essa oferta, para isso responda está pesquisa. É rapidinho e quem responder a pesquisa ganha um Mapa de Atendimento em uma Peça com Varios Serviços, e ainda concorrer no dia 11/11, a um Kit de ferramentas completo do conserto de roupas: a nossa MALETA DOS MILAGRES!
Conto com você,
Prof. Carine Martins ✂️💚`,
  ebook_titulo: "Mapa de Atendimento em uma Peça com Vários Serviços",
  prova_mensagem_sucesso: `Muito obrigada por responder, amiga! 💚

Aqui está o seu presente. Baixe agora e guarde com carinho.

Te espero no evento BLACK CAP VITALÍCIA, dia 11/11 às 20h!

Prof. Carine Martins ✂️💚`,
};

const PERGUNTAS: Pergunta[] = [
  { tipo: "MULTIPLA_ESCOLHA", texto: "Você já comprou algum curso ou produto da professora Carine?", opcoes: ["Sim", "Não"] },
  { tipo: "MULTIPLA_ESCOLHA", texto: "Qual a sua idade?", opcoes: ["Até a 34 anos", "De 35 a 44 anos", "De 45 a 54 anos", "De 55 a 64 anos", "Acima de 65 anos"] },
  { tipo: "MULTIPLA_SELECAO", texto: "Qual máquina de costura você tem?", opcoes: ["Reta", "Overloque", "Galoneira", "Doméstica", "Vou comprar ainda"] },
  {
    tipo: "MULTIPLA_ESCOLHA", texto: "Qual a sua situação hoje no conserto de roupas?",
    opcoes: [
      "Estou começando do zero, Ainda não sei costurar.",
      "Já uso a máquina, mas nunca fiz consertos.",
      "Já faço consertos, mas só para mim e para a família.",
      "Já atendo clientes, mas ainda são poucos.",
      "Já tenho clientes com frequência e quero crescer.",
    ],
  },
  {
    tipo: "MULTIPLA_ESCOLHA", texto: "Qual é a maior dificuldade que você precisa resolver hoje?",
    opcoes: [
      "Aprender a técnica / ter segurança para não estragar a roupa",
      "Saber cobrar (precificar)",
      "Conseguir clientes",
      "Ter tempo para me dedicar",
      "Ter estrutura (máquina, espaço)",
      OUTRO,
    ],
  },
  {
    tipo: "MULTIPLA_ESCOLHA", texto: "Qual o seu principal objetivo com o conserto de roupas?",
    opcoes: ["Ter a minha renda principal", "Ter uma renda extra", "Consertar as minhas roupas e as da família", "Hobby / terapia"],
  },
  {
    tipo: "MULTIPLA_ESCOLHA", texto: "Qual sua faixa de renda mensal? Fique tranquila que essa pesquisa não será divulgada.",
    opcoes: [
      "Não tenho renda",
      "Até R$ 1.000,00",
      "De R$ 1.001,00 até R$ 2.000,00",
      "De R$ 2.001,00 até R$ 3.000,00",
      "De R$ 3.001,00 até R$ 4.000,00",
      "De R$ 4.001,00 até R$ 5.000,00",
      "Acima de R$ 5.001,00",
    ],
  },
  {
    tipo: "MULTIPLA_ESCOLHA", texto: "Quanto você fatura exclusivamente com a costura?",
    opcoes: [
      "Não faturo com a costura",
      "Até R$ 1.000,00",
      "De R$ 1.001,00 até R$ 2.000,00",
      "De R$ 2.001,00 até R$ 3.000,00",
      "De R$ 3.001,00 até R$ 4.000,00",
      "Acima de R$ 4.001,00",
    ],
  },
  { tipo: "MULTIPLA_ESCOLHA", texto: "A quanto tempo você me conhece?", opcoes: ["Menos de 2 meses", "De 2 a 6 meses", "De 6 a 12 meses", "Mais de 1 ano"] },
  {
    tipo: "MULTIPLA_ESCOLHA", texto: "Como você soube da evento da BLACK CAP VITÁLICIA?",
    opcoes: ["Pelo Facebook", "Pelo Instagram", "Pelo Youtube", "Pelo Tiktok", "Pelo WhatsApp", "Uma amiga me indicou"],
  },
  {
    tipo: "MULTIPLA_SELECAO", texto: "O que você precisa entender antes de decidir entrar no CAP?",
    opcoes: [
      "Se consigo aprender no meu nível atual.",
      "Como funciona o suporte para dúvidas.",
      "Como estudar pela internet.",
      "Qual é o investimento e como posso pagar.",
      "Como encaixar o curso na minha rotina.",
      "Se consigo acompanhar mesmo com problemas de saúde.",
      "O que está incluído e por quanto tempo.",
      "Preciso conversar com meu marido ou família.",
      "Meu nome está com restrição e não tenho cartão",
      "Nada me impediria",
      OUTRO,
    ],
  },
  {
    tipo: "MULTIPLA_ESCOLHA", texto: "Se decidir se matricular, qual forma de pagamento facilitaria para você?",
    opcoes: ["À vista.", "Cartão parcelado.", "Boleto parcelado.", "Preciso conhecer os valores para avaliar."],
  },
  {
    tipo: "MULTIPLA_ESCOLHA", texto: "Quem se matricular na BLACK CAP VITALÍCIA concorre à vários presentes. Qual gostaria de ganhar?",
    opcoes: [
      "Kit de linhas completo com todas as cores",
      "Máquina de costura industrial nova",
      "Máquina de costura doméstica nova",
      "Curso presencial EXCLUSIVO com a Prof. Carine",
      OUTRO,
    ],
  },
  {
    tipo: "MULTIPLA_ESCOLHA", texto: "Qual seu nível de comprometimento em participar do evento BLACK CAP VITALÍCIA no dia 11/11, às 20h?",
    opcoes: ["Eu estou comprometida", "Nessa data não posso", "Não estou comprometida"],
  },
  { tipo: "ABERTA", texto: "O que você gostaria de conquistar com a costura?" },
  { tipo: "ABERTA", texto: "Qual pergunta você faria para a professora Carine?" },
  {
    tipo: "ABERTA",
    texto: `Parabéns por chegar até aqui!

Agora me conta... O que você está cansada de viver e quer mudar daqui pra frente?
Aqui vale textão, quanto mais detalhes mais eu poderei te ajudar.
Terminando clique em "enviar" e receba seu presente no link em seguida.`,
  },
];

async function main() {
  const nomeEdicao = process.argv[2];
  const edicoes = await prisma.edicao.findMany({ orderBy: { createdAt: "desc" } });

  if (!nomeEdicao) {
    console.log("Informe o nome da edição. Edições existentes:");
    for (const e of edicoes) console.log(`  - ${e.nome}${e.ativa ? " (ativa)" : ""}`);
    process.exit(1);
  }

  const edicao = edicoes.find((e) => e.nome === nomeEdicao);
  if (!edicao) throw new Error(`Edição "${nomeEdicao}" não encontrada.`);

  const respostas = await prisma.submissao.count({ where: { edicaoId: edicao.id } });
  if (respostas > 0) {
    throw new Error(`A edição "${edicao.nome}" já tem ${respostas} resposta(s); não vou apagar as questões dela.`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.questao.deleteMany({ where: { edicaoId: edicao.id } }); // opções caem em cascata

    for (const [i, p] of PERGUNTAS.entries()) {
      await tx.questao.create({
        data: {
          edicaoId: edicao.id,
          texto: p.texto,
          tipo: p.tipo,
          pontos: 0,
          ordem: i + 1,
          ativa: true,
          opcoes: {
            create: (p.opcoes ?? []).map((o, j) => ({
              texto: typeof o === "string" ? o : o.texto,
              permiteTexto: typeof o !== "string" && o.permiteTexto,
              correta: false,
              ordem: j + 1,
            })),
          },
        },
      });
    }

    for (const [chave, valor] of Object.entries(CONFIGS)) {
      await tx.configuracao.upsert({
        where: { edicaoId_chave: { edicaoId: edicao.id, chave } },
        update: { valor },
        create: { edicaoId: edicao.id, chave, valor },
      });
    }
  });

  const ebook = await prisma.ebookArquivo.findFirst({ where: { edicaoId: edicao.id, completo: true } });
  console.log(`✓ "${edicao.nome}" configurada: ${PERGUNTAS.length} perguntas, modo pesquisa.`);
  console.log(ebook ? `✓ Ebook: ${ebook.nome}` : "⚠ Nenhum PDF de ebook enviado para esta edição ainda.");
  if (!edicao.ativa) console.log("⚠ A edição não está ativa — ative em /admin/edicoes para ela ir ao ar.");
}

main()
  .catch((e) => { console.error(e.message ?? e); process.exit(1); })
  .finally(() => prisma.$disconnect());
