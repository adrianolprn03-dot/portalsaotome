const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const list = await prisma.legislacao.findMany();
    console.log("Total records:", list.length);
    
    const otherPaths = list.filter(item => !item.arquivo || !item.arquivo.includes('/uploads/legislacao/'));
    console.log("Records not pointing to /uploads/legislacao/:", otherPaths.length);
    if (otherPaths.length > 0) {
      console.log("Samples:", otherPaths.slice(0, 10));
    }
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
