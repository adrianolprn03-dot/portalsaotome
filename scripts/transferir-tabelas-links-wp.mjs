#!/usr/bin/env node
/**
 * Transferência Completa de Tabelas, Links Externos, Configurações e Documentos
 * Origem (WordPress): https://saotome.rn.gov.br/
 * Destino (Next.js + Prisma/Neon): https://saotomern.vercel.app/
 *
 * Uso:
 *   node scripts/transferir-tabelas-links-wp.mjs --dry-run
 *   node scripts/transferir-tabelas-links-wp.mjs --apply --confirm
 */

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';
import { decode } from 'html-entities';

// ---------------------------------------------------------------------------
// 1. Ambiente (ordem estrita: .env.paula-migrate -> .env.local -> .env.production -> .env)
// ---------------------------------------------------------------------------
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
const WP_BASE = 'https://saotome.rn.gov.br';
const GENERIC_SHARED_DRIVE_ID = '15yXZYj7SI7mSNIjK_5h5X6TXsuMPz9YL';

// ---------------------------------------------------------------------------
// 2. Utilitários de Parsing e Normalização
// ---------------------------------------------------------------------------
function normalizeText(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function extractDriveId(url) {
  if (!url) return null;
  const m1 = String(url).match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (m1) return m1[1];
  const m2 = String(url).match(/\/file\/d\/([a-zA-Z0-9_-]{15,})/);
  if (m2) return m2[1];
  return null;
}

function isUniqueDriveId(id) {
  return Boolean(id && id !== GENERIC_SHARED_DRIVE_ID);
}

function fileBasename(url) {
  if (!url) return '';
  try {
    const clean = String(url).split('?')[0].split('#')[0];
    return decodeURIComponent(path.posix.basename(clean)).toLowerCase();
  } catch {
    return '';
  }
}

function isValidHttpUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!/^https?:\/\/[^\s]+$/i.test(trimmed)) return false;
  if (trimmed.includes('\t') || /^https?:\/\/Relat/i.test(trimmed)) return false;
  if (/^https?:\/\/[À-ÿ]/i.test(trimmed)) return false;
  try {
    const parsed = new URL(trimmed);
    return Boolean(parsed.hostname && parsed.hostname.includes('.'));
  } catch {
    return false;
  }
}

function parseMoney(str) {
  const clean = String(str || '').replace(/R\$/gi, '').replace(/\s+/g, '').trim();
  if (!clean || clean === '-') return 0;
  const hasComma = clean.includes(',');
  const hasDot = clean.includes('.');
  if (hasComma && hasDot) {
    if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
      return parseFloat(clean.replace(/\./g, '').replace(',', '.')) || 0;
    }
    return parseFloat(clean.replace(/,/g, '')) || 0;
  }
  if (hasComma) {
    if (/,\d{1,2}$/.test(clean)) return parseFloat(clean.replace(',', '.')) || 0;
    return parseFloat(clean.replace(/,/g, '')) || 0;
  }
  return parseFloat(clean) || 0;
}

function makeUtcDate(year, month, day) {
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) {
    return null;
  }
  return d;
}

/**
 * Parser inteligente para Diárias (#tablepress-60):
 * A tabela do WP exportada de planilha usa datas majoritariamente no formato MM/DD/YYYY (ex.: 11/8/2026 a 11/12/2026 = 5 dias),
 * mas linhas ocasionais usam DD/MM/YYYY. Testamos ambos contra quantidadeDias e preferimos US quando empata.
 */
function parseDiariaDates(rawIni, rawFim, qtdDias) {
  const mIni = String(rawIni || '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const mFim = String(rawFim || '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!mIni) return null;

  const a1 = parseInt(mIni[1], 10);
  const b1 = parseInt(mIni[2], 10);
  const y1 = parseInt(mIni[3], 10);

  const a2 = mFim ? parseInt(mFim[1], 10) : a1;
  const b2 = mFim ? parseInt(mFim[2], 10) : b1;
  const y2 = mFim ? parseInt(mFim[3], 10) : y1;

  // US: MM/DD/YYYY
  const usIni = makeUtcDate(y1, a1, b1);
  const usFim = makeUtcDate(y2, a2, b2);

  // BR: DD/MM/YYYY
  const brIni = makeUtcDate(y1, b1, a1);
  const brFim = makeUtcDate(y2, b2, a2);

  const scorePair = (ini, fim, preferBias) => {
    if (!ini || !fim) return -Infinity;
    const diffDays = Math.round((fim.getTime() - ini.getTime()) / 86400000);
    if (diffDays < 0 || diffDays > 45) return -1000 - Math.abs(diffDays);
    const qtd = Math.max(0.5, Number(qtdDias) || 1);
    const inclusiveSpan = diffDays + 1;
    const d1 = Math.abs(inclusiveSpan - qtd);
    const d2 = Math.abs(diffDays - qtd);
    const minErr = Math.min(d1, d2);
    return -minErr * 10 + preferBias;
  };

  const usScore = scorePair(usIni, usFim, 0.05); // Leve desempate para MM/DD/YYYY conforme padrão da planilha WP
  const brScore = scorePair(brIni, brFim, 0);

  let chosen = null;
  if (usIni && usFim && usScore >= brScore && usScore > -100) {
    chosen = { dataInicio: usIni, dataFim: usFim, format: 'US' };
  } else if (brIni && brFim && brScore > -100) {
    chosen = { dataInicio: brIni, dataFim: brFim, format: 'BR' };
  } else if (usIni) {
    chosen = { dataInicio: usIni, dataFim: usFim || usIni, format: 'US-fallback' };
  } else if (brIni) {
    chosen = { dataInicio: brIni, dataFim: brFim || brIni, format: 'BR-fallback' };
  }

  if (!chosen) return null;
  return {
    ...chosen,
    mes: chosen.dataInicio.getUTCMonth() + 1,
    ano: chosen.dataInicio.getUTCFullYear(),
    altMes: brIni ? brIni.getUTCMonth() + 1 : null,
  };
}

function parseBrDateOnly(str) {
  const m = String(str || '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  return makeUtcDate(parseInt(m[3], 10), parseInt(m[2], 10), parseInt(m[1], 10));
}

function parsePtBrDate(text) {
  if (!text) return null;
  const meses = {
    janeiro: 0, fevereiro: 1, marco: 2, abril: 3, maio: 4, junho: 5,
    julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11,
  };
  const norm = normalizeText(text).toLowerCase();
  const m = norm.match(/(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(\d{4})/);
  if (m && meses[m[2]] !== undefined) {
    return new Date(Date.UTC(parseInt(m[3], 10), meses[m[2]], parseInt(m[1], 10), 12, 0, 0));
  }
  const br = String(text).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (br) {
    return makeUtcDate(parseInt(br[3], 10), parseInt(br[2], 10), parseInt(br[1], 10));
  }
  return null;
}

function inferSecretariaDiaria(cargo, motivo) {
  const txt = normalizeText(`${cargo} ${motivo}`);
  if (/SAUDE|ENFERM|MEDIC|HOSPITAL|PSF|UBS|CAPS|VIGILANCIA|VACINA|PACIENTE|SAMU|DENGUE|SUS/.test(txt)) {
    return 'Saúde';
  }
  if (/EDUCAC|ESCOL|PROFESSOR|MERENDA|ALUNO|PEDAGOG|FUNDEB|CRECHE/.test(txt)) {
    return 'Educação';
  }
  if (/ASSISTENCIA|CRAS|SOCIAL|CONSELH.*TUTELAR|SUAS|BOLSA FAMILIA|LEITE/.test(txt)) {
    return 'Assistência Social';
  }
  if (/PREFEIT|GABINETE/.test(txt) && !/VICE/.test(txt)) {
    return 'Gabinete do Prefeito';
  }
  if (/OBRAS|ENGENH|TRANSPORTE|MOTORISTA|ESTRADAS/.test(txt)) {
    return 'Obras e Infraestrutura';
  }
  if (/AGRICULT|PECUAR|MEIO AMBIENTE|RURAL/.test(txt)) {
    return 'Agricultura e Meio Ambiente';
  }
  if (/FINANC|CONTABIL|TESOUR|TRIBUT|ORCAMENT/.test(txt)) {
    return 'Finanças e Controle';
  }
  if (/PROCURADOR|JURIDIC/.test(txt)) {
    return 'Procuradoria Jurídica';
  }
  return 'Administração';
}

function normalizeModalidadeLicitacao(raw, fallback = 'dispensa') {
  const t = normalizeText(raw);
  if (t.includes('DISPENSA')) return 'dispensa';
  if (t.includes('INEXIGIBIL')) return 'inexigibilidade';
  if (t.includes('PREGAO')) return 'pregao';
  if (t.includes('CONCORRENCIA')) return 'concorrencia';
  if (t.includes('TOMADA')) return 'tomada-precos';
  if (t.includes('CONVITE')) return 'convite';
  if (t.includes('CREDENCIAMENTO')) return 'credenciamento';
  if (t.includes('LEILAO')) return 'leilao';
  if (t.includes('ADESAO') || t.includes('CARONA')) return 'adesao';
  return fallback;
}

function inferSecretariaLicitacao(objeto) {
  const t = normalizeText(objeto);
  if (/SAUDE|MEDICAMENTO|UBS|HOSPITAL|EXAME|ODONT|ENFERM/.test(t)) return 'Secretaria de Saúde';
  if (/ESCOL|MERENDA|ALUNO|ENSINO|CRECHE|EDUCACAO|DIDATIC/.test(t)) return 'Secretaria de Educação, Cultura e Desporto';
  if (/ASSISTENCIA|CRAS|SCFV|URNA FUNERARIA|AUXILIO/.test(t)) return 'Secretaria de Trabalho, Habitação e Assistência Social';
  if (/PAVIMENT|OBRA|ENGENHARIA|REFORMA|ILUMINACAO|COMBUSTIVEL|VEICULO|CALCAMENTO/.test(t)) return 'Secretaria de Obras, Transporte e Serviços Urbanos';
  if (/AGRICULT|TRATOR|SEMENTE|ABATEDOURO/.test(t)) return 'Secretaria de Agricultura, Meio Ambiente e Turismo';
  return 'Secretaria de Administração e Planejamento';
}

function parseNumeroAnoAto(rawNumero, ementa = '') {
  const clean = String(rawNumero || '').replace(/\s+/g, ' ').trim();
  const slashMatch = clean.match(/([0-9.]+)\s*\/\s*(\d{4})\b/);
  if (slashMatch) {
    const numDigits = slashMatch[1].replace(/\./g, '');
    const numInt = parseInt(numDigits, 10);
    return {
      numero: `${numDigits}/${slashMatch[2]}`,
      numeroSemZero: isNaN(numInt) ? numDigits : String(numInt),
      ano: parseInt(slashMatch[2], 10),
    };
  }
  const dashMatch = clean.match(/(\d{1,4})\s*-\s*(\d{2,4})\b/);
  if (dashMatch) {
    const y = dashMatch[2].length === 2 ? 2000 + parseInt(dashMatch[2], 10) : parseInt(dashMatch[2], 10);
    const numInt = parseInt(dashMatch[1], 10);
    return { numero: `${dashMatch[1]}/${y}`, numeroSemZero: String(numInt), ano: y };
  }
  const yearInEmenta = String(ementa || '').match(/\b(20\d{2}|19\d{2})\b/);
  const digitsOnly = clean.replace(/\D/g, '');
  if (yearInEmenta && digitsOnly) {
    return {
      numero: `${digitsOnly}/${yearInEmenta[1]}`,
      numeroSemZero: String(parseInt(digitsOnly, 10)),
      ano: parseInt(yearInEmenta[1], 10),
    };
  }
  return {
    numero: clean || 'S/N',
    numeroSemZero: digitsOnly ? String(parseInt(digitsOnly, 10)) : clean || 'S/N',
    ano: yearInEmenta ? parseInt(yearInEmenta[1], 10) : null,
  };
}

async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 PortalSaoTomeMigrator/1.0' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.text();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 800 * attempt));
    }
  }
}

