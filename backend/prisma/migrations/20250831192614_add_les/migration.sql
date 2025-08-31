/*
  Warnings:

  - The values [DERS,TATIL,SINAV,IS] on the enum `HaftaDurum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "HaftaDurum_new" AS ENUM ('LESSON', 'HOLIDAY', 'EXAM', 'WORK');
ALTER TABLE "haftalar" ALTER COLUMN "durum" DROP DEFAULT;
ALTER TABLE "haftalar" ALTER COLUMN "durum" TYPE "HaftaDurum_new" USING ("durum"::text::"HaftaDurum_new");
ALTER TYPE "HaftaDurum" RENAME TO "HaftaDurum_old";
ALTER TYPE "HaftaDurum_new" RENAME TO "HaftaDurum";
DROP TYPE "HaftaDurum_old";
ALTER TABLE "haftalar" ALTER COLUMN "durum" SET DEFAULT 'LESSON';
COMMIT;

-- AlterTable
ALTER TABLE "haftalar" ALTER COLUMN "durum" SET DEFAULT 'LESSON';
