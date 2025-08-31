/*
  Warnings:

  - You are about to drop the column `programSaatiId` on the `sinif_defteri` table. All the data in the column will be lost.
  - You are about to drop the `program_saatleri` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `program_sablonlari` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[planId,haftaId,dersProgramiId]` on the table `sinif_defteri` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dersProgramiId` to the `sinif_defteri` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DersGunu" AS ENUM ('PAZARTESI', 'SALI', 'CARSAMBA', 'PERSEMBE', 'CUMA');

-- DropForeignKey
ALTER TABLE "program_saatleri" DROP CONSTRAINT "program_saatleri_programSablonuId_fkey";

-- DropForeignKey
ALTER TABLE "sinif_defteri" DROP CONSTRAINT "sinif_defteri_programSaatiId_fkey";

-- DropIndex
DROP INDEX "sinif_defteri_planId_haftaId_programSaatiId_key";

-- AlterTable
ALTER TABLE "sinif_defteri" DROP COLUMN "programSaatiId",
ADD COLUMN     "dersProgramiId" TEXT NOT NULL;

-- DropTable
DROP TABLE "program_saatleri";

-- DropTable
DROP TABLE "program_sablonlari";

-- CreateTable
CREATE TABLE "ders_programi_sablonlari" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "aciklama" TEXT,
    "maxDersSaat" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ders_programi_sablonlari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ders_programlari" (
    "id" TEXT NOT NULL,
    "gun" "DersGunu" NOT NULL,
    "dersSaat" INTEGER NOT NULL,
    "sinifId" TEXT NOT NULL,
    "dersId" TEXT,
    "sablonId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ders_programlari_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ders_programi_sablonlari_ad_key" ON "ders_programi_sablonlari"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "ders_programlari_sinifId_sablonId_gun_dersSaat_key" ON "ders_programlari"("sinifId", "sablonId", "gun", "dersSaat");

-- CreateIndex
CREATE UNIQUE INDEX "sinif_defteri_planId_haftaId_dersProgramiId_key" ON "sinif_defteri"("planId", "haftaId", "dersProgramiId");

-- AddForeignKey
ALTER TABLE "sinif_defteri" ADD CONSTRAINT "sinif_defteri_dersProgramiId_fkey" FOREIGN KEY ("dersProgramiId") REFERENCES "ders_programlari"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ders_programlari" ADD CONSTRAINT "ders_programlari_sinifId_fkey" FOREIGN KEY ("sinifId") REFERENCES "siniflar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ders_programlari" ADD CONSTRAINT "ders_programlari_dersId_fkey" FOREIGN KEY ("dersId") REFERENCES "dersler"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ders_programlari" ADD CONSTRAINT "ders_programlari_sablonId_fkey" FOREIGN KEY ("sablonId") REFERENCES "ders_programi_sablonlari"("id") ON DELETE CASCADE ON UPDATE CASCADE;
