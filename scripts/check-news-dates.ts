import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const noticias = await prisma.noticia.findMany({ orderBy: { publicadoEm: 'desc' }, take: 10 });
  console.log(noticias.map(n => ({ t: n.titulo, p: n.publicadoEm })));
}

run().finally(() => prisma.$disconnect());
