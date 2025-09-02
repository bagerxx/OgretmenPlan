/*
  Warnings:

  - You are about to drop the `_DersToSinif` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_DersToSinif" DROP CONSTRAINT "_DersToSinif_A_fkey";

-- DropForeignKey
ALTER TABLE "_DersToSinif" DROP CONSTRAINT "_DersToSinif_B_fkey";

-- DropTable
DROP TABLE "_DersToSinif";

-- CreateTable
CREATE TABLE "sinif_ders" (
    "id" TEXT NOT NULL,
    "sinifId" TEXT NOT NULL,
    "dersId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sinif_ders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ders_saatleri" (
    "id" TEXT NOT NULL,
    "haftalikSaat" INTEGER NOT NULL,
    "dersId" TEXT NOT NULL,
    "sinifId" TEXT NOT NULL,

    CONSTRAINT "ders_saatleri_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sinif_ders_sinifId_dersId_key" ON "sinif_ders"("sinifId", "dersId");

-- CreateIndex
CREATE UNIQUE INDEX "ders_saatleri_dersId_sinifId_key" ON "ders_saatleri"("dersId", "sinifId");

-- AddForeignKey
ALTER TABLE "sinif_ders" ADD CONSTRAINT "sinif_ders_sinifId_fkey" FOREIGN KEY ("sinifId") REFERENCES "siniflar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinif_ders" ADD CONSTRAINT "sinif_ders_dersId_fkey" FOREIGN KEY ("dersId") REFERENCES "dersler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ders_saatleri" ADD CONSTRAINT "ders_saatleri_dersId_fkey" FOREIGN KEY ("dersId") REFERENCES "dersler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ders_saatleri" ADD CONSTRAINT "ders_saatleri_sinifId_fkey" FOREIGN KEY ("sinifId") REFERENCES "siniflar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
