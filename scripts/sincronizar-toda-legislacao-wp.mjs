#!/usr/bin/env node
/**
 * Sincronizador Completo de Legislação e Transparência Normativa/Fiscal
 * Origem (WordPress): https://saotome.rn.gov.br/
 * Destino (Next.js + Prisma/Neon): https://saotomern.vercel.app/
 *
 * Módulos cobertos:
 *   1. Decretos (Legislacao, tipo: "decreto")
 *   2. Portarias (Legislacao, tipo: "portaria")
 *   3. Leis Históricas 1983–2025 (Legislacao, tipo: "lei") + Leis 2026 (checagem)
 *   4. Editais de Licitação, Chamamentos Públicos, Cultura e Concursos (Concurso)
 *   5. RGF, RREO, LDO, LOA, PPA, Balanço Patrimonial / PCG e Relatório de Gestão (RelatorioFiscal)
 *   6. Planos Municipais (Documento)
 *
 * Uso:
 *   node scripts/sincronizar-toda-legislacao-wp.mjs --dry-run
 *   node scripts/sincronizar-toda-legislacao-wp.mjs --apply --confirm
 */

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

// ---------------------------------------------------------------------------
// 1. Ambiente
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

loadEnvFile(path.join(process.cwd(), '.env.local'));
loadEnvFile(path.join(process.cwd(), '.env.production'));

const WP_BASE = 'https://saotome.rn.gov.br';
const GENERIC_SHARED_DRIVE_ID = '15yXZYj7SI7mSNIjK_5h5X6TXsuMPz9YL';

// ---------------------------------------------------------------------------
// 2. Utilitários de Normalização
// ---------------------------------------------------------------------------
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

function isValidHttpUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!/^https?:\/\/[^\s]+$/i.test(trimmed)) return false;
  if (trimmed.includes('\t') || /Relat[oó]rio/i.test(trimmed.slice(0, 40))) {
    // Reject broken table-paste URLs like "http://Relatório de Gestão Fiscal\t..."
    if (/^https?:\/\/Relat/i.test(trimmed)) return false;
  }
  try {
    const parsed = new URL(trimmed);
    return Boolean(parsed.hostname && parsed.hostname.includes('.'));
  } catch {
    return false;
  }
}

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
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function parseNumeroAnoAto(rawNumero, ementa = '') {
  const clean = String(rawNumero || '').replace(/\s+/g, ' ').trim();

  // Caso especial Google Sheets: "12,026" -> "012/2026", "132,025" -> "132/2025", "42,025" -> "042/2025"
  const commaMatch = clean.match(/^(\d+),0(2[0-9])$/);
  if (commaMatch) {
    const numPadded = commaMatch[1].padStart(3, '0');
    const yearInt = 2000 + parseInt(commaMatch[2], 10);
    return {
      numero: `${numPadded}/${yearInt}`,
      numeroSemZero: String(parseInt(commaMatch[1], 10)),
      ano: yearInt,
      normalizedChanged: true,
    };
  }

  // Caso especial "4.25" -> "004/2025"
  const dot25Match = clean.match(/^(\d+)\.(2[0-9])$/);
  if (dot25Match) {
    const numPadded = dot25Match[1].padStart(3, '0');
    const yearInt = 2000 + parseInt(dot25Match[2], 10);
    return {
      numero: `${numPadded}/${yearInt}`,
      numeroSemZero: String(parseInt(dot25Match[1], 10)),
      ano: yearInt,
      normalizedChanged: true,
    };
  }

  // Apenas o ano ("2026") -> Termos de Cessão
  if (/^(19|20)\d{2}$/.test(clean)) {
    const yearInt = parseInt(clean, 10);
    return {
      numero: `S/N/${yearInt}`,
      numeroSemZero: 'S/N',
      ano: yearInt,
      normalizedChanged: true,
    };
  }

  // Padrão com barra ("1359/2026", "1.422/2025", "PORTARIA DE NOMEAÇÃO Nº 003/2026", "028/2026")
  const slashMatch = clean.match(/([0-9.]+)\s*\/\s*(\d{4})\b/);
  if (slashMatch) {
    const numDigits = slashMatch[1].replace(/\./g, '');
    const numInt = parseInt(numDigits, 10);
    const yearInt = parseInt(slashMatch[2], 10);
    return {
      numero: `${numDigits}/${yearInt}`,
      numeroSemZero: isNaN(numInt) ? numDigits : String(numInt),
      ano: yearInt,
      normalizedChanged: clean !== `${numDigits}/${yearInt}`,
    };
  }

  // Padrão sem barra na coluna, mas ano na ementa
  const yearInEmenta = String(ementa || '').match(/\b(20\d{2}|19\d{2})\b/);
  const digitsOnly = clean.replace(/\D/g, '');
  if (yearInEmenta) {
    const yearInt = parseInt(yearInEmenta[1], 10);
    const numStr = digitsOnly || 'S/N';
    return {
      numero: digitsOnly ? `${digitsOnly}/${yearInt}` : `S/N/${yearInt}`,
      numeroSemZero: digitsOnly ? String(parseInt(digitsOnly, 10)) : 'S/N',
      ano: yearInt,
      normalizedChanged: true,
    };
  }

  return {
    numero: clean || 'S/N',
    numeroSemZero: digitsOnly ? String(parseInt(digitsOnly, 10)) : clean || 'S/N',
    ano: null,
    normalizedChanged: false,
  };
}

