const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Buscar todos os links externos
    const links = await prisma.linkExterno.findMany();
    console.log("=== TODOS OS LINKS EXTERNOS ===");
    console.log(JSON.stringify(links, null, 2));
    
    // Buscar especificamente os links do módulo home
    const homeLinks = await prisma.linkExterno.findMany({
      where: { ativo: true, moduloAlvo: { startsWith: "home-" } },
    });
    console.log("\n=== LINKS HOME ATIVOS ===");
    console.log(JSON.stringify(homeLinks, null, 2));
  } catch (e) {
    console.error("Erro:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
