-- CreateTable
CREATE TABLE `Edicao` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `ativa` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Edicao_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bootstrap: dados existentes pertencem à edição corrente, batizada de CAP23 e marcada ativa
INSERT INTO `Edicao` (`id`, `nome`, `ativa`, `createdAt`)
VALUES ('c343zz2bz7eeuna724bhi0ld8', 'CAP23', true, CURRENT_TIMESTAMP(3));

-- AlterTable: Grupo — adiciona edicaoId (nullable primeiro pra poder popular)
ALTER TABLE `Grupo` ADD COLUMN `edicaoId` VARCHAR(191) NULL;
UPDATE `Grupo` SET `edicaoId` = 'c343zz2bz7eeuna724bhi0ld8';
ALTER TABLE `Grupo` DROP INDEX `Grupo_numero_key`;
ALTER TABLE `Grupo` MODIFY `edicaoId` VARCHAR(191) NOT NULL;
ALTER TABLE `Grupo` ADD UNIQUE INDEX `Grupo_edicaoId_numero_key`(`edicaoId`, `numero`);

-- AlterTable: Questao — adiciona edicaoId (nullable primeiro pra poder popular)
ALTER TABLE `Questao` ADD COLUMN `edicaoId` VARCHAR(191) NULL;
UPDATE `Questao` SET `edicaoId` = 'c343zz2bz7eeuna724bhi0ld8';
ALTER TABLE `Questao` MODIFY `edicaoId` VARCHAR(191) NOT NULL;

-- AlterTable: Submissao — adiciona edicaoId (nullable primeiro pra poder popular)
ALTER TABLE `Submissao` ADD COLUMN `edicaoId` VARCHAR(191) NULL;
UPDATE `Submissao` SET `edicaoId` = 'c343zz2bz7eeuna724bhi0ld8';
ALTER TABLE `Submissao` MODIFY `edicaoId` VARCHAR(191) NOT NULL;

-- AlterTable: Configuracao — troca a PK de `chave` para um novo `id`, adiciona edicaoId
ALTER TABLE `Configuracao` ADD COLUMN `id` VARCHAR(191) NULL;
ALTER TABLE `Configuracao` ADD COLUMN `edicaoId` VARCHAR(191) NULL;
UPDATE `Configuracao` SET `id` = UUID(), `edicaoId` = 'c343zz2bz7eeuna724bhi0ld8';
ALTER TABLE `Configuracao` DROP PRIMARY KEY;
ALTER TABLE `Configuracao` MODIFY `id` VARCHAR(191) NOT NULL;
ALTER TABLE `Configuracao` MODIFY `edicaoId` VARCHAR(191) NOT NULL;
ALTER TABLE `Configuracao` ADD PRIMARY KEY (`id`);
ALTER TABLE `Configuracao` ADD UNIQUE INDEX `Configuracao_edicaoId_chave_key`(`edicaoId`, `chave`);

-- AddForeignKey
ALTER TABLE `Grupo` ADD CONSTRAINT `Grupo_edicaoId_fkey` FOREIGN KEY (`edicaoId`) REFERENCES `Edicao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Questao` ADD CONSTRAINT `Questao_edicaoId_fkey` FOREIGN KEY (`edicaoId`) REFERENCES `Edicao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Submissao` ADD CONSTRAINT `Submissao_edicaoId_fkey` FOREIGN KEY (`edicaoId`) REFERENCES `Edicao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Configuracao` ADD CONSTRAINT `Configuracao_edicaoId_fkey` FOREIGN KEY (`edicaoId`) REFERENCES `Edicao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
