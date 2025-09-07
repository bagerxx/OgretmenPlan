/*
  Warnings:

  - The `olcmeDegerlendirme` column on the `tema` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."tema" DROP COLUMN "olcmeDegerlendirme",
ADD COLUMN     "olcmeDegerlendirme" JSONB;
