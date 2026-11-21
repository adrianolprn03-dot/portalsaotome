export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonNoStore } from "@/lib/revalidate-site";
import { isValidPublicUrl, sanitizeDiarioOficialUrl } from "@/lib/portal-links";

const db = prisma as any;

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const categoria = searchParams.get("categoria");

        const rawLinks = await db.linkExterno.findMany({
            where: {
                ativo: true,
                ...(categoria ? { categoria } : {}),
            },
            orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
        });

        const validLinks = (Array.isArray(rawLinks) ? rawLinks : [])
            .filter((l: any) => isValidPublicUrl(l?.url))
            .map((l: any) => ({
                ...l,
                url: sanitizeDiarioOficialUrl(l.url),
            }));

        return NextResponse.json(validLinks, {
            headers: {
                "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=300",
            },
        });
    } catch (err) {
        console.error("Erro ao buscar links externos:", err);
        return jsonNoStore({ error: "Erro ao buscar links" }, { status: 500 });
    }
}
