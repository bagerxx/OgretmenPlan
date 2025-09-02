/*
  Warnings:

  - You are about to drop the column `aciklama` on the `dersler` table. All the data in the column will be lost.
  - You are about to drop the column `aciklama` on the `kademeler` table. All the data in the column will be lost.
  - You are about to drop the `ders_saatleri` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ders_saatleri" DROP CONSTRAINT "ders_saatleri_dersId_fkey";

-- DropForeignKey
ALTER TABLE "ders_saatleri" DROP CONSTRAINT "ders_saatleri_sinifId_fkey";

-- AlterTable
ALTER TABLE "dersler" DROP COLUMN "aciklama",
ADD COLUMN     "haftalikSaat" INTEGER NOT NULL DEFAULT 2;

-- AlterTable
ALTER TABLE "kademeler" DROP COLUMN "aciklama";

-- DropTable
DROP TABLE "ders_saatleri";
