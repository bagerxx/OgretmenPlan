-- CreateTable
CREATE TABLE "ders_kademe" (
    "id" TEXT NOT NULL,
    "dersId" TEXT NOT NULL,
    "kademeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ders_kademe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ders_kademe_dersId_kademeId_key" ON "ders_kademe"("dersId", "kademeId");

-- AddForeignKey
ALTER TABLE "ders_kademe" ADD CONSTRAINT "ders_kademe_dersId_fkey" FOREIGN KEY ("dersId") REFERENCES "dersler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ders_kademe" ADD CONSTRAINT "ders_kademe_kademeId_fkey" FOREIGN KEY ("kademeId") REFERENCES "kademeler"("id") ON DELETE CASCADE ON UPDATE CASCADE;
