import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const noticias = await prisma.noticia.findMany({ take: 5, orderBy: { criadoEm: 'desc' } });
  console.log(noticias.map(n => ({ titulo: n.titulo, imagem: n.imagem })));
}

run().finally(() => prisma.$disconnect());
