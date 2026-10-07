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
import { PrismaClient } from "../src/generated/prisma/client.js";
import { CONFIGS, PERGUNTAS } from "./pesquisa-black-cap.data.js";
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
