import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const args = new Set(process.argv.slice(2));
const APPLY = args.has("--apply");
const CONFIRM = args.has("--confirm");

if (APPLY && !CONFIRM) {
  console.error("ERRO: Para executar com --apply é obrigatório informar também --confirm.");
  process.exit(1);
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

const rootDir = process.cwd();
loadEnvFile(path.join(rootDir, "scratch", ".env.paula-migrate"));
loadEnvFile(path.join(rootDir, ".env.local"));
loadEnvFile(path.join(rootDir, ".env.production"));
loadEnvFile(path.join(rootDir, ".env"));

const prisma = new PrismaClient();

function decodeHtml(str = "") {
  return String(str)
    .replace(/&#8211;|&ndash;/gi, "–")
    .replace(/&#8212;|&mdash;/gi, "—")
    .replace(/&#8216;|&lsquo;/gi, "‘")
    .replace(/&#8217;|&rsquo;/gi, "’")
    .replace(/&#8220;|&ldquo;/gi, "“")
    .replace(/&#8221;|&rdquo;/gi, "”")
    .replace(/&#8230;|&hellip;/gi, "...")
    .replace(/&#038;|&amp;/gi, "&")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const n = parseInt(hex, 16);
      return Number.isFinite(n) && n > 0 ? String.fromCodePoint(n) : "";
    })
    .replace(/&#(\d+);/g, (_, code) => {
      const n = Number(code);
      return Number.isFinite(n) && n > 0 ? String.fromCodePoint(n) : "";
    });
}

function stripHtml(str = "") {
  return decodeHtml(str)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(str = "") {
  return stripHtml(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function deriveFallbackTitle(resumo = "", conteudo = "") {
  const plain = stripHtml(resumo || conteudo);
  if (!plain) return "Comunicado Institucional";
  const firstSentence = plain.split(/(?<=[.!?])\s+/)[0] || plain;
  const chars = Array.from(firstSentence);
  if (chars.length <= 75) return firstSentence.trim();
  return `${chars.slice(0, 72).join("").trim()}...`;
}

function cleanSlug(rawSlug = "", fallbackTitle = "") {
  let s = String(rawSlug || "");
  try {
    s = decodeURIComponent(s);
  } catch {
    // ignore malformed %
  }
  s = decodeHtml(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!s) {
    s = normalizeText(fallbackTitle).replace(/\s+/g, "-").slice(0, 110) || "noticia";
  }
  return s;
}

function scoreNoticia(n) {
  let score = 0;
  const img = n.imagem || "";
  const content = n.conteudo || "";
  const title = (n.titulo || "").trim();
  const slug = n.slug || "";

  if (title.length > 0) score += 25;
  if (!/&#x?[0-9a-f]+;/i.test(title)) score += 30;
  if (!/%[0-9a-f]{2}/i.test(slug)) score += 20;
  if (img.includes(".public.blob.vercel-storage.com/")) score += 40;
  if (content.includes(".public.blob.vercel-storage.com/")) score += 30;
  if (content.includes("saotome.rn.gov.br/wp-content/uploads/")) score -= 25;
  score += Math.min(20, Math.floor(content.length / 200));

  return score;
}

async function main() {
  console.log(`\n=== DEDUPLICAÇÃO E HIGIENIZAÇÃO DE NOTÍCIAS (${APPLY ? "APPLY" : "DRY_RUN"}) ===\n`);

  const all = await prisma.noticia.findMany({
    orderBy: [{ publicadoEm: "desc" }, { criadoEm: "desc" }],
  });

  console.log(`Total de notícias no banco antes: ${all.length}`);

  const parent = new Map(all.map((n) => [n.id, n.id]));
  function find(x) {
    let r = parent.get(x);
    if (r !== x) {
      r = find(r);
      parent.set(x, r);
    }
    return r;
  }
  function union(a, b) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(rb, ra);
  }

  const byDayAndTitle = new Map();
  const byTitleAndResumo = new Map();
  const byExactTimestamp = new Map();
  const byDayAndBaseSlug = new Map();
  const byResumoPrefix = new Map();

  for (const n of all) {
    const nt = normalizeText(n.titulo);
    const nr = normalizeText(n.resumo || stripHtml(n.conteudo)).slice(0, 160);
    const day = new Date(n.publicadoEm).toISOString().slice(0, 10);
    const ts = new Date(n.publicadoEm).toISOString();
    const baseSlug = cleanSlug(n.slug, n.titulo).replace(/-\d{4,5}$/, "");

    // 1. Mesmo dia + mesmo título normalizado (não vazio)
    if (nt.length > 0) {
      const k1 = `${day}::${nt}`;
      if (byDayAndTitle.has(k1)) union(byDayAndTitle.get(k1), n.id);
      else byDayAndTitle.set(k1, n.id);
    }

    // 2. Mesmo título normalizado + mesmo resumo normalizado (>= 25 chars)
    if (nt.length > 0 && nr.length >= 25) {
      const k2 = `${nt}::${nr}`;
      if (byTitleAndResumo.has(k2)) union(byTitleAndResumo.get(k2), n.id);
      else byTitleAndResumo.set(k2, n.id);
    }

    // 3. Mesmo timestamp exato de publicação (quando é exatamente o mesmo post WP importado duas vezes)
    if (byExactTimestamp.has(ts)) {
      const prev = byExactTimestamp.get(ts);
      const prevNt = normalizeText(prev.titulo);
      const prevNr = normalizeText(prev.resumo || stripHtml(prev.conteudo)).slice(0, 80);
      if (
        prevNt === nt ||
        !prevNt ||
        !nt ||
        (prevNr.length >= 20 && prevNr === nr.slice(0, 80))
      ) {
        union(prev.id, n.id);
      }
    } else {
      byExactTimestamp.set(ts, n);
    }

    // 4. Mesmo dia + mesmo slug base (sem sufixo de WP ID)
    if (baseSlug.length >= 4) {
      const k4 = `${day}::${baseSlug}`;
      if (byDayAndBaseSlug.has(k4)) union(byDayAndBaseSlug.get(k4), n.id);
      else byDayAndBaseSlug.set(k4, n.id);
    }

    // 5. Mesmo resumo normalizado longo (>= 55 chars) no mesmo mês/ano
    if (nr.length >= 55) {
      const month = day.slice(0, 7);
      const k5 = `${month}::${nr.slice(0, 90)}`;
      if (byResumoPrefix.has(k5)) {
        const prev = byResumoPrefix.get(k5);
        const prevNt = normalizeText(prev.titulo);
        if (prevNt === nt || !prevNt || !nt) {
          union(prev.id, n.id);
        }
      } else {
        byResumoPrefix.set(k5, n);
      }
    }
  }

  const clusters = new Map();
  for (const n of all) {
    const root = find(n.id);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root).push(n);
  }

  const dupClusters = [...clusters.values()].filter((arr) => arr.length > 1);
  const toDeleteIds = [];
  const winnersToUpdate = [];

  for (const arr of dupClusters) {
    arr.sort((a, b) => scoreNoticia(b) - scoreNoticia(a));
    const winner = arr[0];
    const losers = arr.slice(1);

    let bestTitle = decodeHtml(winner.titulo).trim();
    let bestResumo = decodeHtml(winner.resumo).trim();
    let bestConteudo = decodeHtml(winner.conteudo);
    let bestImagem = winner.imagem;
    let bestSlug = cleanSlug(winner.slug, bestTitle);

    for (const l of losers) {
      const lTitle = decodeHtml(l.titulo).trim();
      const lResumo = decodeHtml(l.resumo).trim();
      const lConteudo = decodeHtml(l.conteudo);
      if (
        lConteudo.includes(".public.blob.vercel-storage.com/") &&
        !bestConteudo.includes(".public.blob.vercel-storage.com/")
      ) {
        bestConteudo = lConteudo;
      } else if (
        lConteudo.length > bestConteudo.length &&
        !lConteudo.includes("saotome.rn.gov.br/wp-content/uploads/")
      ) {
        bestConteudo = lConteudo;
      }
      if (!bestImagem && l.imagem) bestImagem = l.imagem;
      if ((!bestTitle || bestTitle.length < lTitle.length) && lTitle && !/&#/.test(lTitle)) {
        bestTitle = lTitle;
      }
      if (!bestResumo && lResumo) bestResumo = lResumo;
      toDeleteIds.push(l.id);
    }

    if (!bestTitle) {
      bestTitle = deriveFallbackTitle(bestResumo, bestConteudo);
    }

    winnersToUpdate.push({
      id: winner.id,
      oldSlug: winner.slug,
      oldTitle: winner.titulo,
      titulo: bestTitle,
      resumo: bestResumo || bestTitle,
      conteudo: bestConteudo,
      imagem: bestImagem,
      desiredSlug: bestSlug.replace(/-\d{4,5}$/, "") || bestSlug,
      deletedCount: losers.length,
      deletedSlugs: losers.map((l) => l.slug),
    });
  }

  console.log(`Clusters de duplicatas identificados: ${dupClusters.length}`);
  console.log(`Total de registros duplicados a excluir: ${toDeleteIds.length}`);
  console.log(`Total de notícias únicas que permanecerão: ${all.length - toDeleteIds.length}`);

  const deleteSet = new Set(toDeleteIds);
  const winnerMap = new Map(winnersToUpdate.map((w) => [w.id, w]));
  const usedSlugs = new Set();

  const hygieneUpdates = [];
  for (const n of all) {
    if (deleteSet.has(n.id)) continue;
    const w = winnerMap.get(n.id);
    let cleanTitle = w ? w.titulo : decodeHtml(n.titulo).trim();
    const cleanCont = w ? w.conteudo : decodeHtml(n.conteudo);
    let cleanRes = w ? w.resumo : decodeHtml(n.resumo).trim();
    if (!cleanTitle) {
      cleanTitle = deriveFallbackTitle(cleanRes, cleanCont);
    }
    if (!cleanRes) {
      cleanRes = cleanTitle;
    }

    const hasPercentSlug = /%[0-9a-f]{2}/i.test(n.slug);
    const rawTargetSlug = w
      ? w.desiredSlug
      : hasPercentSlug
      ? cleanSlug(n.slug, cleanTitle)
      : n.slug;

    let finalSlug = rawTargetSlug || cleanSlug(n.slug, cleanTitle);
    if (usedSlugs.has(finalSlug)) {
      finalSlug = `${finalSlug}-${n.id.slice(-5)}`;
    }
    usedSlugs.add(finalSlug);

    if (
      cleanTitle !== n.titulo ||
      cleanRes !== n.resumo ||
      cleanCont !== n.conteudo ||
      finalSlug !== n.slug ||
      (w && w.imagem !== n.imagem)
    ) {
      hygieneUpdates.push({
        id: n.id,
        titulo: cleanTitle,
        resumo: cleanRes,
        conteudo: cleanCont,
        slug: finalSlug,
        imagem: w ? w.imagem : n.imagem,
      });
    }
  }

  console.log(`Registros únicos que receberão limpeza de entidades HTML / título vazio / slug URL-encoded: ${hygieneUpdates.length}`);

  if (APPLY) {
    const BATCH = 50;
    let deleted = 0;
    for (let i = 0; i < toDeleteIds.length; i += BATCH) {
      const batch = toDeleteIds.slice(i, i + BATCH);
      const res = await prisma.noticia.deleteMany({
        where: { id: { in: batch } },
      });
      deleted += res.count;
    }
    console.log(`\nExcluídas ${deleted} notícias duplicadas com sucesso.`);

    let updated = 0;
    for (const u of hygieneUpdates) {
      try {
        await prisma.noticia.update({
          where: { id: u.id },
          data: {
            titulo: u.titulo,
            resumo: u.resumo,
            conteudo: u.conteudo,
            slug: u.slug,
            imagem: u.imagem,
          },
        });
        updated++;
      } catch {
        await prisma.noticia.update({
          where: { id: u.id },
          data: {
            titulo: u.titulo,
            resumo: u.resumo,
            conteudo: u.conteudo,
            imagem: u.imagem,
          },
        });
        updated++;
      }
    }
    console.log(`Higienizadas ${updated} notícias únicas com sucesso.`);

    const finalCount = await prisma.noticia.count();
    console.log(`Total final de notícias no banco: ${finalCount}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