function parsePtBrDate(text) {
  if (!text) return null;
  const meses = {
    janeiro: 0,
    fevereiro: 1,
    marco: 2,
    abril: 3,
    maio: 4,
    junho: 5,
    julho: 6,
    agosto: 7,
    setembro: 8,
    outubro: 9,
    novembro: 10,
    dezembro: 11,
  };
  const norm = normalizeText(text).toLowerCase();
  const m = norm.match(/(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(\d{4})/);
  if (m && meses[m[2]] !== undefined) {
    return new Date(Date.UTC(parseInt(m[3], 10), meses[m[2]], parseInt(m[1], 10), 12, 0, 0));
  }
  return null;
}

async function fetchHtml(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ao acessar ${url}`);
  return await res.text();
}

// ---------------------------------------------------------------------------
// 3. Extração das Fontes do WordPress
// ---------------------------------------------------------------------------
async function fetchWordPressSources() {
  console.log('[1/3] Extraindo fontes oficiais do WordPress (https://saotome.rn.gov.br/)...');

  const [
    decretosHtml,
    portariasHtml,
    leisHtml,
    editaisHtml,
    editais2Html,
    concursosHtml,
    lrfHtml,
    relGestaoHtml,
    culturaHtml,
  ] = await Promise.all([
    fetchHtml(`${WP_BASE}/decretos/`),
    fetchHtml(`${WP_BASE}/portarias/`),
    fetchHtml(`${WP_BASE}/leis/`),
    fetchHtml(`${WP_BASE}/editais/`),
    fetchHtml(`${WP_BASE}/editais-2/`),
    fetchHtml(`${WP_BASE}/concurso-publico/`),
    fetchHtml(`${WP_BASE}/lei-de-responsabilidade-fiscal/`),
    fetchHtml(`${WP_BASE}/relatorio-de-gestao/`),
    fetchHtml(`${WP_BASE}/cultura/`),
  ]);

  // 1) Decretos (#tablepress-54 + extras WP Media/Cultura)
  const $dec = cheerio.load(decretosHtml);
  const wpDecretos = [];
  $dec('table tbody tr').each((i, tr) => {
    const tds = $dec(tr).find('td');
    if (tds.length < 3) return;
    const rawNum = $dec(tds[1]).text().trim();
    const ementa = $dec(tds[2]).text().replace(/\s+/g, ' ').trim();
    const link = $dec(tr).find('a').attr('href')?.trim() || null;
    if (!rawNum && !ementa) return;
    const parsed = parseNumeroAnoAto(rawNum, ementa);
    wpDecretos.push({
      rowIdx: i + 1,
      rawNum,
      numero: parsed.numero,
      numeroSemZero: parsed.numeroSemZero,
      ano: parsed.ano,
      ementa,
      link,
      driveId: extractDriveId(link),
    });
  });

  // Decretos extras na Biblioteca de Mídia WP / Página Cultura
  const extraDecretos = [
    {
      rowIdx: 'media-8508',
      rawNum: '341/2025',
      numero: '341/2025',
      numeroSemZero: '341',
      ano: 2025,
      ementa: 'DECRETO Nº 341/2025 - CONVOCAÇÃO DA CONFERÊNCIA MUNICIPAL DA CIDADE DE SÃO TOMÉ/RN.',
      link: 'https://saotome.rn.gov.br/wp-content/uploads/2025/05/DECRETO-No-341.25-CONVOCACAO-CMC-SAO-TOME.pdf',
      driveId: null,
    },
    {
      rowIdx: 'cultura-dec-92-2020',
      rawNum: '092/2020',
      numero: '092/2020',
      numeroSemZero: '92',
      ano: 2020,
      ementa: 'DECRETO MUNICIPAL Nº 92/2020 - REGULAMENTA A LEI ALDIR BLANC NO MUNICÍPIO DE SÃO TOMÉ/RN.',
      link: 'https://saotome.rn.gov.br/wp-content/uploads/2026/08/01_DECRETO-MUNICIPAL-No.-92-2020-LEI-ALDIR-BLANC.pdf',
      driveId: null,
    },
    {
      rowIdx: 'cultura-dec-cred-2020',
      rawNum: 'S/N/2020',
      numero: 'S/N/2020',
      numeroSemZero: 'S/N',
      ano: 2020,
      ementa: 'DECRETO PARA ABERTURA DE CRÉDITO EXTRAORDINÁRIO - LEI ALDIR BLANC.',
      link: 'https://saotome.rn.gov.br/wp-content/uploads/2026/08/02_DECRETO-PARA-ABERTURA-DE-CREDITO-EXTRAORDINARIO.pdf',
      driveId: null,
    },
  ];
  for (const ex of extraDecretos) {
    const alreadyInTable = wpDecretos.some(
      (d) =>
        (ex.numeroSemZero !== 'S/N' && d.numeroSemZero === ex.numeroSemZero && d.ano === ex.ano) ||
        d.link === ex.link
    );
    if (!alreadyInTable) wpDecretos.push(ex);
  }

  // 2) Portarias (#tablepress-57 + extras /cultura/)
  const $port = cheerio.load(portariasHtml);
  const wpPortarias = [];
  $port('table tbody tr').each((i, tr) => {
    const tds = $port(tr).find('td');
    if (tds.length < 2) return;
    const rawNum = $port(tds[0]).text().trim();
    const ementa = $port(tds[1]).text().replace(/\s+/g, ' ').trim();
    const link = $port(tr).find('a').attr('href')?.trim() || null;
    if (!rawNum && !ementa) return;
    const parsed = parseNumeroAnoAto(rawNum, ementa);
    wpPortarias.push({
      rowIdx: i + 1,
      rawNum,
      numero: parsed.numero,
      numeroSemZero: parsed.numeroSemZero,
      ano: parsed.ano,
      ementa,
      link,
      driveId: extractDriveId(link),
    });
  });

  const extraPortariasCultura = [
    {
      rowIdx: 'cultura-port-esp-2020',
      rawNum: 'S/N/2020',
      numero: 'S/N/2020',
      numeroSemZero: 'S/N',
      ano: 2020,
      ementa: 'PORTARIA EXECUTIVA DE HOMOLOGAÇÃO DOS ESPAÇOS CULTURAIS - LEI ALDIR BLANC.',
      link: 'https://saotome.rn.gov.br/wp-content/uploads/2026/08/05_PORTARIA-EXECUTIVA-HOMOLAGACAO-DOS-ESPACOS-CULTURAIS.pdf',
      driveId: null,
    },
    {
      rowIdx: 'cultura-port-045-2021-sel',
      rawNum: '045/2021',
      numero: '045/2021',
      numeroSemZero: '45',
      ano: 2021,
      ementa: 'PORTARIA EXECUTIVA Nº 045/2021 - DESIGNA COMISSÃO DE SELEÇÃO (LEI ALDIR BLANC).',
      link: 'https://saotome.rn.gov.br/wp-content/uploads/2026/08/07_PORTARIA-EXECUTIVA-No-45-2021-COMISSAO-DE-SELECAO.pdf',
      driveId: null,
    },
    {
      rowIdx: 'cultura-port-045-2021-hab',
      rawNum: '045/2021',
      numero: '045/2021',
      numeroSemZero: '45',
      ano: 2021,
      ementa: 'PORTARIA EXECUTIVA Nº 045/2021 - DESIGNA COMISSÃO DE HABILITAÇÃO (LEI ALDIR BLANC).',
      link: 'https://saotome.rn.gov.br/wp-content/uploads/2026/08/08_PORTARIA-EXECUTIVA-No-45-2021-COMISSAODE-HABILITACAO.pdf',
      driveId: null,
    },
  ];
  for (const ex of extraPortariasCultura) wpPortarias.push(ex);

  // 3) Leis históricas 1983–2025 (#tablepress-58 + PDFs dedicados da Mídia WP)
  const wpLawDedicatedPdfs = {
    '1435|2025': 'https://saotome.rn.gov.br/wp-content/uploads/2026/01/LEI-No-1435.2025-Maria-Alicia.pdf',
    '1436|2025': 'https://saotome.rn.gov.br/wp-content/uploads/2026/01/LEI-No-1436.2025-Maria-Alicia.pdf',
    '1437|2025': 'https://saotome.rn.gov.br/wp-content/uploads/2026/01/LEI-No-1437.2025-Maria-Alicia.pdf',
    '23|2025': 'https://saotome.rn.gov.br/wp-content/uploads/2025/10/LEI-COMPLEMENTAR-No-023.2025-Sec.-Mun.-de-Adm.-TERESA-CRISTINA.pdf',
    '1422|2025': 'https://saotome.rn.gov.br/wp-content/uploads/2025/10/LEI-No-1.422.25-Sec.-Mun.-de-Adm.-TERESA-CRISTINA.pdf',
    '1416|2025': 'https://saotome.rn.gov.br/wp-content/uploads/2025/10/LEI-No-1.416.25-Sec.-Mun.-de-Adm.-TERESA-CRISTINA.pdf',
    '1406|2025': 'https://saotome.rn.gov.br/wp-content/uploads/2025/11/LDO-Sao-Tome-2026.pdf',
    '1382|2024': 'https://saotome.rn.gov.br/wp-content/uploads/2024/10/LEI-No-1382.24-LDO-DOM_compressed.pdf',
    '1335|2023': 'https://saotome.rn.gov.br/wp-content/uploads/2026/08/04_LEI-No-1335-2023-DISPOE-SOBRE-A-AUTORIZACAO-PARA-ABERTURA-DE-CREDITOS-ADICIONAIS-A-LOA-DO-CORRENTE-EXERCICIO-E-DA-OUTRAS-PROVIDENCIAS_.pdf',
  };

  const $leis = cheerio.load(leisHtml);
  const wpLeisHistoricas = [];
  $leis('table tbody tr').each((i, tr) => {
    const tds = $leis(tr).find('td');
    if (tds.length < 2) return;
    const rawNum = $leis(tds[0]).text().trim();
    const ementa = $leis(tds[1]).text().replace(/\s+/g, ' ').trim();
    const link = $leis(tr).find('a').attr('href')?.trim() || null;
    const parsed = parseNumeroAnoAto(rawNum, ementa);
    if (parsed.ano === 2026) return; // As 14 de 2026 já estão 100% sincronizadas
    const dedicated = wpLawDedicatedPdfs[`${parsed.numeroSemZero}|${parsed.ano}`];
    wpLeisHistoricas.push({
      rowIdx: i + 1,
      rawNum,
      numero: parsed.numero,
      numeroSemZero: parsed.numeroSemZero,
      ano: parsed.ano,
      ementa,
      link: dedicated || link,
      wpTableLink: link,
      dedicatedWpPdf: dedicated || null,
      driveId: extractDriveId(link),
    });
  });

  // 4.1) Concursos Públicos (#tablepress-11)
  const $conc = cheerio.load(concursosHtml);
  const wpConcursos = [];
  $conc('table tbody tr').each((i, tr) => {
    const tds = $conc(tr).find('td');
    if (tds.length < 2) return;
    const numAno = $conc(tds[0]).text().trim();
    const desc = $conc(tds[1]).text().replace(/\s+/g, ' ').trim();
    const link = $conc(tr).find('a').attr('href')?.trim() || null;
    if (!numAno && !desc) return;
    wpConcursos.push({
      rowIdx: i + 1,
      numAno,
      descricao: desc,
      titulo: `${numAno} - ${desc}`,
      link,
    });
  });

  // 4.2) Editais de Licitação (#tablepress-3 em /editais/)
  const $ed = cheerio.load(editaisHtml);
  const wpEditaisLicitacao = [];
  $ed('table tbody tr').each((i, tr) => {
    const tds = $ed(tr).find('td');
    if (tds.length < 6) return;
    const numAno = $ed(tds[0]).text().trim();
    const modalidade = $ed(tds[1]).text().replace(/\s+/g, ' ').trim();
    const objeto = $ed(tds[2]).text().replace(/\s+/g, ' ').trim();
    const inicio = $ed(tds[3]).text().replace(/\s+/g, ' ').trim();
    const abertura = $ed(tds[5]).text().replace(/\s+/g, ' ').trim();
    const link = $ed(tr).find('a').attr('href')?.trim() || null;
    if (!numAno && !modalidade && !objeto) return; // ignora linhas vazias (#77, #78)
    wpEditaisLicitacao.push({
      rowIdx: i + 1,
      numAno,
      modalidade,
      titulo: `${numAno} - ${modalidade}`,
      descricao: `${objeto}${abertura ? ` | Abertura: ${abertura}` : ''}`,
      dataPublicacao: parsePtBrDate(inicio) || parsePtBrDate(abertura),
      link,
      driveId: extractDriveId(link),
    });
  });

  // 4.3) Editais Diversos / Chamamento Público (#tablepress-24 em /editais-2/)
  const $ed2 = cheerio.load(editais2Html);
  const wpEditaisChamamento = [];
  $ed2('table tbody tr').each((i, tr) => {
    const tds = $ed2(tr).find('td');
    if (tds.length < 2) return;
    const numAno = $ed2(tds[0]).text().replace(/\s+/g, ' ').trim();
    const desc = $ed2(tds[1]).text().replace(/\s+/g, ' ').trim();
    const link = $ed2(tr).find('a').attr('href')?.trim() || null;
    if (!numAno && !desc) return;
    const titulo = numAno.toUpperCase().includes('EDITAL')
      ? numAno
      : `${numAno} - ${desc.length > 110 ? desc.slice(0, 107) + '...' : desc}`;
    wpEditaisChamamento.push({
      rowIdx: i + 1,
      numAno,
      titulo,
      descricao: desc,
      link,
      driveId: extractDriveId(link),
    });
  });

  // 4.4) Editais, Avisos, Atas e Resultados da Cultura (/cultura/)
  const $cult = cheerio.load(culturaHtml);
  const wpCulturaEditais = [];
  const skipCulturaUrls = new Set([
    'https://saotome.rn.gov.br/wp-content/uploads/2026/08/01_DECRETO-MUNICIPAL-No.-92-2020-LEI-ALDIR-BLANC.pdf',
    'https://saotome.rn.gov.br/wp-content/uploads/2026/08/02_DECRETO-PARA-ABERTURA-DE-CREDITO-EXTRAORDINARIO.pdf',
    'https://saotome.rn.gov.br/wp-content/uploads/2026/08/04_LEI-No-1335-2023-DISPOE-SOBRE-A-AUTORIZACAO-PARA-ABERTURA-DE-CREDITOS-ADICIONAIS-A-LOA-DO-CORRENTE-EXERCICIO-E-DA-OUTRAS-PROVIDENCIAS_.pdf',
    'https://saotome.rn.gov.br/wp-content/uploads/2026/08/05_PORTARIA-EXECUTIVA-HOMOLAGACAO-DOS-ESPACOS-CULTURAIS.pdf',
    'https://saotome.rn.gov.br/wp-content/uploads/2026/08/07_PORTARIA-EXECUTIVA-No-45-2021-COMISSAO-DE-SELECAO.pdf',
    'https://saotome.rn.gov.br/wp-content/uploads/2026/08/08_PORTARIA-EXECUTIVA-No-45-2021-COMISSAODE-HABILITACAO.pdf',
  ]);
  $cult('.elementor a, .entry-content a, main a').each((_, a) => {
    const href = $cult(a).attr('href')?.trim() || '';
    const txt = $cult(a).text().replace(/\s+/g, ' ').trim();
    if (!href.endsWith('.pdf') || skipCulturaUrls.has(href)) return;
    // Leis/Decretos federais LPG (Lcp 195, Dec 11453, Dec 11525) também podem entrar ou ficar fora se não forem editais;
    // filtramos atos/chamamentos/atas/resultados municipais e normativos de fomento listados na página Cultura
    if (wpCulturaEditais.some((e) => e.link === href)) return;
    const isCulturaEditalOrDoc =
      /EDITAL|AVISO|CHAMAMENTO|CHAMADA|ATA|RESULTADO|COMISS[AÃ]O/i.test(txt) ||
      /EDITAL|AVISO|CHAMAMENTO|CHAMADA|ATA|RESULTADO|COMISSAO/i.test(href);
    if (!isCulturaEditalOrDoc) return;
    const cleanTitle = txt.replace(/^\d+_/, '').trim();
    const yearMatch = `${txt} ${href}`.match(/\b(202[0-6])\b/);
    const anoEd = yearMatch ? parseInt(yearMatch[1], 10) : 2023;
    wpCulturaEditais.push({
      titulo: cleanTitle,
      descricao: `${cleanTitle} (Fomento à Cultura - Prefeitura de São Tomé/RN)`,
      link: href,
      dataPublicacao: new Date(Date.UTC(anoEd, 7, 1, 12, 0, 0)),
      driveId: null,
    });
  });

  // 5) Relatórios Fiscais (6 tabelas de /lei-de-responsabilidade-fiscal/ + #tablepress-61 em /relatorio-de-gestao/)
  const $lrf = cheerio.load(lrfHtml);
  const wpRelatoriosFiscais = [];

  const tableTypeMap = {
    'tablepress-14': { tipo: 'PPA', periodicidade: 'Quadrienal' },
    'tablepress-16': { tipo: 'LOA', periodicidade: 'Anual' },
    'tablepress-15': { tipo: 'LDO', periodicidade: 'Anual' },
    'tablepress-17': { tipo: 'RGF', periodicidade: 'Quadrimestral' },
    'tablepress-18': { tipo: 'RREO', periodicidade: 'Bimestral' },
    'tablepress-22': { tipo: 'BALANCO', periodicidade: 'Anual' },
  };

  $lrf('table').each((_, tbl) => {
    const id = $lrf(tbl).attr('id');
    const cfg = tableTypeMap[id];
    if (!cfg) return;
    $lrf(tbl)
      .find('tbody tr')
      .each((i, tr) => {
        const tds = $lrf(tr).find('td');
        if (tds.length < 3) return;
        const desc = $lrf(tds[0]).text().replace(/\s+/g, ' ').trim();
        let periodo = $lrf(tds[1]).text().replace(/\s+/g, ' ').trim();
        const anoStr = $lrf(tds[2]).text().replace(/\s+/g, ' ').trim();
        const ano = parseInt(anoStr, 10);
        const link = $lrf(tr).find('a').attr('href')?.trim() || null;

        if (cfg.tipo === 'LOA' && periodo === '202') periodo = '2020';
        if (cfg.tipo === 'BALANCO') periodo = 'Anual';

        let periodicidade = cfg.periodicidade;
        if (cfg.tipo === 'RGF' && /semestre/i.test(periodo)) periodicidade = 'Semestral';

        let titulo = desc;
        if (cfg.tipo === 'RGF') titulo = `RGF - ${periodo} de ${ano}`;
        else if (cfg.tipo === 'RREO') titulo = `RREO - ${periodo} de ${ano}`;
        else if (cfg.tipo === 'BALANCO') titulo = `Balanço Patrimonial / Prestação de Contas - ${ano}`;
        else if (cfg.tipo === 'LDO') titulo = `Lei de Diretrizes Orçamentárias - LDO ${ano}`;
        else if (cfg.tipo === 'LOA') titulo = `Lei Orçamentária Anual - LOA ${ano}`;
        else if (cfg.tipo === 'PPA') titulo = `Plano Plurianual - PPA ${periodo}`;

        wpRelatoriosFiscais.push({
          sourceTable: id,
          rowIdx: i + 1,
          tipo: cfg.tipo,
          periodicidade,
          periodo,
          ano,
          titulo,
          link,
          validLink: isValidHttpUrl(link),
        });
      });
  });

  const $rg = cheerio.load(relGestaoHtml);
  $rg('table tbody tr').each((i, tr) => {
    const tds = $rg(tr).find('td');
    if (tds.length < 3) return;
    const ano = parseInt($rg(tds[2]).text().trim(), 10);
    const link = $rg(tr).find('a').attr('href')?.trim() || null;
    if (isNaN(ano)) return;
    wpRelatoriosFiscais.push({
      sourceTable: 'tablepress-61',
      rowIdx: i + 1,
      tipo: 'RELATORIO_GESTAO',
      periodicidade: 'Anual',
      periodo: 'Anual',
      ano,
      titulo: `Relatório Anual de Gestão - ${ano}`,
      link,
      validLink: isValidHttpUrl(link),
    });
  });

  return {
    wpDecretos,
    wpPortarias,
    wpLeisHistoricas,
    wpConcursos,
    wpEditaisLicitacao,
    wpEditaisChamamento,
    wpCulturaEditais,
    wpRelatoriosFiscais,
  };
}

// ---------------------------------------------------------------------------
// 4. Planejamento das Ações (Comparação Read-Only)
// ---------------------------------------------------------------------------
function normalizePeriodoRF(tipo, periodo, ano) {
  const t = String(tipo || '').toUpperCase();
  if (['BALANCO', 'BALANÇO PATRIMONIAL', 'RELATORIO_GESTAO', 'PCG', 'LOA', 'LDO', 'PPA'].includes(t)) {
    return t === 'PPA' ? String(periodo || ano).trim() : String(ano);
  }
  return normalizeText(periodo);
}

function normalizeTipoRF(tipo) {
  const t = String(tipo || '').trim();
  if (/^balan[cç]o/i.test(t)) return 'BALANCO';
  return t.toUpperCase();
}

async function buildSyncPlan(prisma, wp) {
  console.log('[2/3] Lendo registros do banco PostgreSQL e comparando com a origem WP...');
  const [dbLegislacao, dbConcursos, dbRelatorios, dbDocumentos] = await Promise.all([
    prisma.legislacao.findMany({ orderBy: [{ ano: 'desc' }, { criadoEm: 'asc' }] }),
    prisma.concurso.findMany({ orderBy: [{ criadoEm: 'asc' }] }),
    prisma.relatorioFiscal.findMany({ orderBy: [{ ano: 'desc' }] }),
    prisma.documento.findMany(),
  ]);

  const plan = {
    countsAntes: {
      legislacao: dbLegislacao.length,
      decretos: dbLegislacao.filter((l) => l.tipo.toLowerCase() === 'decreto').length,
      portarias: dbLegislacao.filter((l) => l.tipo.toLowerCase().includes('portaria')).length,
      leis: dbLegislacao.filter((l) => l.tipo.toLowerCase().includes('lei')).length,
      concursos: dbConcursos.length,
      relatoriosFiscais: dbRelatorios.length,
      documentos: dbDocumentos.length,
    },
    decretos: { updates: [], inserts: [] },
    portarias: { updates: [], inserts: [] },
    leisHistoricas: { updates: [], inserts: [] },
    concursos: { updates: [], warnings: [] },
    editais: { updates: [], inserts: [] },
    relatoriosFiscais: { updates: [], inserts: [], invalidWpLinks: [] },
    documentos: { updates: [] },
  };

  // ==================== MÓDULO 1: DECRETOS ====================
  const dbDecretos = dbLegislacao.filter((l) => l.tipo.toLowerCase() === 'decreto');
  const decSeenDrive = new Set();
  const decSeenKey = new Set();

  for (const d of dbDecretos) {
    const driveId = extractDriveId(d.documentUrl) || extractDriveId(d.arquivo);
    if (isUniqueDriveId(driveId)) decSeenDrive.add(driveId);
    const p = parseNumeroAnoAto(d.numero, d.ementa);
    const realAno = p.ano || d.ano;
    decSeenKey.add(`${p.numeroSemZero}|${realAno}|${normalizeText(d.ementa).slice(0, 60)}`);

    const updateData = {};
    if ((String(d.arquivo || '').includes('_open') || !d.arquivo) && isValidHttpUrl(d.documentUrl)) {
      updateData.arquivo = d.documentUrl;
    }
    if (d.tipo !== 'decreto') updateData.tipo = 'decreto';
    if (p.ano && d.ano !== p.ano) updateData.ano = p.ano;

    if (Object.keys(updateData).length > 0) {
      plan.decretos.updates.push({ id: d.id, numero: d.numero, data: updateData });
    }
  }

  for (const wpItem of wp.wpDecretos) {
    if (!wpItem.ano) continue;
    const key = `${wpItem.numeroSemZero}|${wpItem.ano}|${normalizeText(wpItem.ementa).slice(0, 60)}`;
    const matchedByDrive = isUniqueDriveId(wpItem.driveId) && decSeenDrive.has(wpItem.driveId);
    const matchedByUrl =
      wpItem.link &&
      dbDecretos.some((d) => d.arquivo === wpItem.link || d.documentUrl === wpItem.link);
    const matchedByKey = decSeenKey.has(key);

    if (!matchedByDrive && !matchedByUrl && !matchedByKey) {
      if (isUniqueDriveId(wpItem.driveId)) decSeenDrive.add(wpItem.driveId);
      decSeenKey.add(key);
      plan.decretos.inserts.push({
        tipo: 'decreto',
        categoria: 'Decreto',
        numero: wpItem.numero,
        ano: wpItem.ano,
        ementa: wpItem.ementa || `Decreto Municipal nº ${wpItem.numero}`,
        arquivo: wpItem.link,
        documentUrl: wpItem.link,
        situacaoVigencia: 'vigente',
        orgaoResponsavel: 'Gabinete do Prefeito',
        situacaoPublicacao: 'publicado',
        ativo: true,
      });
    }
  }

  // ==================== MÓDULO 2: PORTARIAS ====================
  const dbPortarias = dbLegislacao.filter((l) => l.tipo.toLowerCase().includes('portaria'));
  const portSeenDrive = new Set();
  const portSeenKey = new Set();

  for (const pDb of dbPortarias) {
    const driveId = extractDriveId(pDb.documentUrl) || extractDriveId(pDb.arquivo);
    if (isUniqueDriveId(driveId)) portSeenDrive.add(driveId);

    const parsed = parseNumeroAnoAto(pDb.numero, pDb.ementa);
    const targetAno = parsed.ano || pDb.ano;
    const isPortariaDiaria = pDb.tipo.toLowerCase() === 'portaria_diaria';
    const targetNumero = parsed.normalizedChanged ? parsed.numero : pDb.numero;

    portSeenKey.add(`${parsed.numeroSemZero}|${targetAno}|${normalizeText(pDb.ementa).slice(0, 80)}`);

    const updateData = {};
    if ((String(pDb.arquivo || '').includes('_open') || !pDb.arquivo) && isValidHttpUrl(pDb.documentUrl)) {
      updateData.arquivo = pDb.documentUrl;
    }
    if (parsed.normalizedChanged && parsed.numero !== pDb.numero) {
      updateData.numero = parsed.numero;
    }
    if (parsed.ano && parsed.ano !== pDb.ano) {
      updateData.ano = parsed.ano;
    }
    if (!isPortariaDiaria && pDb.tipo !== 'portaria') {
      updateData.tipo = 'portaria';
    }

    if (Object.keys(updateData).length > 0) {
      plan.portarias.updates.push({
        id: pDb.id,
        numeroAtual: pDb.numero,
        targetNumero,
        data: updateData,
      });
    }
  }

  for (const wpItem of wp.wpPortarias) {
    if (!wpItem.ano) continue;
    const key = `${wpItem.numeroSemZero}|${wpItem.ano}|${normalizeText(wpItem.ementa).slice(0, 80)}`;
    const matchedByDrive = isUniqueDriveId(wpItem.driveId) && portSeenDrive.has(wpItem.driveId);
    const matchedByUrl =
      wpItem.link &&
      dbPortarias.some((d) => d.arquivo === wpItem.link || d.documentUrl === wpItem.link);
    const matchedByKey = portSeenKey.has(key);

    if (!matchedByDrive && !matchedByUrl && !matchedByKey) {
      if (isUniqueDriveId(wpItem.driveId)) portSeenDrive.add(wpItem.driveId);
      portSeenKey.add(key);
      plan.portarias.inserts.push({
        tipo: 'portaria',
        categoria: 'Portaria',
        numero: wpItem.numero,
        ano: wpItem.ano,
        ementa: wpItem.ementa || `Portaria Municipal nº ${wpItem.numero}`,
        arquivo: wpItem.link,
        documentUrl: wpItem.link,
        situacaoVigencia: 'vigente',
        orgaoResponsavel: 'Gabinete do Prefeito',
        situacaoPublicacao: 'publicado',
        ativo: true,
      });
    }
  }

  // ==================== MÓDULO 3: LEIS HISTÓRICAS (1983–2025) ====================
  const dbLeis = dbLegislacao.filter((l) => l.tipo.toLowerCase().includes('lei'));
  const leiByNumAno = new Map();
  const leiSeenDrive = new Set();

  for (const l of dbLeis) {
    const driveId = extractDriveId(l.documentUrl) || extractDriveId(l.arquivo);
    if (isUniqueDriveId(driveId)) leiSeenDrive.add(driveId);
    const parsed = parseNumeroAnoAto(l.numero, l.ementa);
    const key = `${parsed.numeroSemZero}|${parsed.ano || l.ano}`;
    if (!leiByNumAno.has(key)) leiByNumAno.set(key, l);

    const updateData = {};
    if (String(l.arquivo || '').includes('_open') && isValidHttpUrl(l.documentUrl)) {
      updateData.arquivo = l.documentUrl;
    }
    if (l.tipo !== 'lei') updateData.tipo = 'lei';
    if (Object.keys(updateData).length > 0) {
      plan.leisHistoricas.updates.push({ id: l.id, numero: l.numero, data: updateData });
    }
  }

  for (const wpItem of wp.wpLeisHistoricas) {
    if (!wpItem.ano) continue;
    const key = `${wpItem.numeroSemZero}|${wpItem.ano}`;
    const existing = leiByNumAno.get(key);
    const matchedByDrive = isUniqueDriveId(wpItem.driveId) && leiSeenDrive.has(wpItem.driveId);

    if (existing) {
      // Se o registro atual usa o Drive genérico e temos PDF dedicado do WP, atualiza arquivo!
      const usesGeneric =
        extractDriveId(existing.arquivo) === GENERIC_SHARED_DRIVE_ID || !existing.arquivo;
      if (wpItem.dedicatedWpPdf && usesGeneric && existing.arquivo !== wpItem.dedicatedWpPdf) {
        plan.leisHistoricas.updates.push({
          id: existing.id,
          numero: existing.numero,
          reason: 'Atualiza link genérico do Drive para PDF dedicado do WordPress',
          data: {
            arquivo: wpItem.dedicatedWpPdf,
            documentUrl: wpItem.dedicatedWpPdf,
          },
        });
      }
    } else if (!matchedByDrive) {
      if (isUniqueDriveId(wpItem.driveId)) leiSeenDrive.add(wpItem.driveId);
      const isLC = normalizeText(wpItem.ementa).includes('LEI COMPLEMENTAR') || parseInt(wpItem.numeroSemZero, 10) < 100;
      plan.leisHistoricas.inserts.push({
        tipo: 'lei',
        categoria: isLC ? 'Lei Complementar' : 'Lei Ordinária',
        numero: wpItem.numero,
        ano: wpItem.ano,
        ementa: wpItem.ementa,
        arquivo: wpItem.link,
        documentUrl: wpItem.link,
        situacaoVigencia: 'vigente',
        orgaoResponsavel: 'Gabinete do Prefeito',
        situacaoPublicacao: 'publicado',
        ativo: true,
      });
    }
  }

  // ==================== MÓDULO 4: CONCURSOS E EDITAIS ====================
  // 4.1 Concursos (#tablepress-11)
  const dbConcursosBroken = dbConcursos.filter(
    (c) => c.tipo === 'Concurso' && c.titulo === 'Baixar Arquivo'
  );
  if (dbConcursosBroken.length === wp.wpConcursos.length && dbConcursosBroken.length > 0) {
    for (let i = 0; i < wp.wpConcursos.length; i++) {
      const dbC = dbConcursosBroken[i];
      const wpC = wp.wpConcursos[i];
      plan.concursos.updates.push({
        id: dbC.id,
        oldTitulo: dbC.titulo,
        newTitulo: wpC.titulo,
        data: {
          tipo: 'concurso',
          titulo: wpC.titulo,
          descricao: wpC.descricao,
          linkEdital: wpC.link,
          status: 'encerrado',
        },
      });
    }
  } else {
    // Reconciliação idempotente após primeira execução ou caso ordem divirja
    const dbConcOk = dbConcursos.filter((c) => c.tipo.toLowerCase().includes('concurso'));
    const consumedConcIds = new Set();
    for (const wpC of wp.wpConcursos) {
      let match = dbConcOk.find((c) => !consumedConcIds.has(c.id) && c.linkEdital === wpC.link);
      if (!match) {
        match = dbConcOk.find(
          (c) =>
            !consumedConcIds.has(c.id) &&
            normalizeText(c.titulo) === normalizeText(wpC.titulo)
        );
      }
      if (match) {
        consumedConcIds.add(match.id);
        if (
          match.tipo !== 'concurso' ||
          match.titulo !== wpC.titulo ||
          match.linkEdital !== wpC.link
        ) {
          plan.concursos.updates.push({
            id: match.id,
            oldTitulo: match.titulo,
            newTitulo: wpC.titulo,
            data: {
              tipo: 'concurso',
              titulo: wpC.titulo,
              descricao: wpC.descricao,
              linkEdital: wpC.link,
            },
          });
        }
      } else {
        plan.concursos.warnings.push(
          `Concurso WP não conciliado automaticamente: ${wpC.titulo} (${wpC.link})`
        );
      }
    }
  }

  // 4.2 Editais de Licitação (#tablepress-3)
  const dbEditais = dbConcursos.filter((c) => c.tipo.toLowerCase() === 'edital');
  const consumedEditalIds = new Set();

  for (const wpE of wp.wpEditaisLicitacao) {
    // Primeiro tenta por linkEdital exato / Drive ID (cobre reexecução idempotente)
    let matched = dbEditais.find(
      (c) =>
        !consumedEditalIds.has(c.id) &&
        ((wpE.link && c.linkEdital === wpE.link) ||
          (isUniqueDriveId(wpE.driveId) && extractDriveId(c.linkEdital) === wpE.driveId))
    );
    // Senão tenta por título normalizado
    if (!matched) {
      matched = dbEditais.find(
        (c) =>
          !consumedEditalIds.has(c.id) &&
          normalizeText(c.titulo) === normalizeText(wpE.titulo)
      );
    }

    if (matched) {
      consumedEditalIds.add(matched.id);
      const needsUpdate =
        matched.linkEdital !== wpE.link ||
        matched.tipo !== 'edital' ||
        (wpE.descricao && matched.descricao !== wpE.descricao);
      if (needsUpdate) {
        plan.editais.updates.push({
          id: matched.id,
          titulo: wpE.titulo,
          oldLink: matched.linkEdital,
          newLink: wpE.link,
          data: {
            tipo: 'edital',
            titulo: wpE.titulo,
            descricao: wpE.descricao,
            linkEdital: wpE.link,
            ...(wpE.dataPublicacao ? { dataPublicacao: wpE.dataPublicacao } : {}),
          },
        });
      }
    } else {
      plan.editais.inserts.push({
        source: 'editais-licitacao',
        tipo: 'edital',
        titulo: wpE.titulo,
        slug: `${slugify(wpE.titulo)}-${Date.now()}-${plan.editais.inserts.length}`,
        status: 'aberto',
        vagas: '',
        dataPublicacao: wpE.dataPublicacao || new Date(),
        linkEdital: wpE.link,
        fasesAtos: '[]',
        ativo: true,
        descricao: wpE.descricao,
      });
    }
  }

  // 4.3 Editais de Chamamento Público (#tablepress-24) e Atos da Cultura (/cultura/)
  const otherEditais = [
    ...wp.wpEditaisChamamento.map((e) => ({ ...e, source: 'editais-2-chamamento' })),
    ...wp.wpCulturaEditais.map((e) => ({ ...e, source: 'cultura-editais' })),
  ];

  for (const wpE of otherEditais) {
    const alreadyExists = dbEditais.some(
      (c) =>
        (wpE.link && c.linkEdital === wpE.link) ||
        (isUniqueDriveId(wpE.driveId) && extractDriveId(c.linkEdital) === wpE.driveId) ||
        normalizeText(c.titulo) === normalizeText(wpE.titulo)
    );
    const alreadyInInserts = plan.editais.inserts.some((i) => i.linkEdital === wpE.link);
    if (!alreadyExists && !alreadyInInserts) {
      const yearMatch = `${wpE.numAno || ''} ${wpE.titulo} ${wpE.link}`.match(/\b(202[0-6])\b/);
      const pubDate =
        wpE.dataPublicacao ||
        (yearMatch ? new Date(Date.UTC(parseInt(yearMatch[1], 10), 6, 1, 12, 0, 0)) : new Date());
      plan.editais.inserts.push({
        source: wpE.source,
        tipo: 'edital',
        titulo: wpE.titulo,
        slug: `${slugify(wpE.titulo).slice(0, 60)}-${Date.now()}-${plan.editais.inserts.length}`,
        status: 'aberto',
        vagas: '',
        dataPublicacao: pubDate,
        linkEdital: wpE.link,
        fasesAtos: '[]',
        ativo: true,
        descricao: wpE.descricao,
      });
    }
  }

  // ==================== MÓDULO 5: RELATÓRIOS FISCAIS (RGF, RREO, LDO, LOA, PPA, BALANCO, RELATORIO_GESTAO) ====================
  // Passo 5.1: Normalizar tipos/períodos existentes (ex: "Balanço Patrimonial" -> "BALANCO", LOA 2020 "202" -> "2020", BALANCO 2025 "1º Bimestre" -> "Anual")
  const normalizedRfCache = new Map();
  for (const r of dbRelatorios) {
    const normTipo = normalizeTipoRF(r.tipo);
    let normPeriodo = r.periodo;
    if (normTipo === 'BALANCO') normPeriodo = 'Anual';
    if (normTipo === 'LOA' && r.ano === 2020 && r.periodo === '202') normPeriodo = '2020';

    const updateData = {};
    if (normTipo !== r.tipo) updateData.tipo = normTipo;
    if (normPeriodo !== r.periodo) updateData.periodo = normPeriodo;
    if (Object.keys(updateData).length > 0) {
      plan.relatoriosFiscais.updates.push({
        id: r.id,
        titulo: r.titulo,
        reason: `Normalização de metadados (${r.tipo}/${r.periodo} -> ${normTipo}/${normPeriodo})`,
        data: updateData,
      });
    }

    const key = `${normTipo}|${r.ano}|${normalizePeriodoRF(normTipo, normPeriodo, r.ano)}`;
    if (!normalizedRfCache.has(key)) normalizedRfCache.set(key, []);
    normalizedRfCache.get(key).push({ ...r, normTipo, normPeriodo });
  }

  // Passo 5.2: Reconciliar todos os itens do WP (#tablepress-14, 15, 16, 17, 18, 22, 61)
  for (const wpR of wp.wpRelatoriosFiscais) {
    if (!wpR.validLink) {
      plan.relatoriosFiscais.invalidWpLinks.push({
        tipo: wpR.tipo,
        ano: wpR.ano,
        periodo: wpR.periodo,
        link: wpR.link,
        reason: 'Link corrompido/inválido na origem WordPress',
      });
    }

    const key = `${wpR.tipo}|${wpR.ano}|${normalizePeriodoRF(wpR.tipo, wpR.periodo, wpR.ano)}`;
    const existingList = normalizedRfCache.get(key) || [];

    if (existingList.length > 0) {
      if (wpR.validLink) {
        for (const dbR of existingList) {
          const isLegacyLocalOrBase64 =
            !dbR.arquivo ||
            dbR.arquivo.startsWith('/uploads/migracao/') ||
            dbR.arquivo.startsWith('data:') ||
            !isValidHttpUrl(dbR.arquivo);
          if (isLegacyLocalOrBase64 && dbR.arquivo !== wpR.link) {
            // Merge into existing update if present
            const existingUpd = plan.relatoriosFiscais.updates.find((u) => u.id === dbR.id);
            if (existingUpd) {
              existingUpd.data.arquivo = wpR.link;
              existingUpd.reason += ` + Atualiza arquivo legado para URL WP/Drive`;
            } else {
              plan.relatoriosFiscais.updates.push({
                id: dbR.id,
                titulo: dbR.titulo,
                reason: `Atualiza arquivo legado (${String(dbR.arquivo).slice(0, 35)}...) para URL oficial`,
                data: { arquivo: wpR.link },
              });
            }
          }
        }
      }
    } else if (wpR.validLink) {
      plan.relatoriosFiscais.inserts.push({
        tipo: wpR.tipo,
        titulo: wpR.titulo,
        periodicidade: wpR.periodicidade,
        periodo: wpR.periodo,
        ano: wpR.ano,
        arquivo: wpR.link,
        orgaoResponsavel: 'Secretaria de Finanças e Tributação',
        situacaoPublicacao: 'publicado',
        dataPublicacao: new Date(Date.UTC(wpR.ano > 2026 ? 2026 : wpR.ano, 6, 1, 12, 0, 0)),
      });
    }
  }

  // ==================== MÓDULO 6: DOCUMENTOS / PLANOS MUNICIPAIS ====================
  const planUrlMap = {
    'plano-educacao': 'https://saotome.rn.gov.br/wp-content/uploads/2023/07/PL-1029-2012-PME-Sao-Tome_compressed.pdf',
    'plano-saude': 'https://saotome.rn.gov.br/wp-content/uploads/2023/07/Plano-municipal-de-Saude-Sao-Tome-22-25_compressed-1.pdf',
  };
  for (const doc of dbDocumentos) {
    const targetUrl = planUrlMap[doc.tipo];
    if (targetUrl && (doc.arquivo !== targetUrl || doc.documentUrl !== targetUrl)) {
      plan.documentos.updates.push({
        id: doc.id,
        titulo: doc.titulo,
        oldArquivo: doc.arquivo,
        newArquivo: targetUrl,
        data: {
          arquivo: targetUrl,
          documentUrl: targetUrl,
          dataAtualizacaoEfetiva: new Date(),
        },
      });
    }
  }

  return plan;
}

// ---------------------------------------------------------------------------
// 5. Aplicação no Banco (--apply --confirm)
// ---------------------------------------------------------------------------
async function applySyncPlan(prisma, plan) {
  console.log('\n[3/3] Aplicando sincronização completa no PostgreSQL...');
  const now = new Date();
  const applied = {
    decretosUpdated: 0,
    decretosInserted: 0,
    portariasUpdated: 0,
    portariasInserted: 0,
    leisHistoricasUpdated: 0,
    leisHistoricasInserted: 0,
    concursosUpdated: 0,
    editaisUpdated: 0,
    editaisInserted: 0,
    relatoriosFiscaisUpdated: 0,
    relatoriosFiscaisInserted: 0,
    documentosUpdated: 0,
  };

  // 1. Decretos Updates (lotes de 50)
  for (let i = 0; i < plan.decretos.updates.length; i += 50) {
    const batch = plan.decretos.updates.slice(i, i + 50);
    await prisma.$transaction(
      batch.map((u) =>
        prisma.legislacao.update({
          where: { id: u.id },
          data: { ...u.data, dataAtualizacaoEfetiva: now },
        })
      )
    );
    applied.decretosUpdated += batch.length;
  }
  // 1b. Decretos Inserts (createMany em lotes de 200)
  for (let i = 0; i < plan.decretos.inserts.length; i += 200) {
    const batch = plan.decretos.inserts.slice(i, i + 200);
    const res = await prisma.legislacao.createMany({
      data: batch.map((item) => ({ ...item, dataAtualizacaoEfetiva: now })),
    });
    applied.decretosInserted += res.count;
  }

  // 2. Portarias Updates
  for (let i = 0; i < plan.portarias.updates.length; i += 50) {
    const batch = plan.portarias.updates.slice(i, i + 50);
    await prisma.$transaction(
      batch.map((u) =>
        prisma.legislacao.update({
          where: { id: u.id },
          data: { ...u.data, dataAtualizacaoEfetiva: now },
        })
      )
    );
    applied.portariasUpdated += batch.length;
  }
  // 2b. Portarias Inserts
  for (let i = 0; i < plan.portarias.inserts.length; i += 200) {
    const batch = plan.portarias.inserts.slice(i, i + 200);
    const res = await prisma.legislacao.createMany({
      data: batch.map((item) => ({ ...item, dataAtualizacaoEfetiva: now })),
    });
    applied.portariasInserted += res.count;
  }

  // 3. Leis Históricas Updates & Inserts
  for (let i = 0; i < plan.leisHistoricas.updates.length; i += 50) {
    const batch = plan.leisHistoricas.updates.slice(i, i + 50);
    await prisma.$transaction(
      batch.map((u) =>
        prisma.legislacao.update({
          where: { id: u.id },
          data: { ...u.data, dataAtualizacaoEfetiva: now },
        })
      )
    );
    applied.leisHistoricasUpdated += batch.length;
  }
  if (plan.leisHistoricas.inserts.length > 0) {
    const res = await prisma.legislacao.createMany({
      data: plan.leisHistoricas.inserts.map((item) => ({ ...item, dataAtualizacaoEfetiva: now })),
    });
    applied.leisHistoricasInserted += res.count;
  }

  // 4. Concursos Updates
  for (let i = 0; i < plan.concursos.updates.length; i += 50) {
    const batch = plan.concursos.updates.slice(i, i + 50);
    await prisma.$transaction(
      batch.map((u) => prisma.concurso.update({ where: { id: u.id }, data: u.data }))
    );
    applied.concursosUpdated += batch.length;
  }

  // 4b. Editais Updates & Inserts
  for (let i = 0; i < plan.editais.updates.length; i += 50) {
    const batch = plan.editais.updates.slice(i, i + 50);
    await prisma.$transaction(
      batch.map((u) => prisma.concurso.update({ where: { id: u.id }, data: u.data }))
    );
    applied.editaisUpdated += batch.length;
  }
  for (const ins of plan.editais.inserts) {
    const { source: _ignored, ...createData } = ins;
    await prisma.concurso.create({ data: createData });
    applied.editaisInserted += 1;
  }

  // 5. Relatórios Fiscais Updates & Inserts
  for (let i = 0; i < plan.relatoriosFiscais.updates.length; i += 50) {
    const batch = plan.relatoriosFiscais.updates.slice(i, i + 50);
    await prisma.$transaction(
      batch.map((u) => prisma.relatorioFiscal.update({ where: { id: u.id }, data: u.data }))
    );
    applied.relatoriosFiscaisUpdated += batch.length;
  }
  if (plan.relatoriosFiscais.inserts.length > 0) {
    const res = await prisma.relatorioFiscal.createMany({
      data: plan.relatoriosFiscais.inserts,
    });
    applied.relatoriosFiscaisInserted += res.count;
  }

  // 6. Documentos / Planos Updates
  for (const u of plan.documentos.updates) {
    await prisma.documento.update({ where: { id: u.id }, data: u.data });
    applied.documentosUpdated += 1;
  }

  return applied;
}

// ---------------------------------------------------------------------------
// 6. Execução Principal
// ---------------------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  const hasApply = args.includes('--apply');
  const hasConfirm = args.includes('--confirm');
  const isApply = hasApply && hasConfirm;

  if (hasApply && !hasConfirm) {
    console.error('ERRO: Para gravar no banco, passe explicitamente `--apply --confirm`.');
    process.exit(1);
  }

  console.log('================================================================================');
  console.log(
    isApply
      ? ' SINCRONIZAÇÃO COMPLETA DE LEGISLAÇÃO E ARQUIVOS (--apply --confirm)'
      : ' SIMULAÇÃO COMPLETA DE LEGISLAÇÃO E ARQUIVOS (--dry-run: ZERO ESCRITAS NO BANCO)'
  );
  console.log(' Origem : https://saotome.rn.gov.br/');
  console.log(' Destino: https://saotomern.vercel.app/');
  console.log('================================================================================\n');

  const prisma = new PrismaClient();
  try {
    const wp = await fetchWordPressSources();
    const plan = await buildSyncPlan(prisma, wp);

    const summary = {
      timestamp: new Date().toISOString(),
      mode: isApply ? 'APPLY_CONFIRMED' : 'DRY_RUN_SIMULATION',
      wpExtractedCounts: {
        decretos: wp.wpDecretos.length,
        portarias: wp.wpPortarias.length,
        leisHistoricas: wp.wpLeisHistoricas.length,
        concursos: wp.wpConcursos.length,
        editaisLicitacao: wp.wpEditaisLicitacao.length,
        editaisChamamento: wp.wpEditaisChamamento.length,
        culturaEditais: wp.wpCulturaEditais.length,
        relatoriosFiscais: wp.wpRelatoriosFiscais.length,
      },
      countsAntes: plan.countsAntes,
      planejamento: {
        decretosUpdates: plan.decretos.updates.length,
        decretosInserts: plan.decretos.inserts.length,
        portariasUpdates: plan.portarias.updates.length,
        portariasInserts: plan.portarias.inserts.length,
        leisHistoricasUpdates: plan.leisHistoricas.updates.length,
        leisHistoricasInserts: plan.leisHistoricas.inserts.length,
        concursosUpdates: plan.concursos.updates.length,
        concursosWarnings: plan.concursos.warnings,
        editaisUpdates: plan.editais.updates.length,
        editaisInserts: plan.editais.inserts.length,
        relatoriosFiscaisUpdates: plan.relatoriosFiscais.updates.length,
        relatoriosFiscaisInserts: plan.relatoriosFiscais.inserts.length,
        relatoriosFiscaisInvalidWpLinks: plan.relatoriosFiscais.invalidWpLinks,
        documentosUpdates: plan.documentos.updates.length,
      },
      detalhesInserts: {
        leisHistoricasInserts: plan.leisHistoricas.inserts.map((x) => `${x.numero} (${x.ano})`),
        editaisInserts: plan.editais.inserts.map((x) => `[${x.source}] ${x.titulo}`),
        relatoriosFiscaisInserts: plan.relatoriosFiscais.inserts.map(
          (x) => `${x.tipo} (${x.ano}) - ${x.periodo} -> ${x.arquivo}`
        ),
        relatoriosFiscaisUpdates: plan.relatoriosFiscais.updates.map(
          (u) => `${u.titulo} (${u.id}): ${u.reason}`
        ),
        documentosUpdates: plan.documentos.updates.map((u) => `${u.titulo}: ${u.newArquivo}`),
      },
    };

    if (isApply) {
      const applied = await applySyncPlan(prisma, plan);
      const [legCount, concCount, rfCount, docCount] = await Promise.all([
        prisma.legislacao.count(),
        prisma.concurso.count(),
        prisma.relatorioFiscal.count(),
        prisma.documento.count(),
      ]);
      summary.applied = applied;
      summary.countsDepois = {
        legislacao: legCount,
        concursos: concCount,
        relatoriosFiscais: rfCount,
        documentos: docCount,
      };
    }

    const outPath = path.join(
      process.cwd(),
      'scratch',
      isApply
        ? 'relatorio-sincronizacao-completa-aplicado.json'
        : 'relatorio-sincronizacao-completa-simulacao.json'
    );
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(summary, null, 2), 'utf8');

    console.log('\n--- RESUMO DE ORIGEM WP ---');
    console.log(summary.wpExtractedCounts);
    console.log('\n--- RESUMO DE AÇÕES (PLANO) ---');
    console.log(summary.planejamento);
    if (isApply) {
      console.log('\n--- RESUMO APLICADO ---');
      console.log(summary.applied);
      console.log('\n--- TOTAIS DEPOIS NO BANCO ---');
      console.log(summary.countsDepois);
    }
    console.log(`\nRelatório salvo em: ${outPath}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Erro fatal na sincronização:', err);
  process.exit(1);
});
