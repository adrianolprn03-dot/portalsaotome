import { prisma } from "../src/lib/prisma";

async function check() {
    const configs = await prisma.configuracao.findMany();
    console.log(JSON.stringify(configs, null, 2));
}

check();
