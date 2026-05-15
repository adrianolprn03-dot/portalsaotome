import { prisma } from "../src/lib/prisma";

async function check() {
    const count = await prisma.unidadeAtendimento.count();
    const unidades = await prisma.unidadeAtendimento.findMany({ take: 5 });
    console.log(`Total unidades: ${count}`);
    console.log(JSON.stringify(unidades, null, 2));
}

check();
