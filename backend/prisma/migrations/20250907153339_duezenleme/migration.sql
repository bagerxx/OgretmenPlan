/*
  Warnings:

  - You are about to drop the `surec_bileseni` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."surec_bileseni" DROP CONSTRAINT "surec_bileseni_ogrenmeCiktisiId_fkey";

-- AlterTable
ALTER TABLE "public"."ogrenme_ciktisi" ADD COLUMN     "surecBileseni" TEXT;

-- DropTable
DROP TABLE "public"."surec_bileseni";
