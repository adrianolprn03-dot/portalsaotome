import { prisma } from "@/lib/prisma";
import SecretariasCarousel from "./SecretariasCarousel";

export default async function SecretariasSlider() {
    let secretarias: any[] = [];
    try {
        secretarias = await prisma.secretaria.findMany({
            orderBy: { nome: 'asc' },
            select: {
                id: true,
                nome: true,
                slug: true,
                descricao: true,
                secretario: true
            }
        });
    } catch (e) {
        console.error("Erro ao carregar secretarias no SecretariasSlider:", e);
    }

    if (secretarias.length === 0) return null;

    return <SecretariasCarousel secretarias={secretarias} />;
}
