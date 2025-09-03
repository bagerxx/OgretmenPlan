-- CreateEnum
CREATE TYPE "public"."HaftaTipi" AS ENUM ('DERS', 'TATIL', 'SINAV');

-- CreateEnum
CREATE TYPE "public"."DonemTipi" AS ENUM ('BIRINCI_DONEM', 'IKINCI_DONEM');

-- CreateEnum
CREATE TYPE "public"."PlanTipi" AS ENUM ('YILLIK', 'HAFTALIK', 'GUNLUK');

-- CreateEnum
CREATE TYPE "public"."ProgramTipi" AS ENUM ('YENI_PROGRAM', 'ESKI_PROGRAM');

-- CreateTable
CREATE TABLE "public"."sinif" (
    "id" TEXT NOT NULL,
    "seviye" INTEGER NOT NULL,
    "aciklama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sinif_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ders" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "haftalikSaat" INTEGER NOT NULL,
    "sinifId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tema" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "sira" INTEGER NOT NULL,
    "dersId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."beceri" (
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
CREATE TABLE "public"."kazanim" (
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
CREATE TABLE "public"."yil" (
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
CREATE TABLE "public"."hafta" (
    "id" TEXT NOT NULL,
    "haftaNo" INTEGER NOT NULL,
    "baslamaTarihi" TIMESTAMP(3) NOT NULL,
    "bitisTarihi" TIMESTAMP(3) NOT NULL,
    "tip" "public"."HaftaTipi" NOT NULL DEFAULT 'DERS',
    "donem" "public"."DonemTipi",
    "ad" TEXT NOT NULL DEFAULT '',
    "yilId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hafta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."plan" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "tip" "public"."PlanTipi" NOT NULL,
    "dersId" TEXT NOT NULL,
    "yilId" TEXT NOT NULL,
    "kullaniciId" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."plan_sablonu" (
    "id" TEXT NOT NULL,
    "dersId" TEXT NOT NULL,
    "yilId" TEXT NOT NULL,
    "programTipi" "public"."ProgramTipi" NOT NULL,
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
CREATE TABLE "public"."plan_detay" (
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
CREATE TABLE "public"."gun" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "sira" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ders_saati" (
    "id" TEXT NOT NULL,
    "saat" INTEGER NOT NULL,
    "baslamaSaati" TEXT NOT NULL,
    "bitisSaati" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ders_saati_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ders_programi" (
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
CREATE TABLE "public"."sinif_defteri_kayit" (
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
CREATE UNIQUE INDEX "sinif_seviye_key" ON "public"."sinif"("seviye");

-- CreateIndex
CREATE UNIQUE INDEX "ders_ad_sinifId_key" ON "public"."ders"("ad", "sinifId");

-- CreateIndex
CREATE UNIQUE INDEX "tema_dersId_sira_key" ON "public"."tema"("dersId", "sira");

-- CreateIndex
CREATE UNIQUE INDEX "beceri_temaId_sira_key" ON "public"."beceri"("temaId", "sira");

-- CreateIndex
CREATE UNIQUE INDEX "kazanim_temaId_sira_key" ON "public"."kazanim"("temaId", "sira");

-- CreateIndex
CREATE UNIQUE INDEX "yil_yil_key" ON "public"."yil"("yil");

-- CreateIndex
CREATE UNIQUE INDEX "hafta_yilId_haftaNo_key" ON "public"."hafta"("yilId", "haftaNo");

-- CreateIndex
CREATE UNIQUE INDEX "plan_sablonu_dersId_yilId_programTipi_beceriId_haftaId_key" ON "public"."plan_sablonu"("dersId", "yilId", "programTipi", "beceriId", "haftaId");

-- CreateIndex
CREATE UNIQUE INDEX "plan_sablonu_dersId_yilId_programTipi_kazanimId_haftaId_key" ON "public"."plan_sablonu"("dersId", "yilId", "programTipi", "kazanimId", "haftaId");

-- CreateIndex
CREATE UNIQUE INDEX "plan_detay_planId_beceriId_haftaId_key" ON "public"."plan_detay"("planId", "beceriId", "haftaId");

-- CreateIndex
CREATE UNIQUE INDEX "plan_detay_planId_kazanimId_haftaId_key" ON "public"."plan_detay"("planId", "kazanimId", "haftaId");

-- CreateIndex
CREATE UNIQUE INDEX "gun_ad_key" ON "public"."gun"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "gun_sira_key" ON "public"."gun"("sira");

-- CreateIndex
CREATE UNIQUE INDEX "ders_saati_saat_key" ON "public"."ders_saati"("saat");

-- CreateIndex
CREATE UNIQUE INDEX "ders_programi_kullaniciId_gunId_dersSaatiId_key" ON "public"."ders_programi"("kullaniciId", "gunId", "dersSaatiId");

-- CreateIndex
CREATE UNIQUE INDEX "sinif_defteri_kayit_kullaniciId_dersId_gunId_dersSaatiId_ta_key" ON "public"."sinif_defteri_kayit"("kullaniciId", "dersId", "gunId", "dersSaatiId", "tarih");

-- AddForeignKey
ALTER TABLE "public"."ders" ADD CONSTRAINT "ders_sinifId_fkey" FOREIGN KEY ("sinifId") REFERENCES "public"."sinif"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tema" ADD CONSTRAINT "tema_dersId_fkey" FOREIGN KEY ("dersId") REFERENCES "public"."ders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."beceri" ADD CONSTRAINT "beceri_temaId_fkey" FOREIGN KEY ("temaId") REFERENCES "public"."tema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kazanim" ADD CONSTRAINT "kazanim_temaId_fkey" FOREIGN KEY ("temaId") REFERENCES "public"."tema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hafta" ADD CONSTRAINT "hafta_yilId_fkey" FOREIGN KEY ("yilId") REFERENCES "public"."yil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plan" ADD CONSTRAINT "plan_dersId_fkey" FOREIGN KEY ("dersId") REFERENCES "public"."ders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plan" ADD CONSTRAINT "plan_yilId_fkey" FOREIGN KEY ("yilId") REFERENCES "public"."yil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plan_sablonu" ADD CONSTRAINT "plan_sablonu_dersId_fkey" FOREIGN KEY ("dersId") REFERENCES "public"."ders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plan_sablonu" ADD CONSTRAINT "plan_sablonu_yilId_fkey" FOREIGN KEY ("yilId") REFERENCES "public"."yil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plan_sablonu" ADD CONSTRAINT "plan_sablonu_beceriId_fkey" FOREIGN KEY ("beceriId") REFERENCES "public"."beceri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plan_sablonu" ADD CONSTRAINT "plan_sablonu_kazanimId_fkey" FOREIGN KEY ("kazanimId") REFERENCES "public"."kazanim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plan_sablonu" ADD CONSTRAINT "plan_sablonu_haftaId_fkey" FOREIGN KEY ("haftaId") REFERENCES "public"."hafta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plan_detay" ADD CONSTRAINT "plan_detay_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plan_detay" ADD CONSTRAINT "plan_detay_beceriId_fkey" FOREIGN KEY ("beceriId") REFERENCES "public"."beceri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plan_detay" ADD CONSTRAINT "plan_detay_kazanimId_fkey" FOREIGN KEY ("kazanimId") REFERENCES "public"."kazanim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plan_detay" ADD CONSTRAINT "plan_detay_haftaId_fkey" FOREIGN KEY ("haftaId") REFERENCES "public"."hafta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ders_programi" ADD CONSTRAINT "ders_programi_dersId_fkey" FOREIGN KEY ("dersId") REFERENCES "public"."ders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ders_programi" ADD CONSTRAINT "ders_programi_gunId_fkey" FOREIGN KEY ("gunId") REFERENCES "public"."gun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ders_programi" ADD CONSTRAINT "ders_programi_dersSaatiId_fkey" FOREIGN KEY ("dersSaatiId") REFERENCES "public"."ders_saati"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sinif_defteri_kayit" ADD CONSTRAINT "sinif_defteri_kayit_dersId_fkey" FOREIGN KEY ("dersId") REFERENCES "public"."ders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sinif_defteri_kayit" ADD CONSTRAINT "sinif_defteri_kayit_gunId_fkey" FOREIGN KEY ("gunId") REFERENCES "public"."gun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sinif_defteri_kayit" ADD CONSTRAINT "sinif_defteri_kayit_dersSaatiId_fkey" FOREIGN KEY ("dersSaatiId") REFERENCES "public"."ders_saati"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sinif_defteri_kayit" ADD CONSTRAINT "sinif_defteri_kayit_beceriId_fkey" FOREIGN KEY ("beceriId") REFERENCES "public"."beceri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sinif_defteri_kayit" ADD CONSTRAINT "sinif_defteri_kayit_kazanimId_fkey" FOREIGN KEY ("kazanimId") REFERENCES "public"."kazanim"("id") ON DELETE SET NULL ON UPDATE CASCADE;
