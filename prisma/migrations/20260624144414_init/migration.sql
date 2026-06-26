/*
  Warnings:

  - You are about to drop the column `grupo` on the `submissao` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Questao` MODIFY `texto` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Resposta` MODIFY `textoLivre` TEXT NULL;

-- AlterTable
ALTER TABLE `Submissao` DROP COLUMN `grupo`,
    ADD COLUMN `grupoId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Grupo` (
    `id` VARCHAR(191) NOT NULL,
    `numero` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Grupo_numero_key`(`numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Configuracao` (
    `chave` VARCHAR(191) NOT NULL,
    `valor` TEXT NOT NULL,

    PRIMARY KEY (`chave`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Submissao` ADD CONSTRAINT `Submissao_grupoId_fkey` FOREIGN KEY (`grupoId`) REFERENCES `Grupo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
