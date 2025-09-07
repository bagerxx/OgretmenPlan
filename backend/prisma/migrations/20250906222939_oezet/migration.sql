/*
  Warnings:

  - You are about to drop the `beceri` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ders_programi` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ders_saati` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gun` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `kazanim` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `plan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `plan_detay` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `plan_sablonu` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sinif_defteri_kayit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."beceri" DROP CONSTRAINT "beceri_temaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ders_programi" DROP CONSTRAINT "ders_programi_dersId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ders_programi" DROP CONSTRAINT "ders_programi_dersSaatiId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ders_programi" DROP CONSTRAINT "ders_programi_gunId_fkey";

-- DropForeignKey
ALTER TABLE "public"."kazanim" DROP CONSTRAINT "kazanim_temaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."plan" DROP CONSTRAINT "plan_dersId_fkey";

-- DropForeignKey
ALTER TABLE "public"."plan" DROP CONSTRAINT "plan_yilId_fkey";

-- DropForeignKey
ALTER TABLE "public"."plan_detay" DROP CONSTRAINT "plan_detay_beceriId_fkey";

-- DropForeignKey
ALTER TABLE "public"."plan_detay" DROP CONSTRAINT "plan_detay_haftaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."plan_detay" DROP CONSTRAINT "plan_detay_kazanimId_fkey";

-- DropForeignKey
ALTER TABLE "public"."plan_detay" DROP CONSTRAINT "plan_detay_planId_fkey";

-- DropForeignKey
ALTER TABLE "public"."plan_sablonu" DROP CONSTRAINT "plan_sablonu_beceriId_fkey";

-- DropForeignKey
ALTER TABLE "public"."plan_sablonu" DROP CONSTRAINT "plan_sablonu_dersId_fkey";

-- DropForeignKey
ALTER TABLE "public"."plan_sablonu" DROP CONSTRAINT "plan_sablonu_haftaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."plan_sablonu" DROP CONSTRAINT "plan_sablonu_kazanimId_fkey";

-- DropForeignKey
ALTER TABLE "public"."plan_sablonu" DROP CONSTRAINT "plan_sablonu_yilId_fkey";

-- DropForeignKey
ALTER TABLE "public"."sinif_defteri_kayit" DROP CONSTRAINT "sinif_defteri_kayit_beceriId_fkey";

-- DropForeignKey
ALTER TABLE "public"."sinif_defteri_kayit" DROP CONSTRAINT "sinif_defteri_kayit_dersId_fkey";

-- DropForeignKey
ALTER TABLE "public"."sinif_defteri_kayit" DROP CONSTRAINT "sinif_defteri_kayit_dersSaatiId_fkey";

-- DropForeignKey
ALTER TABLE "public"."sinif_defteri_kayit" DROP CONSTRAINT "sinif_defteri_kayit_gunId_fkey";

-- DropForeignKey
ALTER TABLE "public"."sinif_defteri_kayit" DROP CONSTRAINT "sinif_defteri_kayit_kazanimId_fkey";

-- DropTable
DROP TABLE "public"."beceri";

-- DropTable
DROP TABLE "public"."ders_programi";

-- DropTable
DROP TABLE "public"."ders_saati";

-- DropTable
DROP TABLE "public"."gun";

-- DropTable
DROP TABLE "public"."kazanim";

-- DropTable
DROP TABLE "public"."plan";

-- DropTable
DROP TABLE "public"."plan_detay";

-- DropTable
DROP TABLE "public"."plan_sablonu";

-- DropTable
DROP TABLE "public"."sinif_defteri_kayit";

-- DropEnum
DROP TYPE "public"."ProgramTipi";
