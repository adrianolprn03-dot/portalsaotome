-- CreateTable
CREATE TABLE "DiariaFemurn" (
    "codigo" TEXT NOT NULL,
    "diariaId" TEXT NOT NULL,
    "checksumMd5" TEXT NOT NULL,
    "publicadoEm" TIMESTAMP(3) NOT NULL,
    "orgao" TEXT NOT NULL,
    "edicao" TEXT NOT NULL,
    "pdf" BYTEA NOT NULL,

    CONSTRAINT "DiariaFemurn_pkey" PRIMARY KEY ("codigo")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiariaFemurn_diariaId_key" ON "DiariaFemurn"("diariaId");

-- AddForeignKey
ALTER TABLE "DiariaFemurn" ADD CONSTRAINT "DiariaFemurn_diariaId_fkey" FOREIGN KEY ("diariaId") REFERENCES "Diaria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
