export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { searchPortal, SearchResultCategory } from "@/lib/search-engine";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const categoria = (searchParams.get("categoria") || "todos") as SearchResultCategory | "todos";
    const limit = Math.min(parseInt(searchParams.get("limit") || "40", 10) || 40, 100);

    try {
        const payload = await searchPortal(q, { limit, categoria });
        return NextResponse.json(payload, {
            headers: {
                "Cache-Control": "public, max-age=15, s-maxage=60, stale-while-revalidate=120",
            },
        });
    } catch (error) {
        console.error("Erro na busca geral do portal:", error);
        return NextResponse.json(
            { query: q, total: 0, results: [], externalAccesses: [], error: "Erro ao processar a busca." },
            { status: 500 }
        );
    }
}
