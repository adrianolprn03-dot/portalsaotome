import { PrismaClient } from '@prisma/client';
import sqlite3 from 'sqlite3';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Carrega as variáveis do .env.local (que aponta para o Neon)
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const prisma = new PrismaClient();
const db = new sqlite3.Database('./prisma/dev.db');

async function run() {
  console.log("🚀 Migrando notícias do banco local (SQLite) para o Neon...");

  db.all('SELECT * FROM Noticia', async (err, rows: any[]) => {
    if (err) {
      console.error("❌ Erro ao ler SQLite:", err);
      process.exit(1);
    }

    console.log(`Encontradas ${rows.length} notícias no SQLite.`);

    for (const row of rows) {
      try {
        // Usa upsert para não duplicar notícias baseadas no slug
        await prisma.noticia.upsert({
          where: { slug: row.slug },
          update: {
            titulo: row.titulo,
            conteudo: row.conteudo,
            resumo: row.resumo,
            imagem: row.imagem,
            publicada: row.publicada === 1,
            destaque: row.destaque === 1,
            criadoEm: new Date(row.criadoEm),
            publicadoEm: row.publicadoEm ? new Date(row.publicadoEm) : new Date(row.criadoEm),
          },
          create: {
            titulo: row.titulo,
            slug: row.slug,
            conteudo: row.conteudo,
            resumo: row.resumo,
            imagem: row.imagem,
            publicada: row.publicada === 1,
            destaque: row.destaque === 1,
            criadoEm: new Date(row.criadoEm),
            publicadoEm: row.publicadoEm ? new Date(row.publicadoEm) : new Date(row.criadoEm),
          }
        });
        console.log(`✅ Sincronizado: ${row.titulo}`);
      } catch (e) {
        console.error(`❌ Falha ao sincronizar: ${row.titulo}`, e);
      }
    }

    console.log("\n✨ SINCRONIZAÇÃO COMPLETA!");
    await prisma.$disconnect();
    db.close();
  });
}

run();