async function fetchJsonSafe(url) {
  const txt = await fetchWithRetry(url);
  return JSON.parse(txt);
}

async function checkUrlOk(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// 3. Execução Principal
// ---------------------------------------------------------------------------
async function main() {
  const prisma = new PrismaClient();
  const report = {
    mode: APPLY ? 'APPLY' : 'DRY_RUN',
    timestamp: new Date().toISOString(),
    modules: {},
  };

  try {
    console.log(`\n=== TRANSFERÊNCIA DE TABELAS, LINKS E ARQUIVOS (${report.mode}) ===\n`);

    const [
      diariasHtml,
      dispensasHtml,
      editaisHtml,
      obrasHtml,
      dividaHtml,
      convenioHtml,
      faqHtml,
      cartaHtml,
      camaraHtml,
      tceHtml,
      inicioHtml,
      cptDecretos,
    ] = await Promise.all([
      fetchWithRetry(`${WP_BASE}/diarias/`),
      fetchWithRetry(`${WP_BASE}/dispensas-de-licitacoes/`),
      fetchWithRetry(`${WP_BASE}/editais/`),
      fetchWithRetry(`${WP_BASE}/obras/`),
      fetchWithRetry(`${WP_BASE}/divida-ativa/`),
      fetchWithRetry(`${WP_BASE}/convenio/`),
      fetchWithRetry(`${WP_BASE}/perguntas-e-respostas/`),
      fetchWithRetry(`${WP_BASE}/carta-de-servicos/`),
      fetchWithRetry(`${WP_BASE}/apreciacao-de-contas-poder-legislativo/`),
      fetchWithRetry(`${WP_BASE}/apreciacao-de-contas-tce/`),
      fetchWithRetry(`${WP_BASE}/inicio/`),
      fetchJsonSafe(`${WP_BASE}/wp-json/wp/v2/decretos?per_page=100`).catch(() => []),
    ]);

    // =========================================================================
    // MÓDULO 1: DIÁRIAS (#tablepress-60 -> prisma.diaria)
    // =========================================================================
    {
      const $ = cheerio.load(diariasHtml);
      const dbDiarias = await prisma.diaria.findMany();
      const dbByDrive = new Map();
      for (const d of dbDiarias) {
        const did = extractDriveId(d.portariaUrl);
        if (isUniqueDriveId(did)) dbByDrive.set(did, d);
      }

      const wpRows = [];
      $('#tablepress-60 tbody tr').each((i, tr) => {
        const tds = $(tr).find('td');
        if (tds.length < 9) return;
        const rawIni = $(tds[0]).text().trim();
        const rawFim = $(tds[1]).text().trim();
        const cargo = $(tds[2]).text().replace(/\s+/g, ' ').trim();
        const servidor = $(tds[3]).text().replace(/\s+/g, ' ').trim();
        const motivo = $(tds[4]).text().replace(/\s+/g, ' ').trim();
        const destino = $(tds[5]).text().replace(/\s+/g, ' ').trim();
        const qtd = parseMoney($(tds[6]).text()) || 1;
        const valUnit = parseMoney($(tds[7]).text());
        const valTot = parseMoney($(tds[8]).text());
        const href = $(tr).find('a[href]').attr('href')?.trim() || null;
        if (!servidor && !rawIni) return;
        const parsedDates = parseDiariaDates(rawIni, rawFim, qtd);
        if (!parsedDates) return;
        wpRows.push({
          rowIdx: i + 1,
          rawIni,
          rawFim,
          ...parsedDates,
          cargo: cargo || 'Servidor Municipal',
          servidor: servidor || 'Não informado',
          motivo: motivo || 'Missão oficial a serviço do município',
          destino: destino || 'RN',
          quantidadeDias: qtd,
          valorUnitario: valUnit || (qtd > 0 ? +(valTot / qtd).toFixed(2) : valTot),
          valor: valTot || valUnit * qtd,
          portariaUrl: isValidHttpUrl(href) ? href : null,
          driveId: extractDriveId(href),
          secretaria: inferSecretariaDiaria(cargo, motivo),
        });
      });

      const matchedDbIds = new Set();
      const updates = [];
      const inserts = [];

      for (const w of wpRows) {
        let match = isUniqueDriveId(w.driveId) ? dbByDrive.get(w.driveId) : null;
        if (!match) {
          match = dbDiarias.find((db) => {
            if (matchedDbIds.has(db.id)) return false;
            if (normalizeText(db.servidor) !== normalizeText(w.servidor)) return false;
            if (db.ano !== w.ano) return false;
            if (Math.round(db.valor * 100) !== Math.round(w.valor * 100)) return false;
            const diffMs = Math.abs(db.dataInicio.getTime() - w.dataInicio.getTime());
            const dbDay = db.dataInicio.getUTCDate();
            const dbMonth = db.dataInicio.getUTCMonth() + 1;
            const wDay = w.dataInicio.getUTCDate();
            const wMonth = w.dataInicio.getUTCMonth() + 1;
            return diffMs <= 3 * 86400000 || (dbMonth === wMonth && dbDay === wDay) || (dbDay === wMonth && dbMonth === wDay);
          });
        }
        if (match) {
          matchedDbIds.add(match.id);
          if (!match.portariaUrl && w.portariaUrl) {
            updates.push({ id: match.id, data: { portariaUrl: w.portariaUrl } });
          }
        } else {
          inserts.push({
            servidor: w.servidor,
            cargo: w.cargo,
            destino: w.destino,
            tipoDestino: /BRASILIA|DF|PERNAMBUCO|CEARA|PARAIBA|SAO PAULO|RIO DE JANEIRO|BAHIA|SALVADOR|RECIFE|FORTALEZA/i.test(normalizeText(w.destino)) ? 'nacional' : 'estadual',
            motivo: w.motivo,
            dataInicio: w.dataInicio,
            dataFim: w.dataFim,
            valor: w.valor,
            valorUnitario: w.valorUnitario,
            quantidadeDias: w.quantidadeDias,
            secretaria: w.secretaria,
            mes: w.mes,
            ano: w.ano,
            portariaUrl: w.portariaUrl,
            fonteOrigem: 'Portal Oficial saotome.rn.gov.br (#tablepress-60)',
            situacaoPublicacao: 'publicado',
          });
        }
      }

      if (APPLY) {
        for (const u of updates) await prisma.diaria.update({ where: { id: u.id }, data: u.data });
        if (inserts.length > 0) await prisma.diaria.createMany({ data: inserts });
      }
      report.modules.diarias = { wpTotal: wpRows.length, dbAntes: dbDiarias.length, updates: updates.length, inserts: inserts.length };
      console.log(`[Diárias] WP=${wpRows.length} | DB antes=${dbDiarias.length} | updates=${updates.length} | inserts=${inserts.length}`);
    }

    // =========================================================================
    // MÓDULO 2: DISPENSAS (#tablepress-25) + LICITAÇÕES (#tablepress-3) -> prisma.licitacao
    // =========================================================================
    {
      const dbLics = await prisma.licitacao.findMany();
      const seenDrive = new Set();
      const seenKey = new Set();
      for (const l of dbLics) {
        const did = extractDriveId(l.editalUrl);
        if (isUniqueDriveId(did)) seenDrive.add(did);
        seenKey.add(`${normalizeText(l.numero)}|${l.ano}|${l.modalidade}`);
        seenKey.add(`${normalizeText(l.numero)}|${l.ano}|${normalizeText(l.objeto).slice(0, 80)}`);
      }

      const inserts = [];

      const $disp = cheerio.load(dispensasHtml);
      let wpDispCount = 0;
      $disp('#tablepress-25 tbody tr').each((i, tr) => {
        const tds = $disp(tr).find('td');
        if (tds.length < 3) return;
        const numero = $disp(tds[0]).text().replace(/\s+/g, ' ').trim();
        const modalidadeRaw = $disp(tds[1]).text().replace(/\s+/g, ' ').trim();
        const objeto = $disp(tds[2]).text().replace(/\s+/g, ' ').trim();
        const inicioTxt = tds[3] ? $disp(tds[3]).text().replace(/\s+/g, ' ').trim() : '';
        const aberturaTxt = tds[6] ? $disp(tds[6]).text().replace(/\s+/g, ' ').trim() : '';
        const rawHref = $disp(tr).find('a[href]').attr('href')?.trim() || '';
        if (!numero && !objeto) return;
        wpDispCount++;

        const editalUrl = isValidHttpUrl(rawHref) ? rawHref : null;
        const driveId = extractDriveId(editalUrl);
        const mod = normalizeModalidadeLicitacao(modalidadeRaw, 'dispensa');
        const mAno = numero.match(/\/(20\d{2})/) || aberturaTxt.match(/\b(20\d{2})\b/) || inicioTxt.match(/\b(20\d{2})\b/) || objeto.match(/\b(20\d{2})\b/);
        const ano = mAno ? parseInt(mAno[1], 10) : 2024;
        const dataPub = parsePtBrDate(inicioTxt);
        const dataAb = parsePtBrDate(aberturaTxt);

        const k1 = `${normalizeText(numero)}|${ano}|${mod}`;
        const k2 = `${normalizeText(numero)}|${ano}|${normalizeText(objeto).slice(0, 80)}`;
        if ((isUniqueDriveId(driveId) && seenDrive.has(driveId)) || seenKey.has(k1) || seenKey.has(k2)) return;

        if (isUniqueDriveId(driveId)) seenDrive.add(driveId);
        seenKey.add(k1);
        seenKey.add(k2);

        const status = /CANCEL/i.test(objeto) ? 'cancelada' : /DESERT/i.test(objeto) ? 'deserta' : 'concluida';
        inserts.push({
          numero: numero || `DISP-${i + 1}/${ano}`,
          ano,
          modalidade: mod,
          objeto: objeto || `${modalidadeRaw} nº ${numero}`,
          status,
          dataAbertura: dataAb || dataPub,
          dataPublicacao: dataPub || dataAb || new Date(Date.UTC(ano, 0, 15, 12, 0, 0)),
          secretaria: inferSecretariaLicitacao(objeto),
          amparoLegal: ano >= 2024 ? 'Lei Federal nº 14.133/2021' : 'Lei Federal nº 8.666/1993',
          editalUrl,
          ataRegistroPreco: /REGISTRO DE PRE[ÇC]O/i.test(objeto),
          fonteOrigem: 'Portal Oficial saotome.rn.gov.br (/dispensas-de-licitacoes/)',
          situacaoPublicacao: 'publicado',
        });
      });

      const $ed = cheerio.load(editaisHtml);
      let wpEdCount = 0;
      $ed('#tablepress-3 tbody tr').each((i, tr) => {
        const tds = $ed(tr).find('td');
        if (tds.length < 3) return;
        const numero = $ed(tds[0]).text().replace(/\s+/g, ' ').trim();
        const modalidadeRaw = $ed(tds[1]).text().replace(/\s+/g, ' ').trim();
        const objeto = $ed(tds[2]).text().replace(/\s+/g, ' ').trim();
        const inicioTxt = tds[3] ? $ed(tds[3]).text().replace(/\s+/g, ' ').trim() : '';
        const aberturaTxt = tds[5] ? $ed(tds[5]).text().replace(/\s+/g, ' ').trim() : '';
        const rawHref = $ed(tr).find('a[href]').attr('href')?.trim() || '';
        if (!numero && !objeto) return;
        wpEdCount++;

        const editalUrl = isValidHttpUrl(rawHref) ? rawHref : null;
        const driveId = extractDriveId(editalUrl);
        const mod = normalizeModalidadeLicitacao(modalidadeRaw, 'pregao');
        const mAno = numero.match(/\/(20\d{2})/) || aberturaTxt.match(/\b(20\d{2})\b/) || inicioTxt.match(/\b(20\d{2})\b/);
        const ano = mAno ? parseInt(mAno[1], 10) : 2024;
        const dataPub = parsePtBrDate(inicioTxt);
        const dataAb = parsePtBrDate(aberturaTxt);

        const k1 = `${normalizeText(numero)}|${ano}|${mod}`;
        const k2 = `${normalizeText(numero)}|${ano}|${normalizeText(objeto).slice(0, 80)}`;
        if ((isUniqueDriveId(driveId) && seenDrive.has(driveId)) || seenKey.has(k1) || seenKey.has(k2)) return;

        if (isUniqueDriveId(driveId)) seenDrive.add(driveId);
        seenKey.add(k1);
        seenKey.add(k2);

        const nowCutoff = new Date(Date.UTC(2026, 9, 1));
        const status = /CANCEL/i.test(objeto) ? 'cancelada' : /DESERT/i.test(objeto) ? 'deserta' : (dataAb && dataAb > nowCutoff ? 'aberta' : 'concluida');
        inserts.push({
          numero: numero || `ED-${i + 1}/${ano}`,
          ano,
          modalidade: mod,
          objeto: objeto || `${modalidadeRaw} nº ${numero}`,
          status,
          dataAbertura: dataAb || dataPub,
          dataPublicacao: dataPub || dataAb || new Date(Date.UTC(ano, 0, 15, 12, 0, 0)),
          secretaria: inferSecretariaLicitacao(objeto),
          amparoLegal: 'Lei Federal nº 14.133/2021',
          editalUrl,
          ataRegistroPreco: /REGISTRO DE PRE[ÇC]O/i.test(objeto) || /REGISTRO DE PRE[ÇC]O/i.test(modalidadeRaw),
          fonteOrigem: 'Portal Oficial saotome.rn.gov.br (/editais/)',
          situacaoPublicacao: 'publicado',
        });
      });

      if (APPLY && inserts.length > 0) {
        await prisma.licitacao.createMany({ data: inserts });
      }
      report.modules.licitacoes = { wpDispensas: wpDispCount, wpEditaisLic: wpEdCount, dbAntes: dbLics.length, inserts: inserts.length };
      console.log(`[Licitações/Dispensas] WP Dispensas=${wpDispCount} + Editais=${wpEdCount} | DB antes=${dbLics.length} | inserts=${inserts.length}`);
    }

    // =========================================================================
    // MÓDULO 3: OBRAS PÚBLICAS (#tablepress-40 -> prisma.obra)
    // =========================================================================
    {
      const $ = cheerio.load(obrasHtml);
      const dbObras = await prisma.obra.findMany();
      const seenObras = new Set(
        dbObras.map((o) => `${o.dataInicio ? o.dataInicio.toISOString().slice(0, 10) : ''}|${Math.round(o.valor)}|${normalizeText(o.local).slice(0, 40)}`)
      );

      const inserts = [];
      let wpObrasCount = 0;
      $('#tablepress-40 tbody tr').each((_, tr) => {
        const tds = $(tr).find('td');
        if (tds.length < 7) return;
        const dtStr = $(tds[0]).text().trim();
        const etapas = $(tds[1]).text().replace(/\s+/g, ' ').trim();
        const pctStr = $(tds[2]).text().trim();
        const secretaria = $(tds[3]).text().replace(/\s+/g, ' ').trim();
        const objeto = $(tds[4]).text().replace(/\s+/g, ' ').trim();
        const local = $(tds[5]).text().replace(/\s+/g, ' ').trim();
        const valorStr = $(tds[6]).text().trim();
        if (!objeto && !valorStr) return;
        wpObrasCount++;

        const dataInicio = parseBrDateOnly(dtStr);
        const percentual = Math.min(100, Math.max(0, Math.round(parseMoney(pctStr))));
        const valor = parseMoney(valorStr);
        const key = `${dataInicio ? dataInicio.toISOString().slice(0, 10) : ''}|${Math.round(valor)}|${normalizeText(local).slice(0, 40)}`;
        if (seenObras.has(key)) return;
        seenObras.add(key);

        let empresa = null;
        let cnpjEmpresa = null;
        const empCnpjMatch = objeto.match(/([A-ZÀ-Ú0-9\s.&-]+?)\s*-\s*(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/);
        if (empCnpjMatch) {
          empresa = empCnpjMatch[1].trim();
          cnpjEmpresa = empCnpjMatch[2].trim();
        }
        const ctrMatch = objeto.match(/CONTRATO DE REPASSE[^,;.)]+/i);
        const numeroContrato = ctrMatch ? ctrMatch[0].trim() : null;

        let titulo = objeto;
        if (/^ENGENHARIA QUALITY LTDA/i.test(objeto)) {
          titulo = 'Serviços de Engenharia - Zona Urbana e Rural (Engenharia Quality Ltda)';
        } else if (titulo.length > 115) {
          titulo = titulo.slice(0, 112).trim() + '...';
        }

        inserts.push({
          titulo,
          descricao: `${objeto}${etapas ? ` — Etapas / Medições: ${etapas}` : ''}`,
          local: local || 'Município de São Tomé/RN',
          secretaria: secretaria || 'Secretaria de Obras, Transporte e Serviços Urbanos',
          numeroContrato,
          valor,
          valorPago: percentual > 0 ? +(valor * (percentual / 100)).toFixed(2) : 0,
          status: percentual >= 100 ? 'concluida' : 'em-andamento',
          dataInicio,
          empresa,
          cnpjEmpresa,
          percentual,
          fonteOrigem: 'Portal Oficial saotome.rn.gov.br (/obras/)',
          situacaoPublicacao: 'publicado',
        });
      });

      if (APPLY && inserts.length > 0) {
        await prisma.obra.createMany({ data: inserts });
      }
      report.modules.obras = { wpTotal: wpObrasCount, dbAntes: dbObras.length, inserts: inserts.length };
      console.log(`[Obras] WP=${wpObrasCount} | DB antes=${dbObras.length} | inserts=${inserts.length}`);
    }

    // =========================================================================
    // MÓDULO 4: DÍVIDA ATIVA (#tablepress-39 -> prisma.configuracao)
    // =========================================================================
    {
      const $ = cheerio.load(dividaHtml);
      const linhas = [];
      $('#tablepress-39 tbody tr').each((_, tr) => {
        const tds = $(tr).find('td');
        if (tds.length < 6) return;
        const natureza = $(tds[0]).text().replace(/\s+/g, ' ').trim();
        const saldoInicial = $(tds[1]).text().replace(/\s+/g, ' ').trim();
        const inscricoes = $(tds[2]).text().replace(/\s+/g, ' ').trim();
        const baixa = $(tds[3]).text().replace(/\s+/g, ' ').trim();
        const saldoFinal = $(tds[4]).text().replace(/\s+/g, ' ').trim();
        const documento = $(tds[5]).text().replace(/\s+/g, ' ').trim();
        if (!natureza) return;
        linhas.push({ natureza, saldoInicial, inscricoes, baixa, saldoFinal, documento });
      });

      const payload = JSON.stringify({
        fonte: 'https://saotome.rn.gov.br/divida-ativa/',
        atualizadoEm: '2024-05-16',
        linhas,
      });
      const existing = await prisma.configuracao.findUnique({ where: { chave: 'divida_ativa_tabela_wp' } });
      const changed = existing?.valor !== payload;

      if (APPLY && changed && linhas.length > 0) {
        await prisma.configuracao.upsert({
          where: { chave: 'divida_ativa_tabela_wp' },
          update: { valor: payload, grupo: 'transparencia', descricao: 'Demonstrativo de Dívida Ativa importado de saotome.rn.gov.br/divida-ativa/' },
          create: { chave: 'divida_ativa_tabela_wp', valor: payload, grupo: 'transparencia', descricao: 'Demonstrativo de Dívida Ativa importado de saotome.rn.gov.br/divida-ativa/' },
        });
      }
      report.modules.dividaAtiva = { linhas: linhas.length, action: changed ? (existing ? 'update' : 'insert') : 'noop' };
      console.log(`[Dívida Ativa] Linhas=${linhas.length} | action=${report.modules.dividaAtiva.action}`);
    }

    // =========================================================================
    // MÓDULO 5: CONVÊNIOS / TERMOS (#tablepress-23 -> prisma.convenio)
    // =========================================================================
    {
      const $ = cheerio.load(convenioHtml);
      const dbConvenios = await prisma.convenio.findMany();
      const firstRow = $('#tablepress-23 tbody tr').first();
      const tds = firstRow.find('td');
      const rawObj = $(tds[0]).text().replace(/\s+/g, ' ').trim();
      const rawNum = $(tds[1]).text().replace(/\s+/g, ' ').trim();
      const pdfHref = firstRow.find('a[href]').attr('href')?.trim() ||
        'https://saotome.rn.gov.br/wp-content/uploads/2023/07/TERMO-DE-COOPERACAO-TECNICA-PMST-E-TJRN_compressed.pdf';

      const existing = dbConvenios.find((c) => /036/.test(c.numero) && /2022/.test(c.numero));
      const convenioData = {
        numero: '036/2022',
        ano: 2022,
        tipoConvenio: 'acordo_sem_transferencia',
        objeto: rawObj || 'Termo de Cooperação Técnica nº 036-2022 entre a Prefeitura Municipal de São Tomé-RN e o Tribunal de Justiça do RN (TJRN) visando agilizar e melhorar a qualidade da prestação jurisdicional.',
        concedente: 'Tribunal de Justiça do RN (TJRN) / Prefeitura de São Tomé-RN',
        beneficiario: 'Prefeitura Municipal de São Tomé-RN',
        valor: 0,
        contrapartida: 0,
        valorLiberado: 0,
        dataInicio: new Date(Date.UTC(2022, 5, 22, 12, 0, 0)),
        dataFim: new Date(Date.UTC(2027, 5, 21, 12, 0, 0)),
        secretaria: 'Gabinete do Prefeito',
        status: 'vigente',
        arquivoInteiroTeor: existing?.arquivoInteiroTeor && existing.arquivoInteiroTeor.includes('blob.vercel-storage.com') ? existing.arquivoInteiroTeor : pdfHref,
        fonteOrigem: 'Portal Oficial saotome.rn.gov.br (/convenio/)',
        situacaoPublicacao: 'publicado',
        criterioPntp: '5.3',
      };

      const needsAction = !existing || existing.tipoConvenio !== 'acordo_sem_transferencia' || !existing.arquivoInteiroTeor;
      if (APPLY && needsAction) {
        if (existing) {
          await prisma.convenio.update({ where: { id: existing.id }, data: convenioData });
        } else {
          await prisma.convenio.create({ data: convenioData });
        }
      }
      report.modules.convenios = { wpTitle: rawNum, dbAntes: dbConvenios.length, action: needsAction ? (existing ? 'update' : 'insert') : 'noop' };
      console.log(`[Convênio/Termo] ${rawNum} | action=${report.modules.convenios.action}`);
    }

    // =========================================================================
    // MÓDULO 6: FAQ (25 itens em /perguntas-e-respostas/ -> prisma.fAQ)
    // =========================================================================
    {
      const $ = cheerio.load(faqHtml);
      const wpFaqs = [];
      $('.elementor-accordion-item, .elementor-toggle-item, .ekit-accordion-card, .e-n-accordion-item').each((i, el) => {
        const pergunta = $(el).find('.elementor-accordion-title, .elementor-toggle-title, .ekit-accordion-title, summary').first().text().replace(/\s+/g, ' ').trim();
        const resposta = $(el).find('.elementor-tab-content, .ekit-accordion-content, .e-n-accordion-item-content').first().text().replace(/\s+/g, ' ').trim();
        if (pergunta && resposta) {
          wpFaqs.push({ pergunta, resposta, categoria: 'Lei de Acesso à Informação (LAI)', ordem: i + 1 });
        }
      });

      const dbFaqs = await prisma.fAQ.findMany();
      const seenFaq = new Set(dbFaqs.map((f) => normalizeText(f.pergunta)));
      const inserts = wpFaqs.filter((f) => !seenFaq.has(normalizeText(f.pergunta)));

      if (APPLY && inserts.length > 0) {
        await prisma.fAQ.createMany({ data: inserts });
      }
      report.modules.faq = { wpTotal: wpFaqs.length, dbAntes: dbFaqs.length, inserts: inserts.length };
      console.log(`[FAQ] WP=${wpFaqs.length} | DB antes=${dbFaqs.length} | inserts=${inserts.length}`);
    }

    // =========================================================================
    // MÓDULO 7: CARTA DE SERVIÇOS (#tablepress-21 -> prisma.servicoCarta)
    // =========================================================================
    {
      const TINUS_URL = 'https://www.tinus.com.br/csp/SAOTOME/portal/index.csp?398ePKh0101MOVZE78365xmEw9088og=xbCN41Noq203lgm19139rlZlh569ZevDU2955S1071625bJbX145';
      const CONTRACHEQUE_URL = 'https://app.topsolutionsrn.com.br/ContraCheque/pmsaotome/';
      const dbServs = await prisma.servicoCarta.findMany();

      const brokenFixMap = [
        { match: /ouvidoria/i, link: '/servicos/ouvidoria', local: 'Ouvidoria Municipal / Online (saotomern.vercel.app)' },
        { match: /e-sic/i, link: '/servicos/esic', local: 'e-SIC / Controladoria Geral / Online' },
        { match: /iptu/i, link: TINUS_URL },
        { match: /portal da transpar/i, link: '/transparencia', local: 'Online (/transparencia)' },
        { match: /portal do servidor/i, link: CONTRACHEQUE_URL },
        { match: /portal do contribuinte/i, link: TINUS_URL },
        { match: /consultas de leis/i, link: '/transparencia/legislacao' },
        { match: /protocolo geral/i, link: '/contato' },
      ];

      let fixedExisting = 0;
      for (const s of dbServs) {
        const rule = brokenFixMap.find((r) => r.match.test(s.nome));
        if (!rule) continue;
        const isBroken = !s.linkAcesso || /ouvidoria\.saotome|transparencia\.saotome|saotome\.rn\.gov\.br\/portal-/i.test(s.linkAcesso);
        if (isBroken) {
          fixedExisting++;
          if (APPLY) {
            await prisma.servicoCarta.update({
              where: { id: s.id },
              data: { linkAcesso: rule.link, ...(rule.local ? { local: rule.local } : {}) },
            });
          }
        }
      }

      const routeMapWP = [
        { match: /LDO/i, categoria: 'Transparência e Orçamento', link: '/transparencia/orcamento', nome: 'Consulta à LDO' },
        { match: /LOA/i, categoria: 'Transparência e Orçamento', link: '/transparencia/orcamento', nome: 'Consulta à LOA' },
        { match: /DESPESA/i, categoria: 'Transparência e Finanças', link: '/transparencia/despesas', nome: 'Consulta às Despesas' },
        { match: /RECEITA/i, categoria: 'Transparência e Finanças', link: '/transparencia/receitas', nome: 'Consulta às Receitas' },
        { match: /DI[AÁ]RIA/i, categoria: 'Transparência e Pessoal', link: '/transparencia/diarias', nome: 'Consulta às Diárias' },
        { match: /RFG|RGF/i, categoria: 'Transparência Fiscal', link: '/transparencia/lrf', nome: 'Consulta ao RGF' },
        { match: /PREFEITO/i, categoria: 'Institucional', link: '/transparencia/gestores', nome: 'Informações do Prefeito e Vice-Prefeito' },
        { match: /NOT[IÍ]CIA/i, categoria: 'Comunicação Institucional', link: '/noticias', nome: 'Notícias Oficiais' },
        { match: /CONTRIBUINTE/i, skipIfExists: /PORTAL DO CONTRIBUINTE/i },
        { match: /SERVIDOR/i, skipIfExists: /PORTAL DO SERVIDOR/i },
      ];

      const $c = cheerio.load(cartaHtml);
      const seenNames = new Set(dbServs.map((s) => normalizeText(s.nome)));
      const inserts = [];
      let wpCartaCount = 0;

      $c('#tablepress-21 tbody tr').each((idx, tr) => {
        const tds = $c(tr).find('td');
        if (tds.length < 7) return;
        const servRaw = $c(tds[0]).text().replace(/\s+/g, ' ').trim();
        const etapas = $c(tds[1]).text().replace(/\s+/g, ' ').trim();
        const requisitos = $c(tds[2]).text().replace(/\s+/g, ' ').trim();
        const prazo = $c(tds[3]).text().replace(/\s+/g, ' ').trim();
        const horario = $c(tds[4]).text().replace(/\s+/g, ' ').trim();
        const formasAcesso = $c(tds[6]).text().replace(/\s+/g, ' ').trim();
        if (!servRaw) return;
        wpCartaCount++;

        const cfg = routeMapWP.find((r) => r.match.test(servRaw));
        if (cfg?.skipIfExists && dbServs.some((s) => cfg.skipIfExists.test(s.nome))) return;

        const finalName = cfg?.nome || servRaw;
        if (seenNames.has(normalizeText(finalName))) return;
        seenNames.add(normalizeText(finalName));

        inserts.push({
          nome: finalName,
          categoria: cfg?.categoria || 'Transparência e Cidadão',
          descricao: `${finalName} — Serviço público digital oferecido pela Prefeitura Municipal de São Tomé/RN (custo gratuito).`,
          local: `Online (${horario || 'acesso permanente'})`,
          prazo: prazo || 'Imediato',
          documentos: 'Nenhum documento exigido para consulta pública.',
          etapas,
          formasAcesso: `Portal Oficial (${formasAcesso || 'internet'})`,
          previsaoEspera: prazo || 'Imediato',
          prioridades: 'Acesso Universal',
          requisitos: requisitos || 'Consulta liberada',
          statusServico: 'ATIVO',
          linkAcesso: cfg?.link || '/transparencia',
          ativo: true,
          ordem: idx + 1,
        });
      });

      if (APPLY && inserts.length > 0) {
        await prisma.servicoCarta.createMany({ data: inserts });
      }
      report.modules.cartaServicos = { wpTotal: wpCartaCount, dbAntes: dbServs.length, fixedExisting, inserts: inserts.length };
      console.log(`[Carta de Serviços] WP=${wpCartaCount} | DB antes=${dbServs.length} | corrigidos=${fixedExisting} | inserts=${inserts.length}`);
    }

    // =========================================================================
    // MÓDULO 8: DECLARAÇÕES OFICIAIS (Câmara e TCE -> prisma.declaracaoTransparencia)
    // =========================================================================
    {
      const $cam = cheerio.load(camaraHtml);
      const $tce = cheerio.load(tceHtml);
      const camTextRaw = $cam('[data-elementor-type="wp-page"], main, .entry-content').first().text().replace(/\s+/g, ' ').trim();
      const tceTextRaw = $tce('[data-elementor-type="wp-page"], main, .entry-content').first().text().replace(/\s+/g, ' ').trim();

      const declsSpec = [
        {
          modulo: 'julgamento_contas',
          criterioPntp: '11.4',
          fundamentoLegal: 'Art. 31, § 2º da Constituição Federal, Art. 48 da LRF e Critério 11.4 do PNTP 2026.',
          texto: camTextRaw.includes('A Prefeitura Municipal')
            ? camTextRaw.slice(camTextRaw.indexOf('A Prefeitura Municipal')).replace(/Última atualização:.*$/i, '').trim()
            : 'A Prefeitura Municipal de São Tomé/RN declara que, até a presente data, não foram localizados pareceres prévios ou apreciações concluídas pelo Poder Legislativo Municipal, referentes às contas anuais dos exercícios de 2023, 2024 e 2025. Os respectivos documentos serão publicados nesta página assim que forem oficialmente emitidos ou disponibilizados, em atendimento aos critérios do Programa Nacional de Transparência Pública – PNTP 2026.',
        },
        {
          modulo: 'parecer_tce',
          criterioPntp: '11.3',
          fundamentoLegal: 'Art. 31, §§ 1º e 2º da Constituição Federal, Lei Complementar nº 101/2000 e Critério 11.3 do PNTP 2026.',
          texto: tceTextRaw.includes('A Prefeitura Municipal')
            ? tceTextRaw.slice(tceTextRaw.indexOf('A Prefeitura Municipal')).replace(/Última atualização:.*$/i, '').trim()
            : 'A Prefeitura Municipal de São Tomé/RN declara que, até a presente data, não foram localizados pareceres prévios ou apreciações concluídas pelo Tribunal de Contas do Estado do Rio Grande do Norte – TCE/RN referentes às contas anuais dos exercícios de 2023, 2024 e 2025. Os respectivos documentos serão publicados nesta página assim que forem oficialmente emitidos ou disponibilizados, em atendimento aos critérios do Programa Nacional de Transparência Pública – PNTP 2026.',
        },
      ];

      const existingDecls = await prisma.declaracaoTransparencia.findMany();
      let inserts = 0;
      let updates = 0;

      for (const spec of declsSpec) {
        const found = existingDecls.find((d) => d.modulo === spec.modulo && d.criterioPntp === spec.criterioPntp);
        const data = {
          modulo: spec.modulo,
          criterioPntp: spec.criterioPntp,
          orgaoResponsavel: 'Controladoria Geral do Município',
          exercicio: 2025,
          competencia: 'Exercícios 2023, 2024 e 2025',
          tipoSituacao: 'nao_ocorrencia_declarada',
          textoDeclaracao: spec.texto,
          fundamentoLegal: spec.fundamentoLegal,
          responsavelNome: 'Lindomar Pereira da Silva',
          responsavelCargo: 'Controlador Geral do Município',
          dataEmissao: new Date(Date.UTC(2026, 7, 11, 12, 0, 0)),
          dataConferencia: new Date(Date.UTC(2026, 7, 11, 12, 0, 0)),
          situacaoPublicacao: 'publicado',
          ativa: true,
        };
        if (!found) {
          inserts++;
          if (APPLY) await prisma.declaracaoTransparencia.create({ data });
        } else if (found.textoDeclaracao !== data.textoDeclaracao) {
          updates++;
          if (APPLY) await prisma.declaracaoTransparencia.update({ where: { id: found.id }, data });
        }
      }
      report.modules.declaracoes = { dbAntes: existingDecls.length, updates, inserts };
      console.log(`[Declarações Câmara/TCE] DB antes=${existingDecls.length} | updates=${updates} | inserts=${inserts}`);
    }

    // =========================================================================
    // MÓDULO 9: ATOS /INICIO/, DECRETO 182 CPT, REPARO RGF/RREO/PCG, DOCUMENTOS E EDITAIS
    // =========================================================================
    {
      // 9.1 Legislação extra de /inicio/ + CPT decretos + Decreto 146/2023
      const dbLegs = await prisma.legislacao.findMany();
      const legDriveIds = new Set();
      const legByKey = new Map();
      const legByFile = new Set();
      for (const l of dbLegs) {
        const did = extractDriveId(l.documentUrl) || extractDriveId(l.arquivo);
        if (isUniqueDriveId(did)) legDriveIds.add(did);
        if (l.arquivo) legByFile.add(fileBasename(l.arquivo));
        const p = parseNumeroAnoAto(l.numero, l.ementa);
        const k = `${l.tipo.toLowerCase()}|${p.numeroSemZero}|${p.ano || l.ano}`;
        if (!legByKey.has(k)) legByKey.set(k, l);
      }

      const $ini = cheerio.load(inicioHtml);
      const wpInicioActs = [];
      const extractInicioTable = (tableId, tipo) => {
        $ini(`${tableId} tbody tr`).each((_, tr) => {
          const tds = $ini(tr).find('td');
          if (tds.length < 3) return;
          const rawNum = $ini(tds[0]).text().replace(/\s+/g, ' ').trim();
          const ementa = $ini(tds[1]).text().replace(/\s+/g, ' ').trim();
          const href = $ini(tr).find('a[href]').attr('href')?.trim() || '';
          if (!rawNum || !href || /^decreto$/i.test(rawNum)) return;
          if (!isValidHttpUrl(href)) return;

          // Corrige typos conhecidos na tabela /inicio/ usando o nome do arquivo PDF quando aplicável
          let fixedNum = rawNum;
          let finalTipo = tipo;
          const fname = fileBasename(href);
          if (/lei-n.*-1330-2023/i.test(fname)) fixedNum = '1330/2023';
          if (/lei-no-1329-2023/i.test(fname)) fixedNum = '1329/2023';
          if (/decreto-municipal-no-165-2024/i.test(fname)) fixedNum = '165/2024';
          if (/decreto-50-2024/i.test(fname)) finalTipo = 'portaria'; // Tabela de portarias, arquivo nomeado Decreto-50-2024

          const parsed = parseNumeroAnoAto(fixedNum, `${ementa} ${fname}`);
          if (!parsed.ano) return;
          wpInicioActs.push({ tipo: finalTipo, ...parsed, ementa: ementa || `${finalTipo} nº ${parsed.numero}`, href, fname });
        });
      };

      extractInicioTable('#tablepress-7', 'lei');
      extractInicioTable('#tablepress-5', 'decreto');
      extractInicioTable('#tablepress-6', 'portaria');

      wpInicioActs.push({
        tipo: 'decreto',
        numero: '146/2023',
        numeroSemZero: '146',
        ano: 2023,
        ementa: 'Decreto Municipal nº 146/2023 — Regulamentação / Concurso Público Municipal de São Tomé/RN.',
        href: 'https://saotome.rn.gov.br/wp-content/uploads/2023/05/decreto-146-2023_Concurso-Publico.pdf',
        fname: 'decreto-146-2023_concurso-publico.pdf',
      });

      for (const cpt of Array.isArray(cptDecretos) ? cptDecretos : []) {
        const href = cpt?.acf?.arquivo?.trim();
        const did = extractDriveId(href);
        if (!href) continue;
        const rawNum = cpt?.acf?.numero || cpt?.title?.rendered || '';
        const parsed = parseNumeroAnoAto(rawNum, cpt?.acf?.descricao || cpt?.date);
        wpInicioActs.push({
          tipo: 'decreto',
          numero: parsed.numero,
          numeroSemZero: parsed.numeroSemZero,
          ano: parsed.ano || 2026,
          ementa: cpt?.acf?.descricao || decode(cpt?.title?.rendered || ''),
          href,
          driveId: did,
          fname: fileBasename(href),
        });
      }

      let legUpdates = 0;
      let legInserts = 0;
      for (const act of wpInicioActs) {
        const did = act.driveId || extractDriveId(act.href);
        if (isUniqueDriveId(did) && legDriveIds.has(did)) continue;
        if (act.fname && legByFile.has(act.fname)) continue;

        const key = `${act.tipo}|${act.numeroSemZero}|${act.ano}`;
        const existing = legByKey.get(key);
        if (existing) {
          const exDid = extractDriveId(existing.arquivo);
          const needsUpgrade = !existing.arquivo || exDid === GENERIC_SHARED_DRIVE_ID;
          if (needsUpgrade && act.href) {
            legUpdates++;
            if (APPLY) {
              await prisma.legislacao.update({
                where: { id: existing.id },
                data: { arquivo: act.href, documentUrl: act.href },
              });
            }
            if (act.fname) legByFile.add(act.fname);
          }
        } else {
          legInserts++;
          const isLC = /COMPLEMENTAR/i.test(act.ementa) || /LEI-COMPLEMENTAR/i.test(act.fname || '');
          const data = {
            tipo: act.tipo,
            categoria: act.tipo === 'lei' ? (isLC ? 'Lei Complementar' : 'Lei Ordinária') : act.tipo === 'decreto' ? 'Decreto' : 'Portaria',
            numero: act.numero,
            ano: act.ano,
            ementa: act.ementa,
            arquivo: act.href,
            documentUrl: act.href,
            situacaoVigencia: 'vigente',
            orgaoResponsavel: 'Gabinete do Prefeito',
            situacaoPublicacao: 'publicado',
            ativo: true,
          };
          legByKey.set(key, data);
          if (act.fname) legByFile.add(act.fname);
          if (isUniqueDriveId(did)) legDriveIds.add(did);
          if (APPLY) await prisma.legislacao.create({ data });
        }
      }

      // 9.2 Reparo dos 2 Relatórios Fiscais quebrados + PCG 2025
      let rfUpdates = 0;
      const rgf2023Broken = await prisma.relatorioFiscal.findFirst({ where: { tipo: 'RGF', ano: 2023, periodo: { contains: '2' } } });
      if (rgf2023Broken && !isValidHttpUrl(rgf2023Broken.arquivo)) {
        rfUpdates++;
        if (APPLY) {
          await prisma.relatorioFiscal.update({
            where: { id: rgf2023Broken.id },
            data: {
              periodicidade: 'Quadrimestral',
              arquivo: 'https://saotome.rn.gov.br/wp-content/uploads/2023/10/RGF-2023-2o-QUADRIMESTRE-Gabinete-do-Prefeito_compressed.pdf',
            },
          });
        }
      }

      const rreo2025Broken = await prisma.relatorioFiscal.findFirst({ where: { tipo: 'RREO', ano: 2025, periodo: { contains: '6' } } });
      if (rreo2025Broken && !String(rreo2025Broken.arquivo || '').includes('blob.vercel-storage.com') && !String(rreo2025Broken.arquivo || '').includes('RREO-6o-BIMESTRE-DE-2025')) {
        rfUpdates++;
        if (APPLY) {
          await prisma.relatorioFiscal.update({
            where: { id: rreo2025Broken.id },
            data: {
              arquivo: 'https://saotome.rn.gov.br/wp-content/uploads/2026/01/RREO-6o-BIMESTRE-DE-2025_compressed.pdf',
            },
          });
        }
      }

      const pcg2025 = await prisma.relatorioFiscal.findFirst({ where: { tipo: 'PCG', ano: 2025 } });
      const pcgWpUrl = 'https://saotome.rn.gov.br/wp-content/uploads/2026/06/Contas-de-Governo-2025.pdf';
      if (pcg2025 && (!pcg2025.arquivo || !isValidHttpUrl(pcg2025.arquivo) || pcg2025.arquivo.includes('drive.google.com'))) {
        if (await checkUrlOk(pcgWpUrl)) {
          rfUpdates++;
          if (APPLY) {
            await prisma.relatorioFiscal.update({
              where: { id: pcg2025.id },
              data: { periodicidade: 'Anual', arquivo: pcgWpUrl },
            });
          }
        }
      } else if (!pcg2025 && (await checkUrlOk(pcgWpUrl))) {
        rfUpdates++;
        if (APPLY) {
          await prisma.relatorioFiscal.create({
            data: {
              titulo: 'Contas de Governo - 2025',
              tipo: 'PCG',
              periodicidade: 'Anual',
              periodo: 'Anual',
              ano: 2025,
              arquivo: pcgWpUrl,
              situacaoPublicacao: 'publicado',
            },
          });
        }
      }

      // 9.3 Documentos (PME 2021 fix + 14 documentos oficiais da mídia WP; EXCLUI ID 793 LAJES-PINTADAS)
      const dbDocs = await prisma.documento.findMany();
      let docUpdates = 0;
      let docInserts = 0;

      const pme2021 = dbDocs.find((d) => /2021/.test(d.titulo) && /PME|Educa/i.test(d.titulo));
      const pme2021Url = 'https://saotome.rn.gov.br/wp-content/uploads/2023/07/PL-PME22032021_compressed.pdf';
      if (pme2021 && !String(pme2021.arquivo || '').includes('blob.vercel-storage.com') && pme2021.arquivo !== pme2021Url) {
        docUpdates++;
        if (APPLY) {
          await prisma.documento.update({
            where: { id: pme2021.id },
            data: { arquivo: pme2021Url, documentUrl: pme2021Url },
          });
        }
      }

      const docsSpec = [
        { titulo: 'Decreto de Regulamentação das Diárias', tipo: 'regulamentacao-diarias', ano: 2024, url: `${WP_BASE}/wp-content/uploads/2024/05/Decreto-Diarias.pdf`, orgao: 'Gabinete do Prefeito' },
        { titulo: 'Tabela Oficial de Valores de Diárias', tipo: 'tabela-diarias', ano: 2024, url: `${WP_BASE}/wp-content/uploads/2024/05/Tabela-Diarias.pdf`, orgao: 'Secretaria de Finanças e Tributação' },
        { titulo: 'Tabela de Padrão Remuneratório dos Servidores', tipo: 'padrao-remuneratorio', ano: 2024, url: `${WP_BASE}/wp-content/uploads/2024/06/Padrao-Remoneratorio.pdf`, orgao: 'Secretaria de Administração e Planejamento' },
        { titulo: 'Lei Complementar nº 16/2022 - Estrutura Organizacional', tipo: 'estrutura-organizacional', ano: 2022, url: `${WP_BASE}/wp-content/uploads/2024/05/LEI-COMPLEMENTAR-16-2022_compressed.pdf`, orgao: 'Gabinete do Prefeito' },
        { titulo: 'Aviso de Vencedores Publicado - Educação', tipo: 'educacao', ano: 2024, url: `${WP_BASE}/wp-content/uploads/2024/05/Aviso-de-Vencedores-Publicado.pdf`, orgao: 'Secretaria de Educação, Cultura e Desporto' },
        { titulo: 'Lei Estadual de Acesso à Informação (LAI RN)', tipo: 'lai', ano: 2024, url: `${WP_BASE}/wp-content/uploads/2024/05/LAI-ESTADUAL-RN.pdf`, orgao: 'Controladoria Geral do Município' },
        { titulo: 'Lei Federal nº 12.527/2011 - Lei de Acesso à Informação (LAI)', tipo: 'lai', ano: 2011, url: `${WP_BASE}/wp-content/uploads/2024/05/LEI-DE-ACESSO-A-INFORMACAO_12527_2011_0000001.pdf`, orgao: 'Controladoria Geral do Município' },
        { titulo: 'Lei Federal nº 14.129/2021 - Governo Digital', tipo: 'lai', ano: 2021, url: `${WP_BASE}/wp-content/uploads/2024/05/LEI-FEDERAL_14.129_2021_0000001.pdf`, orgao: 'Controladoria Geral do Município' },
        { titulo: 'Regimento Completo CMC - Conferência Municipal da Cidade', tipo: 'conselho', ano: 2025, url: `${WP_BASE}/wp-content/uploads/2025/06/REGIMENTO-CMC-COMPLETO.pdf`, orgao: 'Secretaria de Obras, Transporte e Serviços Urbanos' },
        { titulo: 'Lei Complementar nº 195/2022 - Lei Paulo Gustavo', tipo: 'cultura', ano: 2023, url: `${WP_BASE}/wp-content/uploads/2026/08/01_Lcp-195-Lei-Paulo-Gustavo.pdf`, orgao: 'Secretaria de Educação, Cultura e Desporto' },
        { titulo: 'Decreto Federal nº 11.453/2023 - Mecanismos de Fomento à Cultura', tipo: 'cultura', ano: 2023, url: `${WP_BASE}/wp-content/uploads/2026/08/02_Decreto-11453-2023-Mecanismos-de-fomento-do-sistema-definanciamento-a-cultura_.pdf`, orgao: 'Secretaria de Educação, Cultura e Desporto' },
        { titulo: 'Decreto Federal nº 11.525/2023 - Regulamentação Lei Paulo Gustavo', tipo: 'cultura', ano: 2023, url: `${WP_BASE}/wp-content/uploads/2026/08/03_DECRETO-No-11.525-DE-11-DE-MAIO-DE-2023-REGULAMENTACAO.pdf`, orgao: 'Secretaria de Educação, Cultura e Desporto' },
        { titulo: 'Regulamento das Quadrilhas Juninas - 2026', tipo: 'cultura', ano: 2026, url: `${WP_BASE}/wp-content/uploads/2026/05/REGULAMENTO-DAS-QUADRILHAS-JUNINAS-2026.pdf`, orgao: 'Secretaria de Educação, Cultura e Desporto' },
        { titulo: 'Regulamento dos Eventos da Emancipação Política', tipo: 'cultura', ano: 2023, url: `${WP_BASE}/wp-content/uploads/2023/10/REGULAMENTO-DOS-EVENTOS-DA-EMANCIPACAO.pdf`, orgao: 'Secretaria de Educação, Cultura e Desporto' },
      ];

      const docSeenTitles = new Set(dbDocs.map((d) => normalizeText(d.titulo)));
      const docSeenFiles = new Set(dbDocs.map((d) => fileBasename(d.arquivo || d.documentUrl)));

      for (const spec of docsSpec) {
        if (/LAJES[-_ ]?PINTADAS/i.test(spec.url)) continue;
        const fname = fileBasename(spec.url);
        if (docSeenTitles.has(normalizeText(spec.titulo)) || (fname && docSeenFiles.has(fname))) continue;
        docSeenTitles.add(normalizeText(spec.titulo));
        docSeenFiles.add(fname);
        docInserts++;
        if (APPLY) {
          await prisma.documento.create({
            data: {
              titulo: spec.titulo,
              tipo: spec.tipo,
              ano: spec.ano,
              orgaoResponsavel: spec.orgao,
              arquivo: spec.url,
              documentUrl: spec.url,
              situacaoPublicacao: 'publicado',
              ativo: true,
            },
          });
        }
      }

      // 9.4 Editais e Concursos Extras da Mídia WP + Pasta Drive /cultura-copy/
      const dbConcs = await prisma.concurso.findMany();
      const concSlugs = new Set(dbConcs.map((c) => c.slug));
      const concFiles = new Set(dbConcs.map((c) => fileBasename(c.linkEdital)));
      const concUrls = new Set(dbConcs.map((c) => String(c.linkEdital || '').trim()));

      const extraConcsSpec = [
        { titulo: 'Edital Festival de Quadrilhas Tradicionais (2024)', tipo: 'edital', ano: 2024, data: '2024-06-28', url: `${WP_BASE}/wp-content/uploads/2024/06/EDITAL-FESTIVAL-DE-QUADRILHAS-TRADICIONAIS-.pdf` },
        { titulo: 'Edital do Festival de Quadrilha (2023)', tipo: 'edital', ano: 2023, data: '2023-05-19', url: `${WP_BASE}/wp-content/uploads/2023/05/Edital-do-Festival-de-Quadrilha.pdf` },
        { titulo: 'Edital Retificado Chamamento Público nº 04/2024 - Fomento à Cultura', tipo: 'edital', ano: 2024, data: '2024-05-07', url: `${WP_BASE}/wp-content/uploads/2024/05/EDITAL-RETIFICADO-CHAMAMENTO-PUBLICO-04-2024-FOMENTO-A-CULTURA_compressed.pdf` },
        { titulo: 'Edital Chamamento Público nº 04/2024 - Fomento à Cultura', tipo: 'edital', ano: 2024, data: '2024-05-05', url: `${WP_BASE}/wp-content/uploads/2024/05/EDITAL-CHAMAMENTO-PUBLICO-04-2024-FOMENTO-A-CULTURA.pdf` },
        { titulo: 'Edital nº 01/2023 - Eleições Conselho Tutelar', tipo: 'edital', ano: 2023, data: '2023-04-24', url: `${WP_BASE}/wp-content/uploads/2023/04/EDITAL-No-01_Eleicoes-Conselho-tutelar.pdf` },
        { titulo: 'Edital Comissão Eleitoral - Conselho Tutelar', tipo: 'edital', ano: 2023, data: '2023-05-12', url: `${WP_BASE}/wp-content/uploads/2023/05/Edital-Comissao-Eleitoral-Conselho-Tutelar.pdf` },
        { titulo: 'Novo Edital Comissão Eleitoral - Conselho Tutelar', tipo: 'edital', ano: 2023, data: '2023-05-12', url: `${WP_BASE}/wp-content/uploads/2023/05/Novo-Edital-Comissao-Eleitoral-Conselho-Tutelar_compressed.pdf` },
        { titulo: 'Resultado Final do Concurso Público Municipal (05/04/2023)', tipo: 'concurso', ano: 2023, data: '2023-04-24', url: `${WP_BASE}/wp-content/uploads/2023/04/RESULTADO-FINAL-DO-CONCURSO-05.04.23_compressed.pdf` },
        { titulo: 'Resultado Provas Objetivas - Concurso Público São Tomé/RN', tipo: 'concurso', ano: 2023, data: '2023-03-20', url: `${WP_BASE}/wp-content/uploads/2023/03/bomjesus-saotome-resultado-objetivas_compressed.pdf` },
        { titulo: 'Documentação Completa Cultura (Acervo Google Drive)', tipo: 'edital', ano: 2026, data: '2026-08-19', url: 'https://drive.google.com/drive/folders/1yGaTIq2e9K6MQW8wNTOus_Xthv1WuS_W?usp=drive_link' },
      ];

      let concInserts = 0;
      for (const c of extraConcsSpec) {
        const fname = fileBasename(c.url);
        const slug = slugify(c.titulo);
        if (concSlugs.has(slug) || concUrls.has(c.url) || (fname && !c.url.includes('folders/') && concFiles.has(fname))) {
          continue;
        }
        concSlugs.add(slug);
        concUrls.add(c.url);
        if (fname) concFiles.add(fname);
        concInserts++;
        if (APPLY) {
          await prisma.concurso.create({
            data: {
              titulo: c.titulo,
              slug,
              tipo: c.tipo,
              status: c.ano >= 2026 ? 'aberto' : 'encerrado',
              dataPublicacao: new Date(`${c.data}T12:00:00.000Z`),
              linkEdital: c.url,
              descricao: `${c.titulo} — Publicação oficial da Prefeitura Municipal de São Tomé/RN.`,
              ativo: true,
            },
          });
        }
      }

      report.modules.atosDocs = { legUpdates, legInserts, rfUpdates, docUpdates, docInserts, concInserts };
      console.log(`[Atos/Docs/LRF] legUpd=${legUpdates} legIns=${legInserts} | rfUpd=${rfUpdates} | docUpd=${docUpdates} docIns=${docInserts} | concIns=${concInserts}`);
    }

    // =========================================================================
    // MÓDULO 10: LINKS EXTERNOS (prisma.linkExterno)
    // =========================================================================
    {
      const dbLinks = await prisma.linkExterno.findMany();
      let linksUpd = 0;
      let linksIns = 0;

      // Corrige o registro de Emenda Parlamentar existente que está com moduloAlvo: null
      const emendaNull = dbLinks.find((l) => l.moduloAlvo === null && /emenda/i.test(l.titulo) && l.url.includes('e-publica'));
      if (emendaNull) {
        linksUpd++;
        if (APPLY) {
          await prisma.linkExterno.update({
            where: { id: emendaNull.id },
            data: { moduloAlvo: 'emendas' },
          });
          emendaNull.moduloAlvo = 'emendas';
        }
      }

      const desiredLinks = [
        // Portais por Período
        { titulo: 'Portal da Transparência 2018–2022', url: 'https://www.governotransparente.com.br/68629488?clean=false', categoria: 'transparencia', moduloAlvo: 'portal-2018-2022', descricao: 'Acesso ao histórico do Portal da Transparência (2018 a 2022)' },
        { titulo: 'Portal Legado 2023–2025 (WordPress)', url: 'https://saotome.rn.gov.br/portal-da-transparencia-copy/', categoria: 'transparencia', moduloAlvo: 'portal-2023-2025', descricao: 'Portal legado TopSolutions / saotome.rn.gov.br (2023 a 2025)' },
        // Módulos 2023–2025 (TopSolutions)
        { titulo: 'Despesas 2023–2025', url: 'https://pmsaotomern.transparencia.topsolutionsrn.com.br/despesa', categoria: 'transparencia', moduloAlvo: 'despesas-2023-2025' },
        { titulo: 'Ordem Cronológica 2023–2025', url: 'https://pmsaotomern.transparencia.topsolutionsrn.com.br/ordem-cronologica', categoria: 'transparencia', moduloAlvo: 'ordem-cronologica-2023-2025' },
        { titulo: 'Emendas Parlamentares 2023–2025', url: 'https://pmsaotomern.transparencia.topsolutionsrn.com.br/emenda-parlamentar?tipoEmenda=&formaRepasse=&origemRecurso=&autor=', categoria: 'transparencia', moduloAlvo: 'emendas-2023-2025' },
        { titulo: 'Renúncias Fiscais 2023–2025', url: 'https://pmsaotomern.transparencia.topsolutionsrn.com.br/renuncias-fiscais', categoria: 'transparencia', moduloAlvo: 'renuncias-fiscais-2023-2025' },
        { titulo: 'Licitações 2023–2025', url: 'https://pmsaotomern.transparencia.topsolutionsrn.com.br/licitacao?modalidades=&certames=&situacoes=', categoria: 'transparencia', moduloAlvo: 'licitacoes-2023-2025' },
        { titulo: 'Contratos 2023–2025', url: 'https://pmsaotomern.transparencia.topsolutionsrn.com.br/contratos', categoria: 'transparencia', moduloAlvo: 'contratos-2023-2025' },
        { titulo: 'Atas de Registro de Preço 2023–2025', url: 'https://pmsaotomern.transparencia.topsolutionsrn.com.br/ata-de-registro-de-preco', categoria: 'transparencia', moduloAlvo: 'atas-registro-2023-2025' },
        { titulo: 'Plano de Contratação Anual 2023–2025', url: 'https://pmsaotomern.transparencia.topsolutionsrn.com.br/arquivos/plano-de-contratacao-anual', categoria: 'transparencia', moduloAlvo: 'plano-contratacao-2023-2025' },
        { titulo: 'Transferências Recebidas 2023–2025', url: 'https://pmsaotomern.transparencia.topsolutionsrn.com.br/transferencias-recebidas', categoria: 'transparencia', moduloAlvo: 'transferencias-2023-2025' },
        { titulo: 'Convênios 2023–2025', url: 'https://pmsaotomern.transparencia.topsolutionsrn.com.br/acordos', categoria: 'transparencia', moduloAlvo: 'convenios-2023-2025' },
        { titulo: 'Acordos Firmados 2023–2025', url: 'https://pmsaotomern.transparencia.topsolutionsrn.com.br/acordos', categoria: 'transparencia', moduloAlvo: 'acordos-firmados-2023-2025' },
        { titulo: 'Servidores Públicos 2023–2025', url: 'https://pmsaotomern.transparencia.topsolutionsrn.com.br/servidores', categoria: 'transparencia', moduloAlvo: 'servidores-2023-2025' },
        { titulo: 'Terceirizados 2023–2025', url: 'https://pmsaotomern.transparencia.topsolutionsrn.com.br/terceirizados', categoria: 'transparencia', moduloAlvo: 'terceirizados-2023-2025' },
        { titulo: 'Estagiários 2023–2025', url: 'https://pmsaotomern.transparencia.topsolutionsrn.com.br/estagiarios', categoria: 'transparencia', moduloAlvo: 'estagiarios-2023-2025' },
        { titulo: 'Contracheque 2023–2025', url: 'https://app.topsolutionsrn.com.br/ContraCheque/pmsaotome/', categoria: 'servicos', moduloAlvo: 'contracheque-2023-2025' },
        // Portal 2026–2028 (e-Publica / TopSolutions / Atricon)
        { titulo: 'Renúncias Fiscais', url: 'https://transparencia.e-publica.net/epublica-portal/#/sao_tome/portal/receita/renunciaTable?entidade=2162', categoria: 'transparencia', moduloAlvo: 'renuncias-fiscais' },
        { titulo: 'Repasses e Transferências', url: 'https://transparencia.e-publica.net/epublica-portal/#/sao_tome/portal/receita/transferenciaRecebidaTable?entidade=2162', categoria: 'transparencia', moduloAlvo: 'transferencias' },
        { titulo: 'Convênios Recebidos', url: 'https://transparencia.e-publica.net/epublica-portal/#/sao_tome/portal/receita/convenioRecebidoTable?entidade=2162', categoria: 'transparencia', moduloAlvo: 'convenios' },
        { titulo: 'Servidores Públicos', url: 'https://pmsaotomern.transparencia.topsolutionsrn.com.br/servidores', categoria: 'transparencia', moduloAlvo: 'servidores' },
        { titulo: 'Pessoal Terceirizado', url: 'https://pmsaotomern.transparencia.topsolutionsrn.com.br/terceirizados', categoria: 'transparencia', moduloAlvo: 'terceirizados' },
        { titulo: 'Estagiários', url: 'https://pmsaotomern.transparencia.topsolutionsrn.com.br/estagiarios', categoria: 'transparencia', moduloAlvo: 'estagiarios' },
        { titulo: 'Plano de Contratação Anual', url: 'https://pmsaotomern.transparencia.topsolutionsrn.com.br/arquivos/plano-de-contratacao-anual', categoria: 'transparencia', moduloAlvo: 'plano-contratacao' },
        { titulo: 'Radar da Transparência Pública (ATRICON)', url: 'https://radardatransparencia.atricon.org.br/', categoria: 'transparencia', moduloAlvo: 'radar' },
        // Diário Oficial FEMURN limpo (sem token expirado / data fixa)
        { titulo: 'Diário Oficial', url: 'https://www.diariomunicipal.com.br/femurn/', categoria: 'geral', moduloAlvo: 'home-diario' },
      ];

      for (const spec of desiredLinks) {
        const existing = dbLinks.find((l) => (l.moduloAlvo || '').toLowerCase() === spec.moduloAlvo.toLowerCase());
        if (!existing) {
          linksIns++;
          if (APPLY) {
            await prisma.linkExterno.create({
              data: {
                titulo: spec.titulo,
                url: spec.url,
                descricao: spec.descricao || null,
                categoria: spec.categoria,
                icone: 'FaLink',
                ativo: true,
                ordem: 0,
                moduloAlvo: spec.moduloAlvo,
              },
            });
          }
        } else if (existing.url !== spec.url || !existing.ativo) {
          linksUpd++;
          if (APPLY) {
            await prisma.linkExterno.update({
              where: { id: existing.id },
              data: { url: spec.url, ativo: true, ...(spec.descricao ? { descricao: spec.descricao } : {}) },
            });
          }
        }
      }

      report.modules.linksExternos = { dbAntes: dbLinks.length, updates: linksUpd, inserts: linksIns };
      console.log(`[Links Externos] DB antes=${dbLinks.length} | updates=${linksUpd} | inserts=${linksIns}`);
    }

    // =========================================================================
    // MÓDULO 11: CONFIGURAÇÃO DE MANDATO (2025 — 2028)
    // =========================================================================
    {
      let cfgUpdates = 0;
      for (const chave of ['prefeito_mandato', 'vice_mandato']) {
        const cfg = await prisma.configuracao.findUnique({ where: { chave } });
        if (!cfg || cfg.valor !== '2025 — 2028') {
          cfgUpdates++;
          if (APPLY) {
            await prisma.configuracao.upsert({
              where: { chave },
              update: { valor: '2025 — 2028', grupo: 'gestao' },
              create: { chave, valor: '2025 — 2028', grupo: 'gestao', descricao: 'Mandato atual (2025 — 2028)' },
            });
          }
        }
      }
      report.modules.gestaoConfig = { updates: cfgUpdates };
      console.log(`[Configuração Mandato] updates=${cfgUpdates}`);
    }

    fs.mkdirSync(path.join(process.cwd(), 'scratch'), { recursive: true });
    const outPath = path.join(process.cwd(), 'scratch/relatorio-transferencia-tabelas-links.json');
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
    console.log(`\nRelatório salvo em: ${outPath}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Erro fatal em transferir-tabelas-links-wp:', e);
  process.exit(1);
});
