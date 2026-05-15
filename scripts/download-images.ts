import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

const prisma = new PrismaClient();
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'noticias');

// Ensure directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function downloadFile(url: string, filename: string): Promise<string | null> {
  const filePath = path.join(UPLOADS_DIR, filename);
  
  // Skip if already exists
  if (fs.existsSync(filePath)) {
    return `/uploads/noticias/${filename}`;
  }

  try {
    const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!res.ok) {
        console.warn(`Failed to download ${url}: ${res.statusText}`);
        return null;
    }
    
    const fileStream = fs.createWriteStream(filePath, { flags: 'wx' });
    if (res.body) {
        // fetch in node 18+ returns Web streams, we can pipe them using Readable.fromWeb
        // @ts-ignore
        await finished(Readable.fromWeb(res.body).pipe(fileStream));
    }
    return `/uploads/noticias/${filename}`;
  } catch (error) {
    console.error(`Error downloading ${url}:`, error);
    return null;
  }
}

function getFilenameFromUrl(url: string) {
    try {
        const urlObj = new URL(url);
        let filename = path.basename(urlObj.pathname);
        if (!filename || filename === '/') {
            filename = `image_${Date.now()}.jpg`;
        }
        // Decode URI components just in case
        return decodeURIComponent(filename);
    } catch {
        return `image_${Date.now()}.jpg`;
    }
}

async function run() {
  const noticias = await prisma.noticia.findMany({
      where: {
          OR: [
              { imagem: { contains: 'saotome.rn.gov.br' } },
              { conteudo: { contains: 'saotome.rn.gov.br' } }
          ]
      }
  });

  console.log(`Found ${noticias.length} news articles with external images.`);

  for (let i = 0; i < noticias.length; i++) {
    const noticia = noticias[i];
    console.log(`Processing [${i+1}/${noticias.length}]: ${noticia.titulo}`);
    
    let updated = false;
    let newImagem = noticia.imagem;
    let newConteudo = noticia.conteudo;

    // 1. Process featured image
    if (newImagem && newImagem.includes('saotome.rn.gov.br')) {
        const filename = `featured_${noticia.id}_${getFilenameFromUrl(newImagem)}`;
        const localUrl = await downloadFile(newImagem, filename);
        if (localUrl) {
            newImagem = localUrl;
            updated = true;
        }
    }

    // 2. Process content images
    if (newConteudo && newConteudo.includes('saotome.rn.gov.br')) {
        const $ = cheerio.load(newConteudo, null, false);
        const images = $('img').toArray();
        
        for (const img of images) {
            const src = $(img).attr('src');
            if (src && src.includes('saotome.rn.gov.br')) {
                const filename = `content_${noticia.id}_${getFilenameFromUrl(src)}`;
                const localUrl = await downloadFile(src, filename);
                if (localUrl) {
                    $(img).attr('src', localUrl);
                    // Also replace srcset and any other data attrs if they exist to prevent external loading
                    $(img).removeAttr('srcset');
                    $(img).removeAttr('sizes');
                    updated = true;
                }
            }
        }
        
        // Save modified HTML
        newConteudo = $.html();
    }

    // 3. Update DB if anything changed
    if (updated) {
        await prisma.noticia.update({
            where: { id: noticia.id },
            data: {
                imagem: newImagem,
                conteudo: newConteudo
            }
        });
        console.log(`-> Updated DB for: ${noticia.titulo}`);
    }
  }
  
  console.log('Finished downloading images.');
}

run()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
