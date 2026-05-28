const { PrismaClient } = require('@prisma/client');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const slugify = require('slugify');

const prisma = new PrismaClient();
const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'migracao');

// Ensure upload dir exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

async function downloadFile(url, prefix) {
  if (!url) return null;
  // If it's a google drive link or not a direct file, just return the url
  if (url.includes('drive.google.com') || (!url.toLowerCase().endsWith('.pdf') && !url.toLowerCase().endsWith('.doc') && !url.toLowerCase().endsWith('.docx'))) {
    return url;
  }
  
  try {
    const res = await fetch(url);
    if (!res.ok) return url;
    
    const buffer = await res.arrayBuffer();
    const ext = path.extname(url).split('?')[0] || '.pdf';
    const hash = crypto.randomBytes(4).toString('hex');
    const filename = `${prefix}_${hash}${ext}`;
    const localPath = path.join(UPLOAD_DIR, filename);
    
    fs.writeFileSync(localPath, Buffer.from(buffer));
    return `/uploads/migracao/${filename}`;
  } catch (err) {
    console.error(`Failed to download ${url}:`, err.message);
    return url;
  }
}

function parseAno(str) {
  const match = str.match(/\d{4}/);
  return match ? parseInt(match[0]) : new Date().getFullYear();
}

async function scrapeLeis() {
  console.log('Scraping Leis...');
  const url = 'https://saotome.rn.gov.br/leis/';
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const rows = [];
  $('table').first().find('tr').each((i, el) => {
    if (i === 0) return; // skip header
    const cols = $(el).find('td');
    if (cols.length >= 3) {
      const numero = $(cols[0]).text().trim();
      const ementa = $(cols[1]).text().trim();
      const link = $(cols[2]).find('a').attr('href');
      if (numero && ementa) {
        rows.push({ numero, ementa, link });
      }
    }
  });

  for (const row of rows) {
    const arquivoPath = await downloadFile(row.link, 'lei');
    const ano = parseAno(row.numero) || parseAno(row.ementa);
    
    await prisma.legislacao.create({
      data: {
        tipo: 'Lei',
        numero: row.numero,
        ano: ano,
        ementa: row.ementa,
        arquivo: arquivoPath,
        documentUrl: row.link?.includes('drive.google.com') ? row.link : null,
      }
    });
  }
  console.log(`Inserted ${rows.length} Leis.`);
}

async function scrapePortarias() {
  console.log('Scraping Portarias...');
  const url = 'https://saotome.rn.gov.br/portarias/';
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const rows = [];
  $('table').first().find('tr').each((i, el) => {
    if (i === 0) return; // skip header
    const cols = $(el).find('td');
    if (cols.length >= 3) {
      const numero = $(cols[0]).text().trim();
      const ementa = $(cols[1]).text().trim();
      const link = $(cols[2]).find('a').attr('href');
      if (numero && ementa) {
        rows.push({ numero, ementa, link });
      }
    }
  });

  for (const row of rows) {
    const arquivoPath = await downloadFile(row.link, 'portaria');
    const ano = parseAno(row.numero) || parseAno(row.ementa);
    
    await prisma.legislacao.create({
      data: {
        tipo: 'Portaria',
        numero: row.numero,
        ano: ano,
        ementa: row.ementa,
        arquivo: arquivoPath,
        documentUrl: row.link?.includes('drive.google.com') ? row.link : null,
      }
    });
  }
  console.log(`Inserted ${rows.length} Portarias.`);
}

async function scrapeConcursos() {
  console.log('Scraping Concurso Público...');
  const url = 'https://saotome.rn.gov.br/concurso-publico/';
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const links = [];
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();
    if (href && (href.toLowerCase().includes('.pdf') || text.toLowerCase().includes('edital') || text.toLowerCase().includes('concurso'))) {
      if (text.length > 5) { // reasonable length for title
        links.push({ href, text });
      }
    }
  });

  // Since it's a list of links, we will just create one Concurso entry for each link or a general one.
  // Actually, let's create a Concurso entry for each document just to store them.
  for (let i = 0; i < links.length; i++) {
    const item = links[i];
    const arquivoPath = await downloadFile(item.href, 'concurso');
    const slugBase = slugify(item.text, { lower: true, strict: true }) || `concurso-${i}`;
    let slug = slugBase;
    let count = 1;
    while (await prisma.concurso.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${count++}`;
    }

    await prisma.concurso.create({
      data: {
        titulo: item.text,
        slug: slug,
        tipo: 'Concurso',
        linkEdital: arquivoPath,
      }
    });
  }
  console.log(`Inserted ${links.length} arquivos de Concurso.`);
}

async function scrapeRelatoriosFiscais() {
  console.log('Scraping Relatórios Fiscais...');
  const url = 'https://saotome.rn.gov.br/lei-de-responsabilidade-fiscal/';
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const tables = [];
  $('table').each((i, table) => {
    const rows = [];
    $(table).find('tr').each((j, tr) => {
      if (j === 0) return; // skip header
      const cols = $(tr).find('td');
      if (cols.length >= 4) {
        const descricao = $(cols[0]).text().trim();
        const vigencia = $(cols[1]).text().trim();
        const anoText = $(cols[2]).text().trim();
        const link = $(cols[3]).find('a').attr('href');
        
        let tipo = 'Relatório';
        if (descricao.toLowerCase().includes('ppa')) tipo = 'PPA';
        else if (descricao.toLowerCase().includes('diretrizes')) tipo = 'LDO';
        else if (descricao.toLowerCase().includes('orçamentária an')) tipo = 'LOA';
        else if (descricao.toLowerCase().includes('gestão fiscal')) tipo = 'RGF';
        else if (descricao.toLowerCase().includes('execução orça')) tipo = 'RREO';
        else if (descricao.toLowerCase().includes('balanço')) tipo = 'Balanço Patrimonial';

        rows.push({
          titulo: descricao,
          tipo: tipo,
          periodo: vigencia,
          ano: parseInt(anoText) || new Date().getFullYear(),
          link: link
        });
      }
    });
    tables.push(...rows);
  });

  for (const row of tables) {
    const arquivoPath = await downloadFile(row.link, 'relatorio') || row.link || '#';
    
    await prisma.relatorioFiscal.create({
      data: {
        titulo: row.titulo,
        tipo: row.tipo,
        periodo: row.periodo,
        ano: row.ano,
        arquivo: arquivoPath,
      }
    });
  }
  console.log(`Inserted ${tables.length} Relatórios Fiscais.`);
}

async function run() {
  try {
    await scrapeLeis();
    await scrapePortarias();
    await scrapeConcursos();
    await scrapeRelatoriosFiscais();
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
