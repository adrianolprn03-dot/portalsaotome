import { PrismaClient } from '@prisma/client';
import { put } from '@vercel/blob';
import * as path from 'path';

const prisma = new PrismaClient();
const BASE_URL = 'https://saotome.rn.gov.br';

async function uploadToBlob(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.includes('public.blob.vercel-storage.com')) return url;

  // Lista de tentativas de caminhos
  const pathsToTry = [
    url.startsWith('http') ? url : null,
    url.startsWith('/') ? `${BASE_URL}${url}` : null,
    `${BASE_URL}/uploads/noticias/${url}`,
    `${BASE_URL}/wp-content/uploads/noticias/${url}`,
    `${BASE_URL}/wp-content/uploads/${url}`,
  ].filter(Boolean) as string[];

  for (const absoluteUrl of pathsToTry) {
    try {
      console.log(`⏳ Tentando: ${absoluteUrl}`);
      const res = await fetch(absoluteUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filename = path.basename(new URL(absoluteUrl).pathname) || `imagem_${Date.now()}.jpg`;

        const blob = await put(`noticias/${Date.now()}_${filename}`, buffer, {
          access: 'public',
          addRandomSuffix: true
        });

        console.log(`✅ Sucesso! Blob: ${blob.url}`);
        return blob.url;
      }
    } catch (e) {
      // continua tentando
    }
  }

  console.error(`❌ Não foi possível encontrar a imagem para: ${url}`);
  return null;
}

async function run() {
  console.log("🚀 Iniciando migração inteligente de imagens...");
  
  const noticias = await prisma.noticia.findMany({
      where: { imagem: { not: null } },
      orderBy: { criadoEm: 'desc' } // Processa as mais recentes primeiro
  });

  console.log(`Processando ${noticias.length} notícias.`);

  for (const noticia of noticias) {
    // Pula se já for Blob
    if (noticia.imagem?.includes('public.blob.vercel-storage.com')) continue;

    const newUrl = await uploadToBlob(noticia.imagem!);
    
    if (newUrl) {
        await prisma.noticia.update({
            where: { id: noticia.id },
            data: { imagem: newUrl }
        });
        console.log(`✨ Atualizado: ${noticia.titulo}`);
    }
  }

  console.log("\n✨ FINALIZADO!");
  await prisma.$disconnect();
}

run();
