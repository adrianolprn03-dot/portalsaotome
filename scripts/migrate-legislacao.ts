import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';
import { put } from '@vercel/blob';

const prisma = new PrismaClient();
const BASE_URL = 'https://saotome.rn.gov.br';

/**
 * Faz o upload direto do site antigo para o Vercel Blob
 */
async function uploadToBlob(url: string, fallbackName: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('/')) url = BASE_URL + url;

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let filename = path.basename(new URL(url).pathname);
    if (!filename || filename === '/') filename = fallbackName;
    filename = decodeURIComponent(filename).replace(/[^a-zA-Z0-9.\-_]/g, '_');

    // Upload direto para o Vercel Blob
    const blob = await put(`migracao/${Date.now()}_${filename}`, buffer, {
      access: 'public',
      addRandomSuffix: true
    });

    console.log(`✅ Upload concluído: ${blob.url}`);
    return blob.url;
  } catch (error) {
    console.error(`❌ Erro no upload de ${url}:`, error);
    return null;
  }
}

const path = require('path');

function extractYear(text: string): number {
  const match = text.match(/\b(19|20)\d{2}\b/);
  return match ? parseInt(match[0]) : new Date().getFullYear();
}

async function processLegislacao(slug: string, tipo: string) {
  console.log(`\n--- Buscando ${tipo}s no site legado ---`);
  try {
    const html = await fetch(`${BASE_URL}/${slug}`).then(r => r.text());
    const $ = cheerio.load(html);
    const rows = $('table.tablepress tbody tr').toArray();
    console.log(`Encontrados ${rows.length} registros.`);

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

      let blobUrl = null;
      if (pdfUrl) {
        blobUrl = await uploadToBlob(pdfUrl, `${tipo.toLowerCase()}_${numero.replace(/\D/g, '')}.pdf`);
      }

      await prisma.legislacao.create({
        data: {
          tipo: tipo,
          numero: numero,
          ano: ano,
          ementa: descricao,
          arquivo: blobUrl,
          documentUrl: pdfUrl,
          ativo: true,
          criadoEm: dateToSave,
          atualizadoEm: dateToSave
        }
      });

      count++;
      process.stdout.write(`\rProcessado: ${count}/${rows.length}`);
    }
    console.log(`\nFinalizado: ${count} ${tipo}s importados.`);
  } catch (err) {
    console.error(`Erro ao processar ${slug}:`, err);
  }
}

async function processEditais() {
  console.log(`\n--- Buscando Editais (Licitações) ---`);
  try {
    const html = await fetch(`${BASE_URL}/editais`).then(r => r.text());
    const $ = cheerio.load(html);
    const rows = $('table.tablepress tbody tr').toArray();
    console.log(`Encontrados ${rows.length} registros.`);

    let count = 0;
    for (const row of rows) {
      const cols = $(row).find('td');
      if (cols.length < 7) continue;

      const licitacao = $(cols[0]).text().trim();
      const modalidade = $(cols[1]).text().trim();
      const objeto = $(cols[2]).text().trim();
      const dataAberturaRaw = $(cols[5]).text().trim();
      const linkEl = $(cols[6]).find('a');
      const pdfUrl = linkEl.attr('href');

      if (!licitacao) continue;

      const ano = extractYear(licitacao);
      let dataAbertura = new Date(ano, 0, 1);

      const dateMatch = dataAberturaRaw.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (dateMatch) {
        dataAbertura = new Date(parseInt(dateMatch[3]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[1]));
      }

      let documentos = "[]";
      if (pdfUrl) {
        const blobUrl = await uploadToBlob(pdfUrl, `edital_${licitacao.replace(/\D/g, '')}.pdf`);
        if (blobUrl) {
          documentos = JSON.stringify([{ nome: "Edital", url: blobUrl }]);
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
          status: "encerrada",
          documentos: documentos,
          criadoEm: dataAbertura
        }
      });

      count++;
      process.stdout.write(`\rProcessado: ${count}/${rows.length}`);
    }
    console.log(`\nFinalizado: ${count} Editais importados.`);
  } catch (err) {
    console.error(`Erro ao processar editais:`, err);
  }
}

async function run() {
  console.log("🚀 Iniciando migração para Vercel Blob...");
  try {
    // Ordem de execução
    await processLegislacao('decretos', 'Decreto');
    await processLegislacao('leis', 'Lei');
    await processLegislacao('portarias', 'Portaria');
    await processEditais();
    console.log("\n✨ MIGRACÃO COMPLETA!");
  } catch (e) {
    console.error("Migration failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
