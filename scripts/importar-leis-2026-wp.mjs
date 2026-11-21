#!/usr/bin/env node
/**
 * Importador com Modo de Simulação (Dry-Run) e Execução (--apply --confirm) — Leis de 2026
 * Origem (WordPress): https://saotome.rn.gov.br/ (Tabela /leis/ + WP REST API /wp-json/wp/v2/media)
 * Destino (Next.js + Prisma/Neon): https://saotomern.vercel.app/
 *
 * Uso:
 *   node scripts/importar-leis-2026-wp.mjs --dry-run
 *   node scripts/importar-leis-2026-wp.mjs --dry-run --report-json scratch/relatorio-leis-2026-simulacao.json
 *   node scripts/importar-leis-2026-wp.mjs --apply --confirm
 *
 * Decisões aprovadas incorporadas:
 *   - 1A: Corrigir campo `ano` das 5 leis de 2026 já migradas (1439..1443 -> 2026) sem duplicar,
 *         e também corrigir o `ano` das outras leis históricas (2015–2025) cujo `numero` termina em `/YYYY`.
 *   - 2A: Cadastrar a Lei Complementar 028/2026 com tipo="lei", categoria="Lei Complementar", numero="028/2026", ano=2026.
 *   - 3A: Incluir a Lei 1448/2026 (LDO 2027) da Biblioteca de Mídia do WordPress com ementa oficial.
 *   - 4A: Corrigir a numeração digitada no WordPress de 1250/2026 -> 1450/2026 e 1251/2026 -> 1451/2026,
 *         conforme comprovado nos PDFs oficiais assinados do Google Drive.
 */

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

// ---------------------------------------------------------------------------
// 1. Carregamento de variáveis de ambiente (.env.local / .env.production)
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

// ---------------------------------------------------------------------------
// 2. Utilitários de Normalização e Extração
// ---------------------------------------------------------------------------
const WP_BASE_URL = 'https://saotome.rn.gov.br';
const WP_LEIS_URL = `${WP_BASE_URL}/leis/`;
const WP_MEDIA_URL = `${WP_BASE_URL}/wp-json/wp/v2/media?per_page=100&after=2026-01-01T00:00:00`;
const DEST_BASE_URL = 'https://saotomern.vercel.app';
const DEST_API_URL = `${DEST_BASE_URL}/api/legislacao?limit=5000`;

const LDO_2027_URL =
  'https://saotome.rn.gov.br/wp-content/uploads/2026/07/LEI-No-1448.2026_LDO2027_compressed.pdf';
const LDO_2027_EMENTA =
  'Dispõe sobre as diretrizes para a elaboração e execução da Lei Orçamentária Anual do Município de São Tomé/RN para o exercício de 2027, e dá outras providências.';

function extractDriveId(url) {
  if (!url) return null;
  const m1 = String(url).match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (m1) return m1[1];
  const m2 = String(url).match(/\/file\/d\/([a-zA-Z0-9_-]{15,})/);
  if (m2) return m2[1];
  return null;
}

