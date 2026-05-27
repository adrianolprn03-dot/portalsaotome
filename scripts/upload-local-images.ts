import { PrismaClient } from '@prisma/client';
import { put } from '@vercel/blob';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const prisma = new PrismaClient();
const PUBLIC_DIR = path.join(process.cwd(), 'public');

async function run() {
  console.log("🚀 Iniciando upload flexível de imagens para o Vercel Blob...");
  
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("❌ Erro: BLOB_READ_WRITE_TOKEN não encontrado!");
    process.exit(1);
  }

  const noticias = await prisma.noticia.findMany({
    where: {
      imagem: {
        not: { contains: 'public.blob.vercel-storage.com' }
      }
    }
  });

  console.log(`Verificando ${noticias.length} notícias.`);

  for (const noticia of noticias) {
    if (!noticia.imagem) continue;

    const filename = path.basename(noticia.imagem);
    
    // Lista de caminhos possíveis para tentar encontrar o arquivo
    const possiblePaths = [
      path.join(PUBLIC_DIR, 'uploads', 'noticias', filename),
      path.join(PUBLIC_DIR, 'uploads', filename),
      path.join(PUBLIC_DIR, noticia.imagem.startsWith('/') ? noticia.imagem.substring(1) : noticia.imagem)
    ];

    let foundPath = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (foundPath) {
      try {
        console.log(`⏳ Uploading: ${filename} (from ${foundPath})`);
        const fileBuffer = fs.readFileSync(foundPath);
        
        const blob = await put(`noticias/${filename}`, fileBuffer, {
          access: 'public',
          addRandomSuffix: true
        });

        await prisma.noticia.update({
          where: { id: noticia.id },
          data: { imagem: blob.url }
        });

        console.log(`✅ Sucesso! ${noticia.titulo}`);
      } catch (error) {
        console.error(`❌ Erro no upload de ${filename}:`, error);
      }
    } else {
      console.warn(`⚠️ Arquivo não encontrado: ${filename}`);
    }
  }

  console.log("\n✨ PROCESSO CONCLUÍDO!");
  await prisma.$disconnect();
}

run();
