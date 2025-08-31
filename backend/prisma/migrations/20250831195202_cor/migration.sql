-- CreateTable
CREATE TABLE "program_sablonlari" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "aciklama" TEXT,
    "kademeTipi" TEXT NOT NULL,
    "gunlukDersSayisi" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_sablonlari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_saatleri" (
    "id" TEXT NOT NULL,
    "gun" TEXT NOT NULL,
    "dersSirasi" INTEGER NOT NULL,
    "baslangic" TEXT NOT NULL,
    "bitis" TEXT NOT NULL,
    "programSablonuId" TEXT NOT NULL,

    CONSTRAINT "program_saatleri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sinif_defteri" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "haftaId" TEXT NOT NULL,
    "programSaatiId" TEXT NOT NULL,
    "kazanimId" TEXT,
    "beceriId" TEXT,
    "tamamlandi" BOOLEAN NOT NULL DEFAULT false,
    "notlar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sinif_defteri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gunluk_planlar" (
    "id" TEXT NOT NULL,
    "sinifDefteriId" TEXT NOT NULL,
    "konu" TEXT NOT NULL,
    "hedefler" TEXT,
    "yontemler" TEXT,
    "materyaller" TEXT,
    "etkinlikler" TEXT,
    "degerlendirme" TEXT,
    "odev" TEXT,
    "tamamlandi" BOOLEAN NOT NULL DEFAULT false,
    "notlar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gunluk_planlar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "program_sablonlari_ad_key" ON "program_sablonlari"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "program_saatleri_programSablonuId_gun_dersSirasi_key" ON "program_saatleri"("programSablonuId", "gun", "dersSirasi");

-- CreateIndex
CREATE UNIQUE INDEX "sinif_defteri_planId_haftaId_programSaatiId_key" ON "sinif_defteri"("planId", "haftaId", "programSaatiId");

-- AddForeignKey
ALTER TABLE "program_saatleri" ADD CONSTRAINT "program_saatleri_programSablonuId_fkey" FOREIGN KEY ("programSablonuId") REFERENCES "program_sablonlari"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinif_defteri" ADD CONSTRAINT "sinif_defteri_planId_fkey" FOREIGN KEY ("planId") REFERENCES "planlar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinif_defteri" ADD CONSTRAINT "sinif_defteri_haftaId_fkey" FOREIGN KEY ("haftaId") REFERENCES "haftalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinif_defteri" ADD CONSTRAINT "sinif_defteri_programSaatiId_fkey" FOREIGN KEY ("programSaatiId") REFERENCES "program_saatleri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinif_defteri" ADD CONSTRAINT "sinif_defteri_kazanimId_fkey" FOREIGN KEY ("kazanimId") REFERENCES "kazanimlar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinif_defteri" ADD CONSTRAINT "sinif_defteri_beceriId_fkey" FOREIGN KEY ("beceriId") REFERENCES "beceriler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gunluk_planlar" ADD CONSTRAINT "gunluk_planlar_sinifDefteriId_fkey" FOREIGN KEY ("sinifDefteriId") REFERENCES "sinif_defteri"("id") ON DELETE CASCADE ON UPDATE CASCADE;
