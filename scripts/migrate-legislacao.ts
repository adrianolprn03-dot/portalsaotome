import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

const prisma = new PrismaClient();
const BASE_URL = 'https://saotome.rn.gov.br';

const DIRS = {
  legislacao: path.join(process.cwd(), 'public', 'uploads', 'legislacao'),
  licitacao: path.join(process.cwd(), 'public', 'uploads', 'licitacoes'),
};

// Ensure directories exist
Object.values(DIRS).forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function downloadFile(url: string, destDir: string, fallbackName: string): Promise<string | null> {
  if (!url) return null;
  // Handle relative URLs
  if (url.startsWith('/')) url = BASE_URL + url;

  let filename = path.basename(new URL(url).pathname);
  if (!filename || filename === '/') filename = fallbackName;
  filename = decodeURIComponent(filename);

  // Avoid very long or weird filenames
  if (filename.length > 100) filename = fallbackName;
  
  const safeFilename = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
  const filePath = path.join(destDir, safeFilename);

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    
    const fileStream = fs.createWriteStream(filePath, { flags: 'wx' });
    if (res.body) {
      // @ts-ignore
      await finished(Readable.fromWeb(res.body).pipe(fileStream));
    }
    
    // Return relative path
    return destDir === DIRS.legislacao 
      ? `/uploads/legislacao/${safeFilename}` 
      : `/uploads/licitacoes/${safeFilename}`;
  } catch (error) {
    console.error(`Error downloading ${url}:`, error);
    return null;
  }
}

function extractYear(text: string): number {
  const match = text.match(/\b(19|20)\d{2}\b/);
  return match ? parseInt(match[0]) : new Date().getFullYear();
}

async function processLegislacao(slug: string, tipo: string) {
  console.log(`\n--- Fetching ${tipo}s ---`);
  const html = await fetch(`${BASE_URL}/${slug}`).then(r => r.text());
  const $ = cheerio.load(html);
  const rows = $('table.tablepress tbody tr').toArray();
  console.log(`Found ${rows.length} ${tipo}s.`);

  let count = 0;
  for (const row of rows) {
    const cols = $(row).find('td');
    if (cols.length < 3) continue;

    const numero = $(cols[0]).text().trim();
    const descricao = $(cols[1]).text().trim();
    const linkEl = $(cols[2]).find('a');
    let pdfUrl = linkEl.attr('href');

    if (!numero) continue;

    const ano = extractYear(numero) || extractYear(descricao);
    const dateToSave = new Date(ano, 0, 1);

    let localUrl = null;
    if (pdfUrl) {
      localUrl = await downloadFile(pdfUrl, DIRS.legislacao, `${tipo.toLowerCase()}_${numero.replace(/\D/g, '')}.pdf`);
    }

    await prisma.legislacao.create({
      data: {
        tipo: tipo,
        numero: numero,
        ano: ano,
        ementa: descricao,
        arquivo: localUrl,
        documentUrl: pdfUrl,
        ativo: true,
        criadoEm: dateToSave,
        atualizadoEm: dateToSave
      }
    });

    count++;
    process.stdout.write(`\rImported ${count}/${rows.length}`);
  }
  console.log(`\nFinished importing ${count} ${tipo}s.`);
}

async function processEditais() {
  console.log(`\n--- Fetching Editais (Licitações) ---`);
  const html = await fetch(`${BASE_URL}/editais`).then(r => r.text());
  const $ = cheerio.load(html);
  const rows = $('table.tablepress tbody tr').toArray();
  console.log(`Found ${rows.length} Editais.`);

  let count = 0;
  for (const row of rows) {
    const cols = $(row).find('td');
    if (cols.length < 7) continue;

    const licitacao = $(cols[0]).text().trim();
    const modalidade = $(cols[1]).text().trim();
    const objeto = $(cols[2]).text().trim();
    const dataAberturaRaw = $(cols[5]).text().trim(); // Abertura das Propostas
    const linkEl = $(cols[6]).find('a');
    const pdfUrl = linkEl.attr('href');

    if (!licitacao) continue;

    const ano = extractYear(licitacao);
    let dataAbertura = new Date(ano, 0, 1);

    // Try to parse dataAberturaRaw if it looks like DD/MM/YYYY
    const dateMatch = dataAberturaRaw.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (dateMatch) {
      dataAbertura = new Date(parseInt(dateMatch[3]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[1]));
    }

    let documentos = "[]";
    if (pdfUrl) {
      const localUrl = await downloadFile(pdfUrl, DIRS.licitacao, `edital_${licitacao.replace(/\D/g, '')}.pdf`);
      if (localUrl) {
        documentos = JSON.stringify([{ nome: "Edital", url: localUrl }]);
      }
    }

    await prisma.licitacao.create({
      data: {
        numero: licitacao,
        ano: ano,
        modalidade: modalidade,
        objeto: objeto,
        secretaria: "Não Informada",
        dataAbertura: dataAbertura,
        status: "encerrada", // defaults to ended since it's legacy
        documentos: documentos,
        criadoEm: dataAbertura
      }
    });

    count++;
    process.stdout.write(`\rImported ${count}/${rows.length}`);
  }
  console.log(`\nFinished importing ${count} Editais.`);
}

async function run() {
  try {
    await processLegislacao('decretos', 'Decreto');
    await processLegislacao('leis', 'Lei');
    await processLegislacao('portarias', 'Portaria');
    await processEditais();
  } catch (e) {
    console.error("Migration failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
