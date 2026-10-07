-- DropForeignKey
ALTER TABLE `Resposta` DROP FOREIGN KEY `Resposta_submissaoId_fkey`;

-- DropIndex
DROP INDEX `Resposta_submissaoId_questaoId_key` ON `Resposta`;

-- AlterTable
ALTER TABLE `Questao` MODIFY `tipo` ENUM('MULTIPLA_ESCOLHA', 'VERDADEIRO_FALSO', 'ABERTA', 'MULTIPLA_SELECAO') NOT NULL DEFAULT 'MULTIPLA_ESCOLHA';

-- AlterTable
ALTER TABLE `Opcao` ADD COLUMN `permiteTexto` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Submissao` ADD COLUMN `email` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Resposta_submissaoId_questaoId_idx` ON `Resposta`(`submissaoId`, `questaoId`);

-- AddForeignKey
ALTER TABLE `Resposta` ADD CONSTRAINT `Resposta_submissaoId_fkey` FOREIGN KEY (`submissaoId`) REFERENCES `Submissao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

