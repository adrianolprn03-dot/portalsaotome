import { prisma } from "../src/lib/prisma";

async function check() {
    const count = await prisma.secretaria.count();
    const secretarias = await prisma.secretaria.findMany({ take: 2 });
    console.log(`Total secretarias: ${count}`);
    console.log(JSON.stringify(secretarias, null, 2));
}

check();