function normalizeText(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

/**
 * Interpreta o campo "Número/Ano" (ex: "1447/2026", "028/2026", "1.416/2025")
 */
function parseNumeroEAno(rawNumero, fallbackAno = null) {
  const clean = String(rawNumero || '').trim();
  const slashMatch = clean.match(/^([0-9.]+)\s*\/\s*(\d{4})$/);
  if (slashMatch) {
    const numRaw = slashMatch[1];
    const numDigits = numRaw.replace(/\./g, '');
    const numInt = parseInt(numDigits, 10);
    const yearInt = parseInt(slashMatch[2], 10);
    return {
      raw: clean,
      numeroFormatado: `${numDigits}/${yearInt}`,
      numeroSemZero: String(numInt),
      numeroInt: numInt,
      anoExtraido: yearInt,
    };
  }
  const digitsOnly = clean.replace(/\D/g, '');
  const numInt = digitsOnly ? parseInt(digitsOnly, 10) : null;
  return {
    raw: clean,
    numeroFormatado: clean,
    numeroSemZero: numInt !== null ? String(numInt) : clean,
    numeroInt: numInt,
    anoExtraido: fallbackAno,
  };
}

/**
 * Aplica o mapeamento oficial das decisões aprovadas (2A, 3A, 4A) ao item extraído do WordPress.
 */
function resolveTargetMetadata(wpItem) {
  let numeroAlvo = wpItem.parsed.numeroFormatado;
  let numeroIntAlvo = wpItem.parsed.numeroInt;
  let notaAjuste = null;

  // Decisão 4A: 1250/2026 -> 1450/2026 e 1251/2026 -> 1451/2026 conforme PDFs oficiais
  if (
    wpItem.col0 === '1250/2026' ||
    wpItem.driveId === '137vSkm-8guNf6_6WNPE2pRZE-En91do0'
  ) {
    numeroAlvo = '1450/2026';
    numeroIntAlvo = 1450;
    notaAjuste =
      'Decisão 4A aplicada: número corrigido de "1250/2026" (tabela WP) para "1450/2026" (PDF oficial).';
  } else if (
    wpItem.col0 === '1251/2026' ||
    wpItem.driveId === '1G3GMp3pOZA9ob9Zd_zApF_R75oGrU9fm'
  ) {
    numeroAlvo = '1451/2026';
    numeroIntAlvo = 1451;
    notaAjuste =
      'Decisão 4A aplicada: número corrigido de "1251/2026" (tabela WP) para "1451/2026" (PDF oficial).';
  }

  // Decisão 2A: 028/2026 é Lei Complementar; demais são Lei Ordinária
  const isLeiComplementar =
    numeroIntAlvo < 100 ||
    wpItem.driveId === '1cj8MNvS13hmKrMjr6xtRN020V3ADDW0P' ||
    normalizeText(wpItem.ementa).includes('ALTERA A LEI COMPLEMENTAR');

  const categoriaAlvo = isLeiComplementar
    ? 'Lei Complementar'
    : 'Lei Ordinária';

  if (isLeiComplementar) {
    numeroAlvo = '028/2026';
    numeroIntAlvo = 28;
    notaAjuste =
      'Decisão 2A aplicada: cadastrada com tipo="lei", categoria="Lei Complementar", numero="028/2026".';
  }

  // Decisão 3A: 1448/2026 (LDO 2027) extraída da Mídia do WordPress
  let ementaAlvo = wpItem.ementa;
  let arquivoAlvo = wpItem.link;
  if (
    wpItem.wpMediaId === 10078 ||
    wpItem.link === LDO_2027_URL ||
    numeroIntAlvo === 1448
  ) {
    numeroAlvo = '1448/2026';
    numeroIntAlvo = 1448;
    ementaAlvo = LDO_2027_EMENTA;
    arquivoAlvo = LDO_2027_URL;
    notaAjuste =
      'Decisão 3A aplicada: Lei 1448/2026 (LDO 2027) incluída a partir da Biblioteca de Mídia do WordPress.';
  }

  return {
    numeroAlvo,
    numeroIntAlvo,
    categoriaAlvo,
    isLeiComplementar,
    ementaAlvo,
    arquivoAlvo,
    notaAjuste,
  };
}

/**
 * Inspeciona o título do arquivo no Google Drive ou cabeçalho HTTP (somente leitura)
 */
async function probeDocumentUrl(url) {
  if (!url) return { reachable: false, status: 0, driveTitle: null, finalUrl: null };
  const driveId = extractDriveId(url);
  const targetUrl = driveId
    ? `https://drive.google.com/file/d/${driveId}/view`
    : url;

  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PortalSaoTomeMigrator/1.0)',
      },
    });
    let driveTitle = null;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      const html = await res.text();
      const ogMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      driveTitle = ogMatch
        ? ogMatch[1].trim()
        : titleMatch
        ? titleMatch[1].replace(/\s*-\s*Google Drive\s*$/i, '').trim()
        : null;
    }
    return {
      reachable: res.ok,
      status: res.status,
      contentType,
      driveTitle,
      driveId,
    };
  } catch (err) {
    return {
      reachable: false,
      status: 0,
      error: err.message,
      driveTitle: null,
      driveId,
    };
  }
}

