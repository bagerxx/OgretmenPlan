/*
  Warnings:

  - You are about to drop the `beceriler` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ders_kademe` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ders_programi_sablonlari` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ders_programlari` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ders_saatleri` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dersler` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gunluk_planlar` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `haftalar` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `kademeler` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `kazanimlar` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `plan_becerileri` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `plan_kazanimlari` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `planlar` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sinif_defteri` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sinif_ders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `siniflar` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `temalar` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "HaftaTipi" AS ENUM ('DERS', 'TATIL', 'SINAV');

-- CreateEnum
CREATE TYPE "PlanTipi" AS ENUM ('YILLIK', 'HAFTALIK', 'GUNLUK');

-- CreateEnum
CREATE TYPE "ProgramTipi" AS ENUM ('YENI_PROGRAM', 'ESKI_PROGRAM');

-- DropForeignKey
ALTER TABLE "beceriler" DROP CONSTRAINT "beceriler_dersId_fkey";

-- DropForeignKey
ALTER TABLE "beceriler" DROP CONSTRAINT "beceriler_temaId_fkey";

-- DropForeignKey
ALTER TABLE "ders_kademe" DROP CONSTRAINT "ders_kademe_dersId_fkey";

-- DropForeignKey
ALTER TABLE "ders_kademe" DROP CONSTRAINT "ders_kademe_kademeId_fkey";

-- DropForeignKey
ALTER TABLE "ders_programlari" DROP CONSTRAINT "ders_programlari_dersId_fkey";

-- DropForeignKey
ALTER TABLE "ders_programlari" DROP CONSTRAINT "ders_programlari_sablonId_fkey";

-- DropForeignKey
ALTER TABLE "ders_programlari" DROP CONSTRAINT "ders_programlari_sinifId_fkey";

-- DropForeignKey
ALTER TABLE "ders_saatleri" DROP CONSTRAINT "ders_saatleri_dersId_fkey";

-- DropForeignKey
ALTER TABLE "ders_saatleri" DROP CONSTRAINT "ders_saatleri_sinifId_fkey";

-- DropForeignKey
ALTER TABLE "gunluk_planlar" DROP CONSTRAINT "gunluk_planlar_sinifDefteriId_fkey";

-- DropForeignKey
ALTER TABLE "kazanimlar" DROP CONSTRAINT "kazanimlar_dersId_fkey";

-- DropForeignKey
ALTER TABLE "plan_becerileri" DROP CONSTRAINT "plan_becerileri_beceriId_fkey";

-- DropForeignKey
ALTER TABLE "plan_becerileri" DROP CONSTRAINT "plan_becerileri_haftaId_fkey";

-- DropForeignKey
ALTER TABLE "plan_becerileri" DROP CONSTRAINT "plan_becerileri_planId_fkey";

-- DropForeignKey
ALTER TABLE "plan_kazanimlari" DROP CONSTRAINT "plan_kazanimlari_haftaId_fkey";

-- DropForeignKey
ALTER TABLE "plan_kazanimlari" DROP CONSTRAINT "plan_kazanimlari_kazanimId_fkey";

-- DropForeignKey
ALTER TABLE "plan_kazanimlari" DROP CONSTRAINT "plan_kazanimlari_planId_fkey";

-- DropForeignKey
ALTER TABLE "planlar" DROP CONSTRAINT "planlar_dersId_fkey";

-- DropForeignKey
ALTER TABLE "sinif_defteri" DROP CONSTRAINT "sinif_defteri_beceriId_fkey";

-- DropForeignKey
ALTER TABLE "sinif_defteri" DROP CONSTRAINT "sinif_defteri_dersProgramiId_fkey";

-- DropForeignKey
ALTER TABLE "sinif_defteri" DROP CONSTRAINT "sinif_defteri_haftaId_fkey";

-- DropForeignKey
ALTER TABLE "sinif_defteri" DROP CONSTRAINT "sinif_defteri_kazanimId_fkey";

-- DropForeignKey
ALTER TABLE "sinif_defteri" DROP CONSTRAINT "sinif_defteri_planId_fkey";

-- DropForeignKey
ALTER TABLE "sinif_ders" DROP CONSTRAINT "sinif_ders_dersId_fkey";

-- DropForeignKey
ALTER TABLE "sinif_ders" DROP CONSTRAINT "sinif_ders_sinifId_fkey";

-- DropForeignKey
ALTER TABLE "siniflar" DROP CONSTRAINT "siniflar_kademeId_fkey";

-- DropTable
DROP TABLE "beceriler";

-- DropTable
DROP TABLE "ders_kademe";

-- DropTable
DROP TABLE "ders_programi_sablonlari";

-- DropTable
DROP TABLE "ders_programlari";

-- DropTable
DROP TABLE "ders_saatleri";

-- DropTable
DROP TABLE "dersler";

-- DropTable
DROP TABLE "gunluk_planlar";

-- DropTable
DROP TABLE "haftalar";

-- DropTable
DROP TABLE "kademeler";

-- DropTable
DROP TABLE "kazanimlar";

-- DropTable
DROP TABLE "plan_becerileri";

-- DropTable
DROP TABLE "plan_kazanimlari";

-- DropTable
DROP TABLE "planlar";

-- DropTable
DROP TABLE "sinif_defteri";

-- DropTable
DROP TABLE "sinif_ders";

-- DropTable
DROP TABLE "siniflar";

-- DropTable
DROP TABLE "temalar";

-- DropEnum
DROP TYPE "DersGunu";

-- DropEnum
DROP TYPE "DersTipi";

-- DropEnum
DROP TYPE "HaftaDurum";

-- CreateTable
CREATE TABLE "sinif" (
    "id" TEXT NOT NULL,
    "seviye" INTEGER NOT NULL,
    "aciklama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sinif_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ders" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "haftalikSaat" INTEGER NOT NULL,
    "sinifId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tema" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "sira" INTEGER NOT NULL,
    "dersId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beceri" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "saatSuresi" INTEGER NOT NULL,
    "sira" INTEGER NOT NULL,
    "temaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beceri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kazanim" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "saatSuresi" INTEGER NOT NULL,
    "sira" INTEGER NOT NULL,
    "temaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kazanim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yil" (
    "id" TEXT NOT NULL,
    "yil" INTEGER NOT NULL,
    "aciklama" TEXT NOT NULL,
    "baslamaTarihi" TIMESTAMP(3) NOT NULL,
    "bitisTarihi" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "yil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hafta" (
    "id" TEXT NOT NULL,
    "haftaNo" INTEGER NOT NULL,
    "baslamaTarihi" TIMESTAMP(3) NOT NULL,
    "bitisTarihi" TIMESTAMP(3) NOT NULL,
    "tip" "HaftaTipi" NOT NULL DEFAULT 'DERS',
    "aciklama" TEXT,
    "yilId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hafta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "tip" "PlanTipi" NOT NULL,
    "dersId" TEXT NOT NULL,
    "yilId" TEXT NOT NULL,
    "kullaniciId" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_sablonu" (
    "id" TEXT NOT NULL,
    "dersId" TEXT NOT NULL,
    "yilId" TEXT NOT NULL,
    "programTipi" "ProgramTipi" NOT NULL,
    "beceriId" TEXT,
    "kazanimId" TEXT,
    "haftaId" TEXT NOT NULL,
    "saat" INTEGER NOT NULL,
    "sira" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_sablonu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_detay" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "beceriId" TEXT,
    "kazanimId" TEXT,
    "haftaId" TEXT NOT NULL,
    "saat" INTEGER NOT NULL,
    "tamamlandi" BOOLEAN NOT NULL DEFAULT false,
    "notlar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_detay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gun" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "sira" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ders_saati" (
    "id" TEXT NOT NULL,
    "saat" INTEGER NOT NULL,
    "baslamaSaati" TEXT NOT NULL,
    "bitisSaati" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ders_saati_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ders_programi" (
    "id" TEXT NOT NULL,
    "kullaniciId" TEXT NOT NULL,
    "dersId" TEXT NOT NULL,
    "gunId" TEXT NOT NULL,
    "dersSaatiId" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ders_programi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sinif_defteri_kayit" (
    "id" TEXT NOT NULL,
    "kullaniciId" TEXT NOT NULL,
    "dersId" TEXT NOT NULL,
    "gunId" TEXT NOT NULL,
    "dersSaatiId" TEXT NOT NULL,
    "beceriId" TEXT,
    "kazanimId" TEXT,
    "konu" TEXT NOT NULL,
    "aciklama" TEXT,
    "tarih" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sinif_defteri_kayit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sinif_seviye_key" ON "sinif"("seviye");

-- CreateIndex
CREATE UNIQUE INDEX "ders_ad_sinifId_key" ON "ders"("ad", "sinifId");

-- CreateIndex
CREATE UNIQUE INDEX "tema_dersId_sira_key" ON "tema"("dersId", "sira");

-- CreateIndex
CREATE UNIQUE INDEX "beceri_temaId_sira_key" ON "beceri"("temaId", "sira");

-- CreateIndex
CREATE UNIQUE INDEX "kazanim_temaId_sira_key" ON "kazanim"("temaId", "sira");

-- CreateIndex
CREATE UNIQUE INDEX "yil_yil_key" ON "yil"("yil");

-- CreateIndex
CREATE UNIQUE INDEX "hafta_yilId_haftaNo_key" ON "hafta"("yilId", "haftaNo");

-- CreateIndex
CREATE UNIQUE INDEX "plan_sablonu_dersId_yilId_programTipi_beceriId_haftaId_key" ON "plan_sablonu"("dersId", "yilId", "programTipi", "beceriId", "haftaId");

-- CreateIndex
CREATE UNIQUE INDEX "plan_sablonu_dersId_yilId_programTipi_kazanimId_haftaId_key" ON "plan_sablonu"("dersId", "yilId", "programTipi", "kazanimId", "haftaId");

-- CreateIndex
CREATE UNIQUE INDEX "plan_detay_planId_beceriId_haftaId_key" ON "plan_detay"("planId", "beceriId", "haftaId");

-- CreateIndex
CREATE UNIQUE INDEX "plan_detay_planId_kazanimId_haftaId_key" ON "plan_detay"("planId", "kazanimId", "haftaId");

-- CreateIndex
CREATE UNIQUE INDEX "gun_ad_key" ON "gun"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "gun_sira_key" ON "gun"("sira");

-- CreateIndex
CREATE UNIQUE INDEX "ders_saati_saat_key" ON "ders_saati"("saat");

-- CreateIndex
CREATE UNIQUE INDEX "ders_programi_kullaniciId_gunId_dersSaatiId_key" ON "ders_programi"("kullaniciId", "gunId", "dersSaatiId");

-- CreateIndex
CREATE UNIQUE INDEX "sinif_defteri_kayit_kullaniciId_dersId_gunId_dersSaatiId_ta_key" ON "sinif_defteri_kayit"("kullaniciId", "dersId", "gunId", "dersSaatiId", "tarih");

-- AddForeignKey
ALTER TABLE "ders" ADD CONSTRAINT "ders_sinifId_fkey" FOREIGN KEY ("sinifId") REFERENCES "sinif"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tema" ADD CONSTRAINT "tema_dersId_fkey" FOREIGN KEY ("dersId") REFERENCES "ders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beceri" ADD CONSTRAINT "beceri_temaId_fkey" FOREIGN KEY ("temaId") REFERENCES "tema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kazanim" ADD CONSTRAINT "kazanim_temaId_fkey" FOREIGN KEY ("temaId") REFERENCES "tema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hafta" ADD CONSTRAINT "hafta_yilId_fkey" FOREIGN KEY ("yilId") REFERENCES "yil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan" ADD CONSTRAINT "plan_dersId_fkey" FOREIGN KEY ("dersId") REFERENCES "ders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan" ADD CONSTRAINT "plan_yilId_fkey" FOREIGN KEY ("yilId") REFERENCES "yil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_sablonu" ADD CONSTRAINT "plan_sablonu_dersId_fkey" FOREIGN KEY ("dersId") REFERENCES "ders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_sablonu" ADD CONSTRAINT "plan_sablonu_yilId_fkey" FOREIGN KEY ("yilId") REFERENCES "yil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_sablonu" ADD CONSTRAINT "plan_sablonu_beceriId_fkey" FOREIGN KEY ("beceriId") REFERENCES "beceri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_sablonu" ADD CONSTRAINT "plan_sablonu_kazanimId_fkey" FOREIGN KEY ("kazanimId") REFERENCES "kazanim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_sablonu" ADD CONSTRAINT "plan_sablonu_haftaId_fkey" FOREIGN KEY ("haftaId") REFERENCES "hafta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_detay" ADD CONSTRAINT "plan_detay_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_detay" ADD CONSTRAINT "plan_detay_beceriId_fkey" FOREIGN KEY ("beceriId") REFERENCES "beceri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_detay" ADD CONSTRAINT "plan_detay_kazanimId_fkey" FOREIGN KEY ("kazanimId") REFERENCES "kazanim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_detay" ADD CONSTRAINT "plan_detay_haftaId_fkey" FOREIGN KEY ("haftaId") REFERENCES "hafta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ders_programi" ADD CONSTRAINT "ders_programi_dersId_fkey" FOREIGN KEY ("dersId") REFERENCES "ders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ders_programi" ADD CONSTRAINT "ders_programi_gunId_fkey" FOREIGN KEY ("gunId") REFERENCES "gun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ders_programi" ADD CONSTRAINT "ders_programi_dersSaatiId_fkey" FOREIGN KEY ("dersSaatiId") REFERENCES "ders_saati"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinif_defteri_kayit" ADD CONSTRAINT "sinif_defteri_kayit_dersId_fkey" FOREIGN KEY ("dersId") REFERENCES "ders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinif_defteri_kayit" ADD CONSTRAINT "sinif_defteri_kayit_gunId_fkey" FOREIGN KEY ("gunId") REFERENCES "gun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinif_defteri_kayit" ADD CONSTRAINT "sinif_defteri_kayit_dersSaatiId_fkey" FOREIGN KEY ("dersSaatiId") REFERENCES "ders_saati"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinif_defteri_kayit" ADD CONSTRAINT "sinif_defteri_kayit_beceriId_fkey" FOREIGN KEY ("beceriId") REFERENCES "beceri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinif_defteri_kayit" ADD CONSTRAINT "sinif_defteri_kayit_kazanimId_fkey" FOREIGN KEY ("kazanimId") REFERENCES "kazanim"("id") ON DELETE SET NULL ON UPDATE CASCADE;
