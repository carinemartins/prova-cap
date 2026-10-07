-- CreateTable
CREATE TABLE `EbookArquivo` (
    `id` VARCHAR(191) NOT NULL,
    `edicaoId` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `tamanho` INTEGER NOT NULL,
    `totalPartes` INTEGER NOT NULL,
    `completo` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `EbookArquivo_edicaoId_idx`(`edicaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EbookParte` (
    `id` VARCHAR(191) NOT NULL,
    `arquivoId` VARCHAR(191) NOT NULL,
    `indice` INTEGER NOT NULL,
    `dados` LONGBLOB NOT NULL,

    UNIQUE INDEX `EbookParte_arquivoId_indice_key`(`arquivoId`, `indice`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EbookArquivo` ADD CONSTRAINT `EbookArquivo_edicaoId_fkey` FOREIGN KEY (`edicaoId`) REFERENCES `Edicao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EbookParte` ADD CONSTRAINT `EbookParte_arquivoId_fkey` FOREIGN KEY (`arquivoId`) REFERENCES `EbookArquivo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

