import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { put, list } from "@vercel/blob";
import sharp from "sharp";

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run") || !args.has("--apply");
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

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
if (!BLOB_TOKEN) {
  console.error("ERRO: BLOB_READ_WRITE_TOKEN não encontrado no ambiente.");
  process.exit(1);
}

const prisma = new PrismaClient();
const WP_BASE = "https://saotome.rn.gov.br";
const MAX_NEW_BLOB_BYTES = 850 * 1024 * 1024; // 850 MB safety cap

function sanitizeStr(str) {
  const s = String(str ?? "").replace(/\u0000/g, "");
  return s.replace(
    /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g,
    ""
  );
}

function decodeHtml(str = "") {
  return sanitizeStr(
    String(str)
      .replace(/&#8211;|&ndash;/g, "–")
      .replace(/&#8212;|&mdash;/g, "—")
      .replace(/&#8216;|&lsquo;/g, "‘")
      .replace(/&#8217;|&rsquo;/g, "’")
      .replace(/&#8220;|&ldquo;/g, "“")
      .replace(/&#8221;|&rdquo;/g, "”")
      .replace(/&#8230;|&hellip;/g, "...")
      .replace(/&#038;|&amp;/g, "&")
      .replace(/&nbsp;|&#160;/g, " ")
      .replace(/&quot;/g, '"')
      .replace(/&#039;|&apos;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#(\d+);/g, (_, code) => {
        const n = Number(code);
        return Number.isFinite(n) && n > 0 ? String.fromCodePoint(n) : "";
      })
  );
}

function stripHtml(html = "") {
  return sanitizeStr(
    decodeHtml(html)
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function normalizeTitle(str = "") {
  return stripHtml(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugify(str = "") {
  return stripHtml(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

async function fetchJsonRetry(url, retries = 4) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; PortalSaoTomeMigrator/1.0)",
        },
      });
      if (res.status === 400) return { data: [], totalPages: 0 };
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      const totalPages = Number(res.headers.get("x-wp-totalpages") || "1");
      const data = await res.json();
      return { data, totalPages };
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw lastErr;
}

async function fetchBufferRetry(url, retries = 3) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      const encodedUrl = encodeURI(decodeURI(url));
      const res = await fetch(encodedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; PortalSaoTomeMigrator/1.0)",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      const ab = await res.arrayBuffer();
      return Buffer.from(ab);
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 700 * (i + 1)));
    }
  }
  throw lastErr;
}

function extractImageUrlsFromHtml(html = "") {
  const urls = new Set();
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let m;
  while ((m = imgRegex.exec(html)) !== null) {
    const u = m[1].trim();
    if (u.includes("saotome.rn.gov.br/wp-content/uploads/")) {
      urls.add(u);
    }
  }
  return [...urls];
}

function sanitizeWpElementorHtml(html = "") {
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\sdata-elementor-[a-z-]+=["'][^"']*["']/gi, "")
    .replace(/\sdata-id=["'][^"']*["']/gi, "")
    .replace(/\sdata-element_type=["'][^"']*["']/gi, "")
    .replace(/\sdata-widget_type=["'][^"']*["']/gi, "")
    .replace(/\sdata-settings=["'][^"']*["']/gi, "")
    .replace(/\ssrcset=["'][^"']*["']/gi, "")
    .replace(/\ssizes=["'][^"']*["']/gi, "");
  return sanitizeStr(cleaned.trim());
}

function mapCategory(catNames = [], title = "") {
  const joined = `${catNames.join(" ")} ${title}`.toLowerCase();
  if (joined.includes("saúde") || joined.includes("saude") || joined.includes("vacina")) return "Saúde";
  if (joined.includes("educa") || joined.includes("escola") || joined.includes("creche")) return "Educação";
  if (joined.includes("obra") || joined.includes("infraestrutura") || joined.includes("pavimenta")) return "Infraestrutura";
  if (joined.includes("cultura") || joined.includes("festa") || joined.includes("turismo")) return "Cultura";
  if (joined.includes("esporte") || joined.includes("campeonato") || joined.includes("futebol")) return "Esporte";
  if (joined.includes("assistência") || joined.includes("assistencia") || joined.includes("social") || joined.includes("cras")) return "Assistência Social";
  if (joined.includes("agricultura") || joined.includes("rural")) return "Agricultura";
  return "Institucional";
}

function buildBlobPathForImage(wpUrl, year) {
  let pathname = "image";
  try {
    const u = new URL(wpUrl);
    pathname = decodeURIComponent(u.pathname);
  } catch {
    pathname = wpUrl;
  }
  const base = path.basename(pathname).replace(/\.[a-zA-Z0-9]+$/, "");
  const safeBase = slugify(base) || "imagem";
  let hash = 0;
  for (let i = 0; i < wpUrl.length; i++) {
    hash = (hash * 31 + wpUrl.charCodeAt(i)) >>> 0;
  }
  return `noticias/${year}/${safeBase}-${hash.toString(16)}.webp`;
}

async function main() {
  console.log(`\n=== TRANSFERÊNCIA DE NOTÍCIAS WP -> NEON + VERCEL BLOB (${DRY_RUN ? "DRY_RUN" : "APPLY"}) ===\n`);

  const scratchDir = path.join(rootDir, "scratch");
  fs.mkdirSync(scratchDir, { recursive: true });
  const cachePath = path.join(scratchDir, "blob-url-map.json");
  let urlCache = {};
  if (fs.existsSync(cachePath)) {
    try {
      urlCache = JSON.parse(fs.readFileSync(cachePath, "utf8"));
    } catch {
      urlCache = {};
    }
  }

  const existingBlobsByPath = new Map();
  let cursor;
  do {
    const page = await list({ token: BLOB_TOKEN, cursor, limit: 1000 });
    for (const b of page.blobs) {
      existingBlobsByPath.set(b.pathname, b.url);
    }
    cursor = page.cursor;
  } while (cursor);

  const catRes = await fetchJsonRetry(`${WP_BASE}/wp-json/wp/v2/categories?per_page=100`);
  const catMap = new Map();
  for (const c of catRes.data) {
    catMap.set(c.id, decodeHtml(c.name));
  }

  const allPosts = [];
  const firstPage = await fetchJsonRetry(`${WP_BASE}/wp-json/wp/v2/posts?per_page=100&page=1&_embed=1`);
  allPosts.push(...firstPage.data);
  for (let p = 2; p <= firstPage.totalPages; p++) {
    const res = await fetchJsonRetry(`${WP_BASE}/wp-json/wp/v2/posts?per_page=100&page=${p}&_embed=1`);
    allPosts.push(...res.data);
  }

  const dbNoticias = await prisma.noticia.findMany({
    select: {
      id: true,
      titulo: true,
      slug: true,
      imagem: true,
      conteudo: true,
      publicadoEm: true,
      criadoEm: true,
    },
  });

  const existingSlugs = new Set(dbNoticias.map((n) => n.slug.toLowerCase()));
  const existingTitles = new Set(dbNoticias.map((n) => normalizeTitle(n.titulo)));

  const newPosts = [];
  const existingToUpdateImages = [];

  for (const p of allPosts) {
    const titulo = stripHtml(p.title?.rendered || "");
    const rawSlug = sanitizeStr((p.slug || slugify(titulo)).toLowerCase());
    const normTitle = normalizeTitle(titulo);
    const rawContent = p.content?.rendered || "";
    const rawExcerpt = stripHtml(p.excerpt?.rendered || "");
    const resumo = sanitizeStr(
      Array.from(rawExcerpt || stripHtml(rawContent))
        .slice(0, 250)
        .join("")
    );
    const date = p.date ? new Date(p.date) : new Date();
    const year = date.getUTCFullYear() || 2025;
    const catNames = (p.categories || []).map((cid) => catMap.get(cid) || "");
    const categoria = sanitizeStr(mapCategory(catNames, titulo));

    let featuredUrl = null;
    const featuredMedia = p._embedded?.["wp:featuredmedia"]?.[0];
    if (featuredMedia?.source_url) {
      featuredUrl = featuredMedia.source_url;
    } else if (p.jetpack_featured_media_url) {
      featuredUrl = p.jetpack_featured_media_url;
    }
    const inlineImgs = extractImageUrlsFromHtml(rawContent);
    if (!featuredUrl && inlineImgs.length > 0) {
      featuredUrl = inlineImgs[0];
    }

    if (existingSlugs.has(rawSlug) || existingTitles.has(normTitle)) {
      const match = dbNoticias.find(
        (n) => n.slug.toLowerCase() === rawSlug || normalizeTitle(n.titulo) === normTitle
      );
      if (
        match &&
        ((match.imagem && match.imagem.includes("saotome.rn.gov.br/wp-content/uploads/")) ||
          (match.conteudo && match.conteudo.includes("saotome.rn.gov.br/wp-content/uploads/")))
      ) {
        existingToUpdateImages.push({ match, year });
      }
      continue;
    }

    newPosts.push({
      wpId: p.id,
      titulo,
      slug: rawSlug,
      resumo,
      rawContent,
      date,
      year,
      categoria,
      featuredUrl,
      inlineImgs,
    });
  }

  const allImageTasks = new Map();
  for (const item of newPosts) {
    if (item.featuredUrl && item.featuredUrl.includes("saotome.rn.gov.br/wp-content/uploads/")) {
      allImageTasks.set(item.featuredUrl, item.year);
    }
    for (const u of item.inlineImgs) {
      if (!allImageTasks.has(u)) allImageTasks.set(u, item.year);
    }
  }
  for (const { match, year } of existingToUpdateImages) {
    if (match.imagem && match.imagem.includes("saotome.rn.gov.br/wp-content/uploads/")) {
      allImageTasks.set(match.imagem, year);
    }
    for (const u of extractImageUrlsFromHtml(match.conteudo)) {
      if (!allImageTasks.has(u)) allImageTasks.set(u, year);
    }
  }

  console.log(
    `WP Posts=${allPosts.length} | DB antes=${dbNoticias.length} | Novas=${newPosts.length} | Existentes com img WP=${existingToUpdateImages.length} | Imagens únicas=${allImageTasks.size}`
  );

  let uploadedBytes = 0;
  let imagesUploaded = 0;
  let imagesReused = 0;
  let imagesFailed = 0;
  let quotaError = null;

  if (APPLY) {
    const entries = [...allImageTasks.entries()];
    const CONCURRENCY = 6;
    for (let i = 0; i < entries.length; i += CONCURRENCY) {
      if (quotaError || uploadedBytes >= MAX_NEW_BLOB_BYTES) break;
      const chunk = entries.slice(i, i + CONCURRENCY);
      await Promise.all(
        chunk.map(async ([wpUrl, year]) => {
          if (urlCache[wpUrl]) {
            imagesReused++;
            return;
          }
          const blobPath = buildBlobPathForImage(wpUrl, year);
          if (existingBlobsByPath.has(blobPath)) {
            urlCache[wpUrl] = existingBlobsByPath.get(blobPath);
            imagesReused++;
            return;
          }
          try {
            const buf = await fetchBufferRetry(wpUrl);
            const webpBuf = await sharp(buf)
              .rotate()
              .resize({ width: 1200, withoutEnlargement: true })
              .webp({ quality: 80 })
              .toBuffer();

            const res = await put(blobPath, webpBuf, {
              access: "public",
              token: BLOB_TOKEN,
              contentType: "image/webp",
              addRandomSuffix: false,
            });
            urlCache[wpUrl] = res.url;
            existingBlobsByPath.set(blobPath, res.url);
            uploadedBytes += webpBuf.length;
            imagesUploaded++;
          } catch (err) {
            const msg = String(err?.message || err);
            if (msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("limit") || msg.includes("413") || msg.includes("402")) {
              quotaError = msg;
            }
            imagesFailed++;
          }
        })
      );
      if ((i + CONCURRENCY) % 80 === 0 || i + CONCURRENCY >= entries.length) {
        fs.writeFileSync(cachePath, JSON.stringify(urlCache, null, 2), "utf8");
        console.log(
          `  Progresso imagens: ${Math.min(i + CONCURRENCY, entries.length)}/${entries.length} (novos=${imagesUploaded}, reusados=${imagesReused}, MB=${(uploadedBytes / (1024 * 1024)).toFixed(2)})`
        );
      }
    }
    fs.writeFileSync(cachePath, JSON.stringify(urlCache, null, 2), "utf8");
  }

  let noticiasCreated = 0;
  let noticiasFailed = 0;
  let noticiasUpdatedImages = 0;

  if (APPLY) {
    for (const item of newPosts) {
      let slug = sanitizeStr(item.slug || `noticia-${item.wpId}`);
      if (existingSlugs.has(slug)) {
        slug = `${slug}-${item.wpId}`;
      }
      if (existingSlugs.has(slug)) continue;

      let conteudoLimpo = sanitizeWpElementorHtml(item.rawContent);
      for (const u of item.inlineImgs) {
        if (urlCache[u]) {
          conteudoLimpo = conteudoLimpo.split(u).join(urlCache[u]);
        }
      }

      const finalFeat =
        (item.featuredUrl && urlCache[item.featuredUrl]) ||
        item.featuredUrl ||
        (item.inlineImgs[0] && urlCache[item.inlineImgs[0]]) ||
        item.inlineImgs[0] ||
        null;

      try {
        await prisma.noticia.create({
          data: {
            titulo: sanitizeStr(item.titulo),
            slug: sanitizeStr(slug),
            resumo: sanitizeStr(item.resumo || item.titulo),
            conteudo: sanitizeStr(conteudoLimpo),
            imagem: finalFeat ? sanitizeStr(finalFeat) : null,
            destaque: false,
            publicada: true,
            publicadoEm: item.date,
            criadoEm: item.date,
          },
        });
        existingSlugs.add(slug);
        noticiasCreated++;
      } catch (err) {
        noticiasFailed++;
        console.warn(`  [AVISO] Falha ao criar notícia wpId=${item.wpId} (${slug}): ${err?.message || err}`);
      }
    }

    for (const { match } of existingToUpdateImages) {
      let newImg = match.imagem;
      if (newImg && urlCache[newImg]) newImg = urlCache[newImg];
      let newContent = match.conteudo || "";
      for (const u of extractImageUrlsFromHtml(newContent)) {
        if (urlCache[u]) {
          newContent = newContent.split(u).join(urlCache[u]);
        }
      }
      if (newImg !== match.imagem || newContent !== match.conteudo) {
        await prisma.noticia.update({
          where: { id: match.id },
          data: {
            imagem: sanitizeStr(newImg),
            conteudo: sanitizeStr(newContent),
          },
        });
        noticiasUpdatedImages++;
      }
    }
  }

  const summary = {
    mode: DRY_RUN ? "DRY_RUN" : "APPLY",
    timestamp: new Date().toISOString(),
    wpTotalPosts: allPosts.length,
    dbBefore: dbNoticias.length,
    newPostsCount: newPosts.length,
    noticiasCreated,
    noticiasFailed,
    noticiasUpdatedImages,
    uniqueImagesFound: allImageTasks.size,
    imagesUploaded,
    imagesReused,
    uploadedMB: Number((uploadedBytes / (1024 * 1024)).toFixed(2)),
    imagesFailed,
    quotaError,
  };

  const reportPath = path.join(scratchDir, "relatorio-transferencia-noticias.json");
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2), "utf8");
  console.log(`\nResumo Notícias:`, JSON.stringify(summary, null, 2));
  console.log(`Relatório salvo em: ${reportPath}\n`);
}

main()
  .catch((err) => {
    console.error("Erro fatal em transferir-noticias-wp:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
