require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const configs = await prisma.configuracao.findMany();
    console.log("--- CONFIGURAÇÕES SÃO TOMÉ ---");
    configs.forEach(c => {
      console.log(`${c.chave}: ${c.valor ? c.valor.substring(0, 100) : null}`);
    });
  } catch (e) {
    console.error("Erro ao conectar no banco:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
