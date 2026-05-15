import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const result = await prisma.noticia.deleteMany({
      where: {
          publicadoEm: {
              gte: new Date('2026-01-01')
          }
      }
  });

  console.log(`Deleted ${result.count} fake news articles from 2026.`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
