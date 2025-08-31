-- CreateEnum
CREATE TYPE "DersTipi" AS ENUM ('KAZANIM_BAZLI', 'BECERI_BAZLI');

-- CreateEnum
CREATE TYPE "HaftaDurum" AS ENUM ('DERS', 'TATIL', 'SINAV', 'IS');

-- CreateTable
CREATE TABLE "kademeler" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kademeler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siniflar" (
    "id" TEXT NOT NULL,
    "seviye" INTEGER NOT NULL,
    "kademeId" TEXT NOT NULL,

    CONSTRAINT "siniflar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dersler" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "aciklama" TEXT,
    "tip" "DersTipi" NOT NULL DEFAULT 'KAZANIM_BAZLI',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dersler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ders_saatleri" (
    "id" TEXT NOT NULL,
    "haftalikSaat" INTEGER NOT NULL,
    "dersId" TEXT NOT NULL,
    "sinifId" TEXT NOT NULL,

    CONSTRAINT "ders_saatleri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kazanimlar" (
    "id" TEXT NOT NULL,
    "kod" TEXT NOT NULL,
    "icerik" TEXT NOT NULL,
    "aciklama" TEXT,
    "dersId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kazanimlar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temalar" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "temalar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beceriler" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "aciklama" TEXT,
    "toplamOgrenmeS" INTEGER NOT NULL,
    "temaId" TEXT NOT NULL,
    "dersId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beceriler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "haftalar" (
    "id" TEXT NOT NULL,
    "numara" INTEGER NOT NULL,
    "baslangic" TIMESTAMP(3) NOT NULL,
    "bitis" TIMESTAMP(3) NOT NULL,
    "durum" "HaftaDurum" NOT NULL DEFAULT 'DERS',
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "haftalar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planlar" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "aciklama" TEXT,
    "egitiYili" TEXT NOT NULL,
    "sinifId" TEXT NOT NULL,
    "dersId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planlar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_kazanimlari" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "kazanimId" TEXT NOT NULL,
    "haftaId" TEXT NOT NULL,
    "sure" INTEGER NOT NULL,
    "tamamlandi" BOOLEAN NOT NULL DEFAULT false,
    "notlar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_kazanimlari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_becerileri" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "beceriId" TEXT NOT NULL,
    "haftaId" TEXT NOT NULL,
    "sure" INTEGER NOT NULL,
    "tamamlandi" BOOLEAN NOT NULL DEFAULT false,
    "notlar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_becerileri_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kademeler_ad_key" ON "kademeler"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "siniflar_seviye_kademeId_key" ON "siniflar"("seviye", "kademeId");

-- CreateIndex
CREATE UNIQUE INDEX "dersler_ad_key" ON "dersler"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "ders_saatleri_dersId_sinifId_key" ON "ders_saatleri"("dersId", "sinifId");

-- CreateIndex
CREATE UNIQUE INDEX "kazanimlar_kod_key" ON "kazanimlar"("kod");

-- CreateIndex
CREATE UNIQUE INDEX "temalar_ad_key" ON "temalar"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "beceriler_ad_temaId_dersId_key" ON "beceriler"("ad", "temaId", "dersId");

-- CreateIndex
CREATE UNIQUE INDEX "haftalar_numara_key" ON "haftalar"("numara");

-- CreateIndex
CREATE UNIQUE INDEX "planlar_sinifId_dersId_egitiYili_key" ON "planlar"("sinifId", "dersId", "egitiYili");

-- CreateIndex
CREATE UNIQUE INDEX "plan_kazanimlari_planId_kazanimId_haftaId_key" ON "plan_kazanimlari"("planId", "kazanimId", "haftaId");

-- CreateIndex
CREATE UNIQUE INDEX "plan_becerileri_planId_beceriId_haftaId_key" ON "plan_becerileri"("planId", "beceriId", "haftaId");

-- AddForeignKey
ALTER TABLE "siniflar" ADD CONSTRAINT "siniflar_kademeId_fkey" FOREIGN KEY ("kademeId") REFERENCES "kademeler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ders_saatleri" ADD CONSTRAINT "ders_saatleri_dersId_fkey" FOREIGN KEY ("dersId") REFERENCES "dersler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ders_saatleri" ADD CONSTRAINT "ders_saatleri_sinifId_fkey" FOREIGN KEY ("sinifId") REFERENCES "siniflar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kazanimlar" ADD CONSTRAINT "kazanimlar_dersId_fkey" FOREIGN KEY ("dersId") REFERENCES "dersler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beceriler" ADD CONSTRAINT "beceriler_temaId_fkey" FOREIGN KEY ("temaId") REFERENCES "temalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beceriler" ADD CONSTRAINT "beceriler_dersId_fkey" FOREIGN KEY ("dersId") REFERENCES "dersler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planlar" ADD CONSTRAINT "planlar_sinifId_fkey" FOREIGN KEY ("sinifId") REFERENCES "siniflar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planlar" ADD CONSTRAINT "planlar_dersId_fkey" FOREIGN KEY ("dersId") REFERENCES "dersler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_kazanimlari" ADD CONSTRAINT "plan_kazanimlari_planId_fkey" FOREIGN KEY ("planId") REFERENCES "planlar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_kazanimlari" ADD CONSTRAINT "plan_kazanimlari_kazanimId_fkey" FOREIGN KEY ("kazanimId") REFERENCES "kazanimlar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_kazanimlari" ADD CONSTRAINT "plan_kazanimlari_haftaId_fkey" FOREIGN KEY ("haftaId") REFERENCES "haftalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_becerileri" ADD CONSTRAINT "plan_becerileri_planId_fkey" FOREIGN KEY ("planId") REFERENCES "planlar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_becerileri" ADD CONSTRAINT "plan_becerileri_beceriId_fkey" FOREIGN KEY ("beceriId") REFERENCES "beceriler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_becerileri" ADD CONSTRAINT "plan_becerileri_haftaId_fkey" FOREIGN KEY ("haftaId") REFERENCES "haftalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
