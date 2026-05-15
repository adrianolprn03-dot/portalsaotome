import * as cheerio from 'cheerio';

async function run() {
  try {
    const response = await fetch('https://saotome.rn.gov.br/noticias/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) {
        console.error('Failed to fetch:', response.status, response.statusText);
        // Try the main page
        const mainRes = await fetch('https://saotome.rn.gov.br/', {
            headers: {
              'User-Agent': 'Mozilla/5.0'
            }
        });
        const mainHtml = await mainRes.text();
        const $ = cheerio.load(mainHtml);
        const links: string[] = [];
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.includes('noticia')) {
                links.push(href);
            }
        });
        console.log('Links containing "noticia" on main page:', Array.from(new Set(links)));
        return;
    }

    const html = await response.text();
    console.log('Fetched successfully. HTML length:', html.length);
    const $ = cheerio.load(html);
    
    const articles: Array<{title: string, link: string, date: string}> = [];
    $('article, .post, .item, a').each((i, el) => {
      const title = $(el).find('h1, h2, h3, .title').text().trim();
      const link = $(el).find('a').attr('href') || $(el).attr('href');
      const date = $(el).find('.date, time, .posted-on').text().trim();
      
      if (title && link && typeof link === 'string') {
        articles.push({ title, link, date });
      }
    });
    
    console.log('Found elements:', articles.slice(0, 10));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
