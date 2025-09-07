/*
  Warnings:

  - You are about to drop the `deger` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `okur_yazarlik_becerisi` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `olcme_degerlendirme` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sosyal_duygusal_beceri` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."deger" DROP CONSTRAINT "deger_temaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."okur_yazarlik_becerisi" DROP CONSTRAINT "okur_yazarlik_becerisi_temaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."olcme_degerlendirme" DROP CONSTRAINT "olcme_degerlendirme_temaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."sosyal_duygusal_beceri" DROP CONSTRAINT "sosyal_duygusal_beceri_temaId_fkey";

-- AlterTable
ALTER TABLE "public"."tema" ADD COLUMN     "degerler" JSONB,
ADD COLUMN     "okurYazarlikBecerileri" JSONB,
ADD COLUMN     "olcmeDegerlendirme" TEXT,
ADD COLUMN     "sosyalDuygusalBeceriler" JSONB;

-- DropTable
DROP TABLE "public"."deger";

-- DropTable
DROP TABLE "public"."okur_yazarlik_becerisi";

-- DropTable
DROP TABLE "public"."olcme_degerlendirme";

-- DropTable
DROP TABLE "public"."sosyal_duygusal_beceri";
