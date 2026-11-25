import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { codigo: string } }) {
    const cod = params.codigo;
    if (!/^[A-F0-9]{8}$/.test(cod)) return new Response(null, { status: 404 });
    const session = await getServerSession(authOptions);
    const doc = await prisma.legislacaoFemurn.findFirst({
        where: { codigo: cod, ...(session ? {} : { legislacao: { ativo: true } }) },
        select: { pdf: true },
    });
    if (!doc) return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
    return new Response(new Uint8Array(doc.pdf), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'inline; filename="FEMURN-' + cod + '.pdf"',
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "no-store",
        },
    });
}
