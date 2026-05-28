const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    const list = await prisma.legislacao.findMany();
    console.log("Total records in DB:", list.length);
    
    let stats = {
      decreto: 0,
      portaria: 0,
      lei: 0,
      leiOrganica: 0,
      resolucao: 0,
      outros: 0
    };
    
    const updates = [];
    
    for (const item of list) {
      if (!item.arquivo) {
        stats.outros++;
        continue;
      }
      
      const relativePath = item.arquivo; // ex: /uploads/legislacao/1778819077809_open
      const fullPath = path.join(__dirname, 'public', relativePath);
      
      if (!fs.existsSync(fullPath)) {
        stats.outros++;
        continue;
      }
      
      // Read the file to find the title
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Look for og:title or title tag
      const titleMatch = content.match(/<meta property="og:title" content="([^"]+)"/) || 
                         content.match(/<title>([^<]+)<\/title>/);
                         
      if (titleMatch) {
        const title = titleMatch[1].toUpperCase();
        
        let newTipo = 'decreto'; // Default
        if (title.includes('PORTARIA')) {
          newTipo = 'portaria';
          stats.portaria++;
        } else if (title.includes('LEI ORGÂNICA') || title.includes('LEI ORGANICA')) {
          newTipo = 'lei-organica';
          stats.leiOrganica++;
        } else if (title.includes('LEI')) {
          newTipo = 'lei';
          stats.lei++;
        } else if (title.includes('DECRETO')) {
          newTipo = 'decreto';
          stats.decreto++;
        } else if (title.includes('RESOLUÇÃO') || title.includes('RESOLUCAO')) {
          newTipo = 'resolucao';
          stats.resolucao++;
        } else {
          newTipo = 'decreto'; // Fallback
          stats.decreto++;
        }
        
        updates.push({
          id: item.id,
          tipoAntigo: item.tipo,
          tipoNovo: newTipo,
          tituloOriginal: titleMatch[1]
        });
      } else {
        stats.outros++;
      }
    }
    
    console.log("Classification stats from file titles:");
    console.log(stats);
    
    console.log("\nSample of updates (first 20):");
    console.log(updates.slice(0, 20));
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
