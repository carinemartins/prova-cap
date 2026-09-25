-- CreateTable
CREATE TABLE `CertificadoModelo` (
    `id` VARCHAR(191) NOT NULL,
    `edicaoId` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `imagem` LONGBLOB NULL,
    `imagemTipo` VARCHAR(191) NULL,
    `nomeX` DOUBLE NOT NULL DEFAULT 12,
    `nomeY` DOUBLE NOT NULL DEFAULT 32.4,
    `fonteTamanho` DOUBLE NOT NULL DEFAULT 3.4,
    `fonte` VARCHAR(191) NOT NULL DEFAULT 'Dancing Script',
    `cor` VARCHAR(191) NOT NULL DEFAULT '#1a1208',
    `alinhamento` VARCHAR(191) NOT NULL DEFAULT 'left',
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CertificadoModelo_edicaoId_key`(`edicaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CertificadoModelo` ADD CONSTRAINT `CertificadoModelo_edicaoId_fkey` FOREIGN KEY (`edicaoId`) REFERENCES `Edicao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
