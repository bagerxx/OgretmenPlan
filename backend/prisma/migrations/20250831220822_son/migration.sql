/*
  Warnings:

  - You are about to drop the `sinif_ders` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "sinif_ders" DROP CONSTRAINT "sinif_ders_dersId_fkey";

-- DropForeignKey
ALTER TABLE "sinif_ders" DROP CONSTRAINT "sinif_ders_sinifId_fkey";

-- DropTable
DROP TABLE "sinif_ders";

-- CreateTable
CREATE TABLE "_DersToSinif" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DersToSinif_AB_unique" ON "_DersToSinif"("A", "B");

-- CreateIndex
CREATE INDEX "_DersToSinif_B_index" ON "_DersToSinif"("B");

-- AddForeignKey
ALTER TABLE "_DersToSinif" ADD CONSTRAINT "_DersToSinif_A_fkey" FOREIGN KEY ("A") REFERENCES "dersler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DersToSinif" ADD CONSTRAINT "_DersToSinif_B_fkey" FOREIGN KEY ("B") REFERENCES "siniflar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
