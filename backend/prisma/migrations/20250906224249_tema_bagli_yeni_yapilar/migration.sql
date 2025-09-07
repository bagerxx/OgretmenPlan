-- CreateTable
CREATE TABLE "public"."olcme_degerlendirme" (
    "id" TEXT NOT NULL,
    "temaId" TEXT NOT NULL,
    "icerik" TEXT NOT NULL,

    CONSTRAINT "olcme_degerlendirme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sosyal_duygusal_beceri" (
    "id" TEXT NOT NULL,
    "temaId" TEXT NOT NULL,
    "ad" TEXT NOT NULL,

    CONSTRAINT "sosyal_duygusal_beceri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."deger" (
    "id" TEXT NOT NULL,
    "temaId" TEXT NOT NULL,
    "ad" TEXT NOT NULL,

    CONSTRAINT "deger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."okur_yazarlik_becerisi" (
    "id" TEXT NOT NULL,
    "temaId" TEXT NOT NULL,
    "ad" TEXT NOT NULL,

    CONSTRAINT "okur_yazarlik_becerisi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."konu_cercevesi" (
    "id" TEXT NOT NULL,
    "temaId" TEXT NOT NULL,
    "ad" TEXT NOT NULL,

    CONSTRAINT "konu_cercevesi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ogrenme_ciktisi" (
    "id" TEXT NOT NULL,
    "konuCercevesiId" TEXT NOT NULL,
    "ad" TEXT NOT NULL,

    CONSTRAINT "ogrenme_ciktisi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."surec_bileseni" (
    "id" TEXT NOT NULL,
    "ogrenmeCiktisiId" TEXT NOT NULL,
    "ad" TEXT NOT NULL,

    CONSTRAINT "surec_bileseni_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."olcme_degerlendirme" ADD CONSTRAINT "olcme_degerlendirme_temaId_fkey" FOREIGN KEY ("temaId") REFERENCES "public"."tema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sosyal_duygusal_beceri" ADD CONSTRAINT "sosyal_duygusal_beceri_temaId_fkey" FOREIGN KEY ("temaId") REFERENCES "public"."tema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deger" ADD CONSTRAINT "deger_temaId_fkey" FOREIGN KEY ("temaId") REFERENCES "public"."tema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."okur_yazarlik_becerisi" ADD CONSTRAINT "okur_yazarlik_becerisi_temaId_fkey" FOREIGN KEY ("temaId") REFERENCES "public"."tema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."konu_cercevesi" ADD CONSTRAINT "konu_cercevesi_temaId_fkey" FOREIGN KEY ("temaId") REFERENCES "public"."tema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ogrenme_ciktisi" ADD CONSTRAINT "ogrenme_ciktisi_konuCercevesiId_fkey" FOREIGN KEY ("konuCercevesiId") REFERENCES "public"."konu_cercevesi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."surec_bileseni" ADD CONSTRAINT "surec_bileseni_ogrenmeCiktisiId_fkey" FOREIGN KEY ("ogrenmeCiktisiId") REFERENCES "public"."ogrenme_ciktisi"("id") ON DELETE CASCADE ON UPDATE CASCADE;
