import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';
import slugify from 'slugify';
import { decode } from 'html-entities';

const prisma = new PrismaClient();
const API_URL = 'https://saotome.rn.gov.br/wp-json/wp/v2/posts';

async function fetchPosts(page: number) {
  const url = `${API_URL}?page=${page}&per_page=20&_embed=1`;
  const res = await fetch(url); // No headers
  if (!res.ok) {
    if (res.status === 400 || res.status === 404) return []; // end of pages
    throw new Error(`Failed to fetch API ${url}: ${res.statusText}`);
  }
  return res.json();
}

async function run() {
  console.log('Fetching secretarias...');
  const secretarias = await prisma.secretaria.findMany();
  
  let page = 1;
  let continueScraping = true;
  let articlesInserted = 0;

  while (continueScraping) {
    console.log(`Fetching API page ${page}...`);
    const posts = await fetchPosts(page);
    
    if (posts.length === 0) {
      console.log('No more posts.');
      break;
    }

    for (const post of posts) {
      const publishedAt = new Date(post.date);
      const year = publishedAt.getFullYear();
      
      if (year < 2025) {
        console.log(`Post from ${year}. Stopping as we only want 2025+.`);
        continueScraping = false;
        break;
      }

      if (year > 2025) continue;

      const rawTitle = decode(post.title.rendered);
      const title = rawTitle.replace(/<\/?[^>]+(>|$)/g, "").trim();
      
      console.log(`Processing: ${title}`);
      
      const content = post.content.rendered;
      const rawExcerpt = decode(post.excerpt.rendered);
      const excerpt = rawExcerpt.replace(/<\/?[^>]+(>|$)/g, "").trim().substring(0, 250);
      
      let imagem = null;
      if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
          imagem = post._embedded['wp:featuredmedia'][0].source_url;
      }

      let categories: string[] = [];
      if (post._embedded && post._embedded['wp:term']) {
          const terms = post._embedded['wp:term'][0] || [];
          categories = terms.map((t: any) => decode(t.name));
      }

      const slug = slugify(title, { lower: true, strict: true }).substring(0, 100) + '-' + post.id;

      let secretariaId: string | null = null;
      for (const cat of categories) {
         const matched = secretarias.find(s => s.nome.toLowerCase().includes(cat.toLowerCase()) || s.slug.includes(slugify(cat, {lower: true})));
         if (matched) {
             secretariaId = matched.id;
             break;
         }
      }

      // Check if already exists to avoid duplicates during retries
      const existing = await prisma.noticia.findUnique({ where: { slug } });
      if (!existing) {
          try {
            await prisma.noticia.create({
                data: {
                titulo: title,
                slug: slug,
                resumo: excerpt || title,
                conteudo: content,
                imagem: imagem,
                publicada: true,
                publicadoEm: publishedAt,
                secretariaId: secretariaId,
                tags: JSON.stringify(categories)
                }
            });
            articlesInserted++;
          } catch (e) {
              console.error(`Error inserting ${title}:`, e);
          }
      } else {
          console.log('Already exists, skipping.');
      }
    }
    
    page++;
  }

  console.log(`Finished inserting ${articlesInserted} news articles from 2025.`);
}

run()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
