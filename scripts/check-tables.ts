import * as cheerio from 'cheerio';

async function get(path: string) {
  try {
    const res = await fetch('https://saotome.rn.gov.br/' + path);
    const html = await res.text();
    const $ = cheerio.load(html);
    const table = $('table.tablepress');
    console.log(`Path: /${path} - Table found: ${table.length > 0}`);
    if (table.length > 0) {
      const headers = [];
      table.find('th').each((i, el) => { headers.push($(el).text().trim()); });
      console.log(`  Headers: ${headers.join(', ')}`);
      console.log(`  Rows: ${table.find('tbody tr').length}`);
    }
  } catch (e) {
    console.error(`Error fetching ${path}`);
  }
}

async function run() {
  await get('decretos');
  await get('leis');
  await get('portarias');
  await get('editais');
}

run();
