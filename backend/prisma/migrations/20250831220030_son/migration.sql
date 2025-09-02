/*
  Warnings:

  - You are about to drop the column `sinifId` on the `planlar` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[dersId,egitiYili]` on the table `planlar` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "planlar" DROP CONSTRAINT "planlar_sinifId_fkey";

-- DropIndex
DROP INDEX "planlar_sinifId_dersId_egitiYili_key";

-- AlterTable
ALTER TABLE "planlar" DROP COLUMN "sinifId";

-- CreateTable
CREATE TABLE "sinif_ders" (
    "id" TEXT NOT NULL,
    "sinifId" TEXT NOT NULL,
    "dersId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sinif_ders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sinif_ders_sinifId_dersId_key" ON "sinif_ders"("sinifId", "dersId");

-- CreateIndex
CREATE UNIQUE INDEX "planlar_dersId_egitiYili_key" ON "planlar"("dersId", "egitiYili");

-- AddForeignKey
ALTER TABLE "sinif_ders" ADD CONSTRAINT "sinif_ders_sinifId_fkey" FOREIGN KEY ("sinifId") REFERENCES "siniflar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinif_ders" ADD CONSTRAINT "sinif_ders_dersId_fkey" FOREIGN KEY ("dersId") REFERENCES "dersler"("id") ON DELETE CASCADE ON UPDATE CASCADE;
