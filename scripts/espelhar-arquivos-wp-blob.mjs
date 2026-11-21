#!/usr/bin/env node
/**
 * Espelhamento de Todos os Arquivos de https://saotome.rn.gov.br/wp-content/uploads/
 * Referenciados no Banco de Dados (PDFs, MP3 do Hino, Imagens) -> Vercel Blob
 * Mantém intactos todos os links do Google Drive (drive.google.com / docs.google.com).
 *
 * Uso:
 *   node scripts/espelhar-arquivos-wp-blob.mjs --dry-run
 *   node scripts/espelhar-arquivos-wp-blob.mjs --apply --confirm
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { put, list } from '@vercel/blob';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[match[1]]) {
      process.env[match[1]] = value;
    }
  }
}

for (const f of ['scratch/.env.paula-migrate', '.env.local', '.env.production', '.env']) {
  loadEnvFile(path.join(process.cwd(), f));
}

const APPLY = process.argv.includes('--apply') && process.argv.includes('--confirm');
const MAP_PATH = path.join(process.cwd(), 'scratch/wp-blob-mirror-map.json');

function loadMirrorMap() {
  if (!fs.existsSync(MAP_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function saveMirrorMap(mapObj) {
  fs.mkdirSync(path.dirname(MAP_PATH), { recursive: true });
  fs.writeFileSync(MAP_PATH, JSON.stringify(mapObj, null, 2));
}

function isWpUploadUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (!url.includes('saotome.rn.gov.br/wp-content/uploads/')) return false;
  if (/LAJES[-_ ]?PINTADAS/i.test(url)) return false;
  return true;
}

function sanitizeBlobFilePath(srcUrl) {
  try {
    const u = new URL(srcUrl);
    const rel = decodeURIComponent(u.pathname).replace(/^\/wp-content\/uploads\//, '');
    const clean = rel
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9/_.-]/g, '_')
      .replace(/_+/g, '_');
    return `wp-arquivos/${clean}`;
  } catch {
    const hash = crypto.createHash('sha1').update(srcUrl).digest('hex').slice(0, 12);
    return `wp-arquivos/misc/${hash}`;
  }
}

function guessContentType(srcUrl, headerType) {
  const ct = (headerType || '').toLowerCase();
  if (ct && !ct.includes('text/html') && ct !== 'application/octet-stream') return ct;
  const lower = srcUrl.toLowerCase().split('?')[0];
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.mp3')) return 'audio/mpeg';
  if (lower.endsWith('.mp4')) return 'video/mp4';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
}

function extractInlineWpUploadUrls(html) {
  const urls = new Set();
  const re = /https?:\/\/saotome\.rn\.gov\.br\/wp-content\/uploads\/[^"'\s<>)]+/gi;
  let m;
  while ((m = re.exec(String(html || ''))) !== null) {
    const cleaned = m[0].replace(/[.,;)]+$/, '');
    if (!/LAJES[-_ ]?PINTADAS/i.test(cleaned)) urls.add(cleaned);
  }
  return Array.from(urls);
}

async function runPool(items, concurrency, worker) {
  let idx = 0;
  async function next() {
    while (idx < items.length) {
      const cur = items[idx++];
      await worker(cur);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => next()));
}

async function main() {
  const prisma = new PrismaClient();
  const mirrorMap = loadMirrorMap();

  try {
    console.log(`\n=== ESPELHAMENTO DE ARQUIVOS WP -> VERCEL BLOB (${APPLY ? 'APPLY' : 'DRY_RUN'}) ===\n`);

    const [
      legs, docs, rfs, concs, convs, diars, lics, cfgs, secs, nots,
    ] = await Promise.all([
      prisma.legislacao.findMany({
        where: { OR: [{ arquivo: { contains: 'saotome.rn.gov.br/wp-content/uploads' } }, { documentUrl: { contains: 'saotome.rn.gov.br/wp-content/uploads' } }] },
        select: { id: true, arquivo: true, documentUrl: true },
      }),
      prisma.documento.findMany({
        where: { OR: [{ arquivo: { contains: 'saotome.rn.gov.br/wp-content/uploads' } }, { documentUrl: { contains: 'saotome.rn.gov.br/wp-content/uploads' } }] },
        select: { id: true, arquivo: true, documentUrl: true },
      }),
      prisma.relatorioFiscal.findMany({
        where: { arquivo: { contains: 'saotome.rn.gov.br/wp-content/uploads' } },
        select: { id: true, arquivo: true },
      }),
      prisma.concurso.findMany({
        where: { linkEdital: { contains: 'saotome.rn.gov.br/wp-content/uploads' } },
        select: { id: true, linkEdital: true },
      }),
      prisma.convenio.findMany({
        where: { arquivoInteiroTeor: { contains: 'saotome.rn.gov.br/wp-content/uploads' } },
        select: { id: true, arquivoInteiroTeor: true },
      }),
      prisma.diaria.findMany({
        where: { portariaUrl: { contains: 'saotome.rn.gov.br/wp-content/uploads' } },
        select: { id: true, portariaUrl: true },
      }),
      prisma.licitacao.findMany({
        where: { editalUrl: { contains: 'saotome.rn.gov.br/wp-content/uploads' } },
        select: { id: true, editalUrl: true },
      }),
      prisma.configuracao.findMany({
        where: { valor: { contains: 'saotome.rn.gov.br/wp-content/uploads' } },
        select: { id: true, chave: true, valor: true },
      }),
      prisma.secretaria.findMany({
        where: { imagem: { contains: 'saotome.rn.gov.br/wp-content/uploads' } },
        select: { id: true, imagem: true },
      }),
      prisma.noticia.findMany({
        where: { OR: [{ imagem: { contains: 'saotome.rn.gov.br/wp-content/uploads' } }, { conteudo: { contains: 'saotome.rn.gov.br/wp-content/uploads' } }] },
        select: { id: true, imagem: true, conteudo: true },
      }),
    ]);

    const uniqueUrls = new Set();
    const collect = (u) => { if (isWpUploadUrl(u)) uniqueUrls.add(u); };
    for (const r of legs) { collect(r.arquivo); collect(r.documentUrl); }
    for (const r of docs) { collect(r.arquivo); collect(r.documentUrl); }
    for (const r of rfs) collect(r.arquivo);
    for (const r of concs) collect(r.linkEdital);
    for (const r of convs) collect(r.arquivoInteiroTeor);
    for (const r of diars) collect(r.portariaUrl);
    for (const r of lics) collect(r.editalUrl);
    for (const r of cfgs) collect(r.valor);
    for (const r of secs) collect(r.imagem);
    for (const r of nots) {
      collect(r.imagem);
      for (const inlineU of extractInlineWpUploadUrls(r.conteudo)) collect(inlineU);
    }

    const existingBlobs = new Map();
    let blobStoreCount = 0;
    let blobStoreBytes = 0;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      let cursor;
      do {
        const res = await list({ limit: 1000, cursor });
        for (const b of res.blobs) {
          existingBlobs.set(b.pathname, b.url);
          blobStoreCount++;
          blobStoreBytes += b.size || 0;
        }
        cursor = res.hasMore ? res.cursor : undefined;
      } while (cursor);
    }

    const stats = {
      referenciasEncontradas: {
        legislacao: legs.length,
        documento: docs.length,
        relatorioFiscal: rfs.length,
        concurso: concs.length,
        convenio: convs.length,
        diaria: diars.length,
        licitacao: lics.length,
        configuracao: cfgs.length,
        secretaria: secs.length,
        noticia: nots.length,
      },
      uniqueWpUrls: uniqueUrls.size,
      fromCacheOrBlob: 0,
      uploaded: 0,
      bytesUploaded: 0,
      failed: [],
      quotaError: null,
      dbRecordsUpdated: 0,
    };

    const urlList = Array.from(uniqueUrls);
    console.log(`URLs únicas em saotome.rn.gov.br/wp-content/uploads: ${urlList.length} (Blob atual: ${blobStoreCount} arquivos / ${(blobStoreBytes / 1024 / 1024).toFixed(2)} MB)`);

    await runPool(urlList, 4, async (srcUrl) => {
      if (stats.quotaError) return;
      if (mirrorMap[srcUrl]) {
        stats.fromCacheOrBlob++;
        return;
      }
      const blobPath = sanitizeBlobFilePath(srcUrl);
      if (existingBlobs.has(blobPath)) {
        mirrorMap[srcUrl] = existingBlobs.get(blobPath);
        stats.fromCacheOrBlob++;
        return;
      }
      if (!APPLY) return;

      try {
        const res = await fetch(srcUrl, { headers: { 'User-Agent': 'Mozilla/5.0 PortalSaoTomeMigrator/1.0' } });
        if (!res.ok) {
          stats.failed.push({ url: srcUrl, reason: `HTTP ${res.status}` });
          return;
        }
        const ctypeHeader = (res.headers.get('content-type') || '').toLowerCase();
        if (ctypeHeader.includes('text/html')) {
          stats.failed.push({ url: srcUrl, reason: `HTML returned (${ctypeHeader})` });
          return;
        }
        const buf = Buffer.from(await res.arrayBuffer());
        const contentType = guessContentType(srcUrl, ctypeHeader);
        const uploaded = await put(blobPath, buf, {
          access: 'public',
          addRandomSuffix: false,
          contentType,
        });
        mirrorMap[srcUrl] = uploaded.url;
        existingBlobs.set(blobPath, uploaded.url);
        stats.uploaded++;
        stats.bytesUploaded += buf.length;
      } catch (err) {
        stats.failed.push({ url: srcUrl, reason: err.message });
        if (/quota|limit|storage|413|402|403/i.test(String(err.message))) {
          stats.quotaError = err.message;
        }
      }
    });

    if (APPLY) {
      saveMirrorMap(mirrorMap);

      for (const r of legs) {
        const data = {};
        if (isWpUploadUrl(r.arquivo) && mirrorMap[r.arquivo]) data.arquivo = mirrorMap[r.arquivo];
        if (isWpUploadUrl(r.documentUrl) && mirrorMap[r.documentUrl]) data.documentUrl = mirrorMap[r.documentUrl];
        if (Object.keys(data).length > 0) {
          await prisma.legislacao.update({ where: { id: r.id }, data });
          stats.dbRecordsUpdated++;
        }
      }
      for (const r of docs) {
        const data = {};
        if (isWpUploadUrl(r.arquivo) && mirrorMap[r.arquivo]) data.arquivo = mirrorMap[r.arquivo];
        if (isWpUploadUrl(r.documentUrl) && mirrorMap[r.documentUrl]) data.documentUrl = mirrorMap[r.documentUrl];
        if (Object.keys(data).length > 0) {
          await prisma.documento.update({ where: { id: r.id }, data });
          stats.dbRecordsUpdated++;
        }
      }
      for (const r of rfs) {
        if (isWpUploadUrl(r.arquivo) && mirrorMap[r.arquivo]) {
          await prisma.relatorioFiscal.update({ where: { id: r.id }, data: { arquivo: mirrorMap[r.arquivo] } });
          stats.dbRecordsUpdated++;
        }
      }
      for (const r of concs) {
        if (isWpUploadUrl(r.linkEdital) && mirrorMap[r.linkEdital]) {
          await prisma.concurso.update({ where: { id: r.id }, data: { linkEdital: mirrorMap[r.linkEdital] } });
          stats.dbRecordsUpdated++;
        }
      }
      for (const r of convs) {
        if (isWpUploadUrl(r.arquivoInteiroTeor) && mirrorMap[r.arquivoInteiroTeor]) {
          await prisma.convenio.update({ where: { id: r.id }, data: { arquivoInteiroTeor: mirrorMap[r.arquivoInteiroTeor] } });
          stats.dbRecordsUpdated++;
        }
      }
      for (const r of diars) {
        if (isWpUploadUrl(r.portariaUrl) && mirrorMap[r.portariaUrl]) {
          await prisma.diaria.update({ where: { id: r.id }, data: { portariaUrl: mirrorMap[r.portariaUrl] } });
          stats.dbRecordsUpdated++;
        }
      }
      for (const r of lics) {
        if (isWpUploadUrl(r.editalUrl) && mirrorMap[r.editalUrl]) {
          await prisma.licitacao.update({ where: { id: r.id }, data: { editalUrl: mirrorMap[r.editalUrl] } });
          stats.dbRecordsUpdated++;
        }
      }
      for (const r of cfgs) {
        if (isWpUploadUrl(r.valor) && mirrorMap[r.valor]) {
          await prisma.configuracao.update({ where: { id: r.id }, data: { valor: mirrorMap[r.valor] } });
          stats.dbRecordsUpdated++;
        }
      }
      for (const r of secs) {
        if (isWpUploadUrl(r.imagem) && mirrorMap[r.imagem]) {
          await prisma.secretaria.update({ where: { id: r.id }, data: { imagem: mirrorMap[r.imagem] } });
          stats.dbRecordsUpdated++;
        }
      }
      for (const r of nots) {
        const data = {};
        if (isWpUploadUrl(r.imagem) && mirrorMap[r.imagem]) data.imagem = mirrorMap[r.imagem];
        let newContent = r.conteudo;
        let changed = false;
        for (const u of extractInlineWpUploadUrls(newContent)) {
          if (mirrorMap[u]) {
            newContent = newContent.split(u).join(mirrorMap[u]);
            changed = true;
          }
        }
        if (changed) data.conteudo = newContent;
        if (Object.keys(data).length > 0) {
          await prisma.noticia.update({ where: { id: r.id }, data });
          stats.dbRecordsUpdated++;
        }
      }
    }

    // Recontar uso final do Blob se aplicou
    let finalBlobCount = blobStoreCount;
    let finalBlobBytes = blobStoreBytes + stats.bytesUploaded;
    if (APPLY && process.env.BLOB_READ_WRITE_TOKEN) {
      finalBlobCount = 0;
      finalBlobBytes = 0;
      let cursor;
      do {
        const res = await list({ limit: 1000, cursor });
        for (const b of res.blobs) {
          finalBlobCount++;
          finalBlobBytes += b.size || 0;
        }
        cursor = res.hasMore ? res.cursor : undefined;
      } while (cursor);
    }

    const report = {
      mode: APPLY ? 'APPLY' : 'DRY_RUN',
      timestamp: new Date().toISOString(),
      ...stats,
      uploadedMB: +(stats.bytesUploaded / 1024 / 1024).toFixed(2),
      blobTotalFilesAfter: finalBlobCount,
      blobTotalMBAfter: +(finalBlobBytes / 1024 / 1024).toFixed(2),
    };

    const outPath = path.join(process.cwd(), 'scratch/relatorio-espelhamento-arquivos-blob.json');
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
    console.log('\nResumo Espelhamento Blob:', JSON.stringify({
      uniqueWpUrls: report.uniqueWpUrls,
      fromCacheOrBlob: report.fromCacheOrBlob,
      uploaded: report.uploaded,
      uploadedMB: report.uploadedMB,
      dbRecordsUpdated: report.dbRecordsUpdated,
      failedCount: report.failed.length,
      blobTotalFilesAfter: report.blobTotalFilesAfter,
      blobTotalMBAfter: report.blobTotalMBAfter,
    }, null, 2));
    console.log(`Relatório salvo em: ${outPath}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Erro fatal em espelhar-arquivos-wp-blob:', e);
  process.exit(1);
});