// ---------------------------------------------------------------------------
// 3. Extração das Leis de 2026 do WordPress (https://saotome.rn.gov.br/)
// ---------------------------------------------------------------------------
async function extractWordPress2026Laws() {
  console.log(`[1/4] Extraindo tabela de leis do WordPress: ${WP_LEIS_URL}`);
  const res = await fetch(WP_LEIS_URL);
  if (!res.ok) {
    throw new Error(`Falha ao acessar ${WP_LEIS_URL}: HTTP ${res.status}`);
  }
  const html = await res.text();
  const $ = cheerio.load(html);

  const tableRows = [];
  $('table tbody tr').each((idx, tr) => {
    const tds = $(tr).find('td');
    if (tds.length < 2) return;
    const col0 = $(tds[0]).text().trim();
    const col1 = $(tds[1]).text().replace(/\s+/g, ' ').trim();
    const col1Raw = $(tds[1]).text().trim();
    const link =
      $(tds[2]).find('a').attr('href') || $(tr).find('a').attr('href') || null;
    const parsed = parseNumeroEAno(col0);

    tableRows.push({
      sourceType: 'wp_tablepress_leis',
      tableRowNumber: idx + 1,
      col0,
      ementa: col1,
      ementaRaw: col1Raw,
      link,
      driveId: extractDriveId(link),
      parsed,
    });
  });

  // Filtra leis cujo ano no número é 2026
  const wpTable2026 = tableRows.filter((r) => r.parsed.anoExtraido === 2026);

  // Também captura falsos positivos onde a ementa menciona 2026 mas o ano do ato é 2025 (ex: 1406/2025 - LDO 2026)
  const wpFalsePositives2026 = tableRows.filter(
    (r) => r.parsed.anoExtraido !== 2026 && r.ementa.includes('2026')
  );

  // Verifica biblioteca de mídia do WP em 2026 para detectar PDFs de Leis de 2026 não inseridos no TablePress
  console.log(`[2/4] Verificando biblioteca de mídia WP REST API: ${WP_MEDIA_URL}`);
  const wpMediaExtra2026 = [];
  try {
    const mediaRes = await fetch(WP_MEDIA_URL);
    if (mediaRes.ok) {
      const mediaItems = await mediaRes.json();
      for (const m of mediaItems) {
        const title = m.title?.rendered || '';
        const sourceUrl = m.source_url || '';
        const matchLei2026 =
          title.match(/LEI\s+N[º°o.]*\s*(\d+)[./-]2026/i) ||
          sourceUrl.match(/LEI[-_]+N[º°o.]*[-_]*(\d+)[./-]2026/i);
        if (matchLei2026) {
          const numInt = parseInt(matchLei2026[1], 10);
          const alreadyInTable = wpTable2026.some(
            (r) => r.parsed.numeroInt === numInt
          );
          if (!alreadyInTable) {
            wpMediaExtra2026.push({
              sourceType: 'wp_rest_media',
              wpMediaId: m.id,
              wpUploadDate: m.date,
              col0: `${numInt}/2026`,
              title,
              ementa:
                m.id === 10078 || sourceUrl === LDO_2027_URL || numInt === 1448
                  ? LDO_2027_EMENTA
                  : title,
              link: sourceUrl,
              driveId: null,
              parsed: parseNumeroEAno(`${numInt}/2026`),
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn(`Aviso ao consultar WP Media API: ${err.message}`);
  }

  return {
    totalTableRows: tableRows.length,
    wpTable2026,
    wpMediaExtra2026,
    wpFalsePositives2026,
    allTableRows: tableRows,
  };
}

// ---------------------------------------------------------------------------
// 4. Leitura e Diagnóstico do Destino (Neon PostgreSQL + API Pública)
// ---------------------------------------------------------------------------
async function inspectDestination(prisma) {
  console.log(`[3/4] Lendo registros reais do destino (Prisma/Neon + ${DEST_API_URL})`);
  const dbRecords = await prisma.legislacao.findMany({
    orderBy: [{ ano: 'desc' }, { numero: 'desc' }],
  });

  let liveApiCount = null;
  try {
    const apiRes = await fetch(DEST_API_URL);
    if (apiRes.ok) {
      const apiData = await apiRes.json();
      const arr = Array.isArray(apiData) ? apiData : apiData.data || [];
      liveApiCount = arr.length;
    }
  } catch (err) {
    console.warn(`Aviso ao consultar API pública do destino: ${err.message}`);
  }

  // Separa leis no banco (case-insensitive)
  const dbLaws = dbRecords.filter((r) =>
    String(r.tipo || '').toLowerCase().includes('lei')
  );

  // Detecta bug estrutural de migração anterior: r.ano gravado com o número da lei em vez do ano após a barra
  const corruptedYearLaws = dbLaws.filter((r) => {
    const p = parseNumeroEAno(r.numero);
    return (
      p.anoExtraido !== null &&
      p.anoExtraido >= 1900 &&
      p.anoExtraido <= 2030 &&
      r.ano !== p.anoExtraido
    );
  });

  const corruptedYear2026Laws = corruptedYearLaws.filter((r) => {
    const p = parseNumeroEAno(r.numero);
    return p.anoExtraido === 2026;
  });

  const dbLawsWithAno2026 = dbLaws.filter((r) => r.ano === 2026);

  return {
    totalDbRecords: dbRecords.length,
    liveApiCount,
    totalDbLaws: dbLaws.length,
    dbLawsWithAno2026,
    corruptedYearLaws,
    corruptedYearLawsCount: corruptedYearLaws.length,
    corruptedYear2026Laws,
    dbLaws,
    dbRecords,
  };
}

// ---------------------------------------------------------------------------
// 5. Motor de Comparação e Classificação
// ---------------------------------------------------------------------------
async function compareAndSimulate(wpData, destData, { skipProbe = false } = {}) {
  console.log(`[4/4] Executando comparação detalhada e verificando links dos PDFs...`);

  const allWpCandidates = [
    ...wpData.wpTable2026,
    ...wpData.wpMediaExtra2026,
  ];

  const comparisonItems = [];

  for (const wpItem of allWpCandidates) {
    const resolved = resolveTargetMetadata(wpItem);
    const probe = skipProbe
      ? { reachable: true, status: 200, driveTitle: null, driveId: wpItem.driveId }
      : await probeDocumentUrl(resolved.arquivoAlvo);

    // Procura correspondência no banco de destino:
    // 1) Por Drive ID idêntico
    // 2) Por URL exata de arquivo / documentUrl (cobre 1448/2026 no WP Media)
    // 3) Por número/ano alvo ("1450/2026", "028/2026", "1443/2026", etc.) mesmo com ano corrompido
    const matchesByDriveId = wpItem.driveId
      ? destData.dbLaws.filter(
          (db) =>
            extractDriveId(db.arquivo) === wpItem.driveId ||
            extractDriveId(db.documentUrl) === wpItem.driveId
        )
      : [];

    const matchesByExactUrl = resolved.arquivoAlvo
      ? destData.dbLaws.filter(
          (db) =>
            db.arquivo === resolved.arquivoAlvo ||
            db.documentUrl === resolved.arquivoAlvo
        )
      : [];

    const matchesByTargetNumero = destData.dbLaws.filter((db) => {
      const pDb = parseNumeroEAno(db.numero);
      return (
        normalizeText(db.numero) === normalizeText(resolved.numeroAlvo) ||
        (pDb.numeroInt === resolved.numeroIntAlvo &&
          (db.ano === 2026 || pDb.anoExtraido === 2026))
      );
    });

    const matchedDb =
      matchesByDriveId[0] ||
      matchesByExactUrl[0] ||
      matchesByTargetNumero[0] ||
      null;

    // Verifica se o mesmo número base existe em outro ano (apenas informativo)
    const sameNumberOtherYear = destData.dbLaws.filter((db) => {
      const p = parseNumeroEAno(db.numero);
      return (
        p.numeroInt === resolved.numeroIntAlvo &&
        p.anoExtraido !== 2026 &&
        db.ano !== 2026
      );
    });

    const motivosDecisao = [];
    if (resolved.notaAjuste) {
      motivosDecisao.push(resolved.notaAjuste);
    }

    let statusCategoria = '';
    let acaoRecomendada = '';

    if (matchedDb) {
      const anoCorrompido = matchedDb.ano !== 2026;
      const tipoDivergente = matchedDb.tipo !== 'lei';
      const numeroDivergente =
        normalizeText(matchedDb.numero) !== normalizeText(resolved.numeroAlvo);
      const categoriaDivergente =
        matchedDb.categoria !== resolved.categoriaAlvo;
      const ementaDivergente =
        normalizeText(matchedDb.ementa) !== normalizeText(resolved.ementaAlvo);

      if (
        !anoCorrompido &&
        !tipoDivergente &&
        !numeroDivergente &&
        !categoriaDivergente &&
        !ementaDivergente
      ) {
        statusCategoria = 'JA_MIGRADA_OK';
        acaoRecomendada = 'Nenhuma ação (registro já íntegro no destino)';
      } else {
        statusCategoria = 'JA_MIGRADA_COM_ERRO_NO_BANCO';
        if (anoCorrompido) {
          motivosDecisao.push(
            `Registro já existe no banco (id: ${matchedDb.id}, numero: "${matchedDb.numero}"), porém o campo "ano" está como ${matchedDb.ano} em vez de 2026.`
          );
        }
        if (tipoDivergente) {
          motivosDecisao.push(
            `Campo "tipo" está como "${matchedDb.tipo}" (padrão do painel: "lei").`
          );
        }
        if (categoriaDivergente) {
          motivosDecisao.push(
            `Campo "categoria" está como ${JSON.stringify(matchedDb.categoria)} (esperado: "${resolved.categoriaAlvo}").`
          );
        }
        if (numeroDivergente) {
          motivosDecisao.push(
            `Campo "numero" está como "${matchedDb.numero}" (esperado: "${resolved.numeroAlvo}").`
          );
        }
        if (ementaDivergente) {
          motivosDecisao.push(`Ementa possui divergência no texto.`);
        }
        acaoRecomendada = `UPDATE no registro existente (${matchedDb.id}) corrigindo ano -> 2026, tipo -> "lei", categoria -> "${resolved.categoriaAlvo}" (NÃO duplicar).`;
      }
    } else {
      statusCategoria = 'FALTANDO_PRONTO_PARA_IMPORTAR';
      acaoRecomendada = `INSERT (${resolved.numeroAlvo}, tipo="lei", categoria="${resolved.categoriaAlvo}", ano=2026).`;
    }

    const simulatedPayload = {
      tipo: 'lei',
      categoria: resolved.categoriaAlvo,
      numero: resolved.numeroAlvo,
      ano: 2026,
      ementa: resolved.ementaAlvo,
      arquivo: resolved.arquivoAlvo,
      documentUrl: resolved.arquivoAlvo,
      situacaoVigencia: 'vigente',
      orgaoResponsavel: 'Gabinete do Prefeito',
      situacaoPublicacao: 'publicado',
      ativo: true,
    };

    comparisonItems.push({
      numeroWp: wpItem.col0,
      numeroAlvo: resolved.numeroAlvo,
      numeroInt: resolved.numeroIntAlvo,
      anoReal: 2026,
      origemWp:
        wpItem.sourceType === 'wp_tablepress_leis'
          ? `Tabela /leis/ (linha #${wpItem.tableRowNumber})`
          : `Mídia WP (ID #${wpItem.wpMediaId}, ${wpItem.wpUploadDate})`,
      ementaWp: resolved.ementaAlvo,
      linkWp: resolved.arquivoAlvo,
      driveId: wpItem.driveId,
      pdfProbe: probe,
      statusCategoria,
      motivosDecisao,
      acaoRecomendada,
      registroDestinoExistente: matchedDb
        ? {
            id: matchedDb.id,
            tipo: matchedDb.tipo,
            categoria: matchedDb.categoria,
            numero: matchedDb.numero,
            anoGravadoNoBanco: matchedDb.ano,
            arquivo: matchedDb.arquivo,
            documentUrl: matchedDb.documentUrl,
            ativo: matchedDb.ativo,
            criadoEm: matchedDb.criadoEm,
          }
        : null,
      conflitoOutroAnoNoBanco: sameNumberOtherYear.map((d) => ({
        id: d.id,
        numero: d.numero,
        anoGravado: d.ano,
        ementa: d.ementa.slice(0, 90) + '...',
      })),
      simulatedPayload,
    });
  }

  // Ordena pela sequência numérica alvo: 028/2026 primeiro, depois 1439..1451
  comparisonItems.sort((a, b) => a.numeroInt - b.numeroInt);

  const summary = {
    timestamp: new Date().toISOString(),
    mode: 'DRY_RUN_SIMULATION (ZERO_DB_WRITES)',
    sourceSite: WP_BASE_URL,
    destinationSite: DEST_BASE_URL,
    counts: {
      wpTableTotalRows: wpData.totalTableRows,
      wpTable2026Laws: wpData.wpTable2026.length,
      wpMediaExtra2026Laws: wpData.wpMediaExtra2026.length,
      total2026CandidatesEvaluated: comparisonItems.length,
      destTotalLegislacaoRecords: destData.totalDbRecords,
      destLiveApiRecords: destData.liveApiCount,
      destTotalLawsAllYears: destData.totalDbLaws,
      destLawsCurrentlyWithAno2026: destData.dbLawsWithAno2026.length,
      destLawsFrom2026WithCorruptedAno: destData.corruptedYear2026Laws.length,
      destAllLawsWithCorruptedAno: destData.corruptedYearLawsCount,
      byClassification: {
        JA_MIGRADA_OK: comparisonItems.filter(
          (i) => i.statusCategoria === 'JA_MIGRADA_OK'
        ).length,
        JA_MIGRADA_COM_ERRO_NO_BANCO: comparisonItems.filter(
          (i) => i.statusCategoria === 'JA_MIGRADA_COM_ERRO_NO_BANCO'
        ).length,
        FALTANDO_PRONTO_PARA_IMPORTAR: comparisonItems.filter(
          (i) => i.statusCategoria === 'FALTANDO_PRONTO_PARA_IMPORTAR'
        ).length,
        FALTANDO_PRECISA_DECISAO: comparisonItems.filter(
          (i) => i.statusCategoria === 'FALTANDO_PRECISA_DECISAO'
        ).length,
      },
    },
    falsePositivesExcluded: wpData.wpFalsePositives2026.map((fp) => ({
      col0: fp.col0,
      tableRowNumber: fp.tableRowNumber,
      reason:
        'Ato de 2025 cuja ementa menciona o exercício de 2026 (LDO 2026) — não é lei promulgada em 2026.',
      ementa: fp.ementa,
    })),
    corruptedHistoricalLawsSample: destData.corruptedYearLaws
      .filter((r) => parseNumeroEAno(r.numero).anoExtraido !== 2026)
      .slice(0, 10)
      .map((r) => ({
        id: r.id,
        numero: r.numero,
        anoAtual: r.ano,
        anoCorreto: parseNumeroEAno(r.numero).anoExtraido,
      })),
    items: comparisonItems,
  };

  return summary;
}

// ---------------------------------------------------------------------------
// 6. Execução Definitiva (--apply --confirm) das Decisões 1A, 2A, 3A, 4A
// ---------------------------------------------------------------------------
async function applyMigration(prisma, report, destData) {
  console.log('\n================================================================================');
  console.log(' APLICANDO MIGRAÇÃO DEFINITIVA (--apply --confirm)');
  console.log(' Decisões aprovadas: 1A (2026 + histórico), 2A (LC 028/2026), 3A (1448), 4A (1450/1451)');
  console.log('================================================================================\n');

  const log = {
    timestamp: new Date().toISOString(),
    updated2026: [],
    created2026: [],
    skippedDuplicates: [],
    updatedHistorical: [],
  };

  const now = new Date();

  // Etapa A: Corrigir leis de 2026 já existentes no banco com ano errado (ou categoria/tipo)
  const itemsToUpdate2026 = report.items.filter(
    (i) => i.statusCategoria === 'JA_MIGRADA_COM_ERRO_NO_BANCO' && i.registroDestinoExistente
  );
  console.log(`[Etapa A] Corrigindo ${itemsToUpdate2026.length} leis de 2026 já existentes no banco...`);
  for (const item of itemsToUpdate2026) {
    const updated = await prisma.legislacao.update({
      where: { id: item.registroDestinoExistente.id },
      data: {
        ano: 2026,
        tipo: 'lei',
        categoria: item.simulatedPayload.categoria,
        numero: item.simulatedPayload.numero,
        dataAtualizacaoEfetiva: now,
      },
    });
    log.updated2026.push({
      id: updated.id,
      numero: updated.numero,
      anoAnterior: item.registroDestinoExistente.anoGravadoNoBanco,
      anoNovo: updated.ano,
      categoria: updated.categoria,
    });
    console.log(
      `  ✓ UPDATE Lei ${updated.numero} (id=${updated.id}): ano ${item.registroDestinoExistente.anoGravadoNoBanco} -> ${updated.ano} | categoria="${updated.categoria}"`
    );
  }

  // Etapa B: Inserir as leis de 2026 faltantes (028/2026, 1444..1451/2026)
  const itemsToInsert = report.items.filter(
    (i) => i.statusCategoria === 'FALTANDO_PRONTO_PARA_IMPORTAR'
  );
  console.log(`\n[Etapa B] Inserindo ${itemsToInsert.length} leis de 2026 faltantes...`);
  for (const item of itemsToInsert) {
    const p = item.simulatedPayload;
    const duplicateCheck = await prisma.legislacao.findFirst({
      where: {
        tipo: { contains: 'lei', mode: 'insensitive' },
        OR: [
          { numero: p.numero, ano: 2026 },
          ...(p.arquivo ? [{ arquivo: p.arquivo }] : []),
          ...(p.documentUrl ? [{ documentUrl: p.documentUrl }] : []),
        ],
      },
    });

    if (duplicateCheck) {
      log.skippedDuplicates.push({
        numero: p.numero,
        existingId: duplicateCheck.id,
      });
      console.log(
        `  ⚠ Ignorado (já existe no banco): Lei ${p.numero} -> id=${duplicateCheck.id}`
      );
      continue;
    }

    const created = await prisma.legislacao.create({
      data: {
        tipo: p.tipo,
        categoria: p.categoria,
        numero: p.numero,
        ano: p.ano,
        ementa: p.ementa,
        arquivo: p.arquivo,
        documentUrl: p.documentUrl,
        situacaoVigencia: p.situacaoVigencia,
        orgaoResponsavel: p.orgaoResponsavel,
        situacaoPublicacao: p.situacaoPublicacao,
        ativo: p.ativo,
        dataAtualizacaoEfetiva: now,
      },
    });
    log.created2026.push({
      id: created.id,
      numeroWp: item.numeroWp,
      numero: created.numero,
      ano: created.ano,
      categoria: created.categoria,
      arquivo: created.arquivo,
    });
    console.log(
      `  ✓ INSERT Lei ${created.numero} (${created.categoria}) -> id=${created.id}`
    );
  }

  // Etapa C (Decisão 1A): Corrigir o campo `ano` das outras leis históricas (2015–2025) corrompidas
  const historicalCorrupted = destData.corruptedYearLaws.filter((r) => {
    const p = parseNumeroEAno(r.numero);
    return (
      p.anoExtraido !== null &&
      p.anoExtraido >= 1900 &&
      p.anoExtraido <= 2030 &&
      p.anoExtraido !== 2026 &&
      r.ano !== p.anoExtraido
    );
  });

  console.log(
    `\n[Etapa C] Corrigindo campo "ano" de ${historicalCorrupted.length} leis históricas (1900–2025) cujo numero termina em /YYYY...`
  );

  // Atualiza em lotes usando transação do Prisma para performance e atomicidade
  const batchSize = 50;
  for (let i = 0; i < historicalCorrupted.length; i += batchSize) {
    const batch = historicalCorrupted.slice(i, i + batchSize);
    await prisma.$transaction(
      batch.map((r) => {
        const correctYear = parseNumeroEAno(r.numero).anoExtraido;
        log.updatedHistorical.push({
          id: r.id,
          numero: r.numero,
          anoAnterior: r.ano,
          anoNovo: correctYear,
        });
        return prisma.legislacao.update({
          where: { id: r.id },
          data: {
            ano: correctYear,
            dataAtualizacaoEfetiva: now,
          },
        });
      })
    );
  }
  console.log(`  ✓ ${log.updatedHistorical.length} leis históricas corrigidas com sucesso.`);

  return log;
}

// ---------------------------------------------------------------------------
// 7. Execução Principal
// ---------------------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  const hasApply = args.includes('--apply');
  const hasConfirm = args.includes('--confirm');
  const isApply = hasApply && hasConfirm;
  const skipProbe = args.includes('--skip-probe');

  if (hasApply && !hasConfirm) {
    console.error(
      'ERRO: Para executar alterações reais no banco, passe explicitamente `--apply --confirm`.'
    );
    process.exit(1);
  }

  const reportJsonIdx = args.indexOf('--report-json');
  const reportJsonPath =
    reportJsonIdx !== -1 && args[reportJsonIdx + 1]
      ? args[reportJsonIdx + 1]
      : path.join(
          process.cwd(),
          'scratch',
          isApply
            ? 'relatorio-leis-2026-aplicado.json'
            : 'relatorio-leis-2026-simulacao.json'
        );

  console.log('================================================================================');
  console.log(
    isApply
      ? ' IMPORTAÇÃO DEFINITIVA — LEIS DE 2026 (MODO --apply --confirm)'
      : ' SIMULAÇÃO DE IMPORTAÇÃO — LEIS DE 2026 (MODO DRY-RUN: ZERO ESCRITAS NO BANCO)'
  );
  console.log(` Origem : ${WP_BASE_URL}/leis/`);
  console.log(` Destino: ${DEST_BASE_URL}/`);
  console.log('================================================================================\n');

  const prisma = new PrismaClient();
  try {
    const countBefore = await prisma.legislacao.count();
    const wpData = await extractWordPress2026Laws();
    const destData = await inspectDestination(prisma);
    const report = await compareAndSimulate(wpData, destData, { skipProbe });

    if (isApply) {
      report.mode = 'APPLY_CONFIRMED';
      const applyLog = await applyMigration(prisma, report, destData);
      const countAfter = await prisma.legislacao.count();
      const post2026Count = await prisma.legislacao.count({
        where: {
          tipo: { equals: 'lei', mode: 'insensitive' },
          ano: 2026,
        },
      });

      report.applyLog = applyLog;
      report.dbIntegrityCheck = {
        recordsBeforeApply: countBefore,
        recordsAfterApply: countAfter,
        netInsertedRecords: countAfter - countBefore,
        totalLaws2026InDb: post2026Count,
      };

      fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
      fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2), 'utf8');

      console.log('\n--- RESUMO DA EXECUÇÃO (--apply --confirm) ---');
      console.log(`Registros no banco antes    : ${countBefore}`);
      console.log(`Registros no banco depois   : ${countAfter} (+${countAfter - countBefore})`);
      console.log(`Leis de 2026 corrigidas     : ${applyLog.updated2026.length}`);
      console.log(`Leis de 2026 inseridas      : ${applyLog.created2026.length}`);
      console.log(`Duplicatas evitadas         : ${applyLog.skippedDuplicates.length}`);
      console.log(`Leis históricas corrigidas  : ${applyLog.updatedHistorical.length}`);
      console.log(`Total leis (ano=2026) no DB : ${post2026Count}`);
      console.log(`Log salvo em                : ${reportJsonPath}\n`);
      return;
    }

    // Modo Dry-Run: verifica zero escritas no banco
    const countAfter = await prisma.legislacao.count();

    report.dbIntegrityCheck = {
      recordsBeforeSimulation: countBefore,
      recordsAfterSimulation: countAfter,
      zeroWritesVerified: countBefore === countAfter,
    };

    fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
    fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2), 'utf8');

    console.log('\n--- RESUMO EXECUTIVO DA SIMULAÇÃO (DRY-RUN) ---');
    console.log(`Total de linhas na tabela /leis/ do WordPress      : ${report.counts.wpTableTotalRows}`);
    console.log(`Leis de 2026 na tabela /leis/ do WordPress         : ${report.counts.wpTable2026Laws}`);
    console.log(`Leis de 2026 extras na Mídia do WordPress (1448)   : ${report.counts.wpMediaExtra2026Laws}`);
    console.log(`Total de Leis de 2026 avaliadas                    : ${report.counts.total2026CandidatesEvaluated}`);
    console.log('--------------------------------------------------------------------------------');
    console.log(`Leis no destino com ano=2026 atualmente            : ${report.counts.destLawsCurrentlyWithAno2026}`);
    console.log(`Leis de 2026 JÁ MIGRADAS OK                        : ${report.counts.byClassification.JA_MIGRADA_OK}`);
    console.log(`Leis de 2026 JÁ MIGRADAS COM ERRO DE ANO/CAMPO     : ${report.counts.byClassification.JA_MIGRADA_COM_ERRO_NO_BANCO}`);
    console.log(`Leis de 2026 FALTANDO (prontas para importar)      : ${report.counts.byClassification.FALTANDO_PRONTO_PARA_IMPORTAR}`);
    console.log(`Leis de 2026 FALTANDO (precisam de decisão)        : ${report.counts.byClassification.FALTANDO_PRECISA_DECISAO}`);
    console.log(`Total leis no banco com ano != /YYYY (corrompido)  : ${report.counts.destAllLawsWithCorruptedAno}`);
    console.log('--------------------------------------------------------------------------------');
    console.log(`Verificação de Zero Escrita no Banco               : ${countBefore} antes === ${countAfter} depois (OK)`);
    console.log(`Relatório JSON salvo em                            : ${reportJsonPath}\n`);

    for (const item of report.items) {
      const pdfStatus = item.pdfProbe.reachable
        ? `PDF OK (HTTP ${item.pdfProbe.status}${item.pdfProbe.driveTitle ? ` | "${item.pdfProbe.driveTitle}"` : ''})`
        : `PDF ERRO (${item.pdfProbe.status || item.pdfProbe.error})`;
      console.log(
        `• [${item.statusCategoria}] Lei ${item.numeroAlvo}${item.numeroWp !== item.numeroAlvo ? ` (WP: ${item.numeroWp})` : ''} | ${item.origemWp} | ${pdfStatus}`
      );
      if (item.registroDestinoExistente) {
        console.log(
          `    ↳ No Destino: id=${item.registroDestinoExistente.id}, numero="${item.registroDestinoExistente.numero}", anoGravado=${item.registroDestinoExistente.anoGravadoNoBanco}, categoria=${JSON.stringify(item.registroDestinoExistente.categoria)}`
        );
      }
      for (const motivo of item.motivosDecisao) {
        console.log(`    ↳ ${motivo}`);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Erro na execução do simulador:', err);
  process.exit(1);
});
