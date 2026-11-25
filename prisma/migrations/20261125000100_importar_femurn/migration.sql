ALTER TABLE "Legislacao" ADD COLUMN IF NOT EXISTS "dataAto" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "LegislacaoFemurn" (
    "codigo" TEXT NOT NULL,
    "legislacaoId" TEXT NOT NULL,
    "checksumMd5" TEXT NOT NULL,
    "publicadoEm" TIMESTAMP(3) NOT NULL,
    "orgao" TEXT NOT NULL,
    "edicao" TEXT NOT NULL,
    "pdf" BYTEA NOT NULL,
    CONSTRAINT "LegislacaoFemurn_pkey" PRIMARY KEY ("codigo")
);
CREATE UNIQUE INDEX IF NOT EXISTS "LegislacaoFemurn_legislacaoId_key" ON "LegislacaoFemurn"("legislacaoId");
ALTER TABLE "LegislacaoFemurn" ADD CONSTRAINT "LegislacaoFemurn_legislacaoId_fkey"
    FOREIGN KEY ("legislacaoId") REFERENCES "Legislacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
