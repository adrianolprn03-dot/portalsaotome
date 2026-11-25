export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseNumeroAto(numStr?: string | null): number {
    if (!numStr) return 0;
    const m = String(numStr).match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
}

function compareLegislacaoDesc(a: any, b: any): number {
    if ((b.ano || 0) !== (a.ano || 0)) {
        return (b.ano || 0) - (a.ano || 0);
    }
    const numA = parseNumeroAto(a.numero);
    const numB = parseNumeroAto(b.numero);
    if (numA !== numB) {
        return numB - numA;
    }
    const dateA = a.dataAto ? new Date(a.dataAto).getTime() : 0;
    const dateB = b.dataAto ? new Date(b.dataAto).getTime() : 0;
    if (dateA !== dateB) {
        return dateB - dateA;
    }
    const updA = new Date(a.dataAtualizacaoEfetiva || a.atualizadoEm || a.criadoEm || 0).getTime();
    const updB = new Date(b.dataAtualizacaoEfetiva || b.atualizadoEm || b.criadoEm || 0).getTime();
    if (updA !== updB) {
        return updB - updA;
    }
    return String(b.numero || "").localeCompare(String(a.numero || ""), undefined, {
        numeric: true,
        sensitivity: "base",
    });
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo");
    const ano = searchParams.get("ano");
    const busca = searchParams.get("busca");
    const categoria = searchParams.get("categoria");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "20", 10)), 10000);
    const skip = (page - 1) * limit;

    const where: any = { ativo: true };
    if (tipo) {
        const rawList = tipo.includes(",") ? tipo.split(",").map((t) => t.trim()) : [tipo.trim()];
        const expandedTipos = new Set<string>();
        for (const t of rawList) {
            const lower = t.toLowerCase();
            expandedTipos.add(t);
            expandedTipos.add(lower);
            expandedTipos.add(t.toUpperCase());
            expandedTipos.add(t.charAt(0).toUpperCase() + lower.slice(1));

            if (lower === "resolucao" || lower === "resolução") {
                expandedTipos.add("resolucao");
                expandedTipos.add("RESOLUCAO");
                expandedTipos.add("resolução");
                expandedTipos.add("Resolução");
                expandedTipos.add("RESOLUÇÃO");
            }
            if (lower === "lei-organica" || lower === "lei organica" || lower === "lei orgânica") {
                expandedTipos.add("lei-organica");
                expandedTipos.add("LEI-ORGANICA");
                expandedTipos.add("lei organica");
                expandedTipos.add("lei orgânica");
                expandedTipos.add("Lei Orgânica");
                expandedTipos.add("LEI ORGÂNICA");
                expandedTipos.add("LEI ORGANICA");
            }
        }
        where.tipo = { in: Array.from(expandedTipos) };
    }
    if (categoria) where.categoria = categoria;
    if (ano) where.ano = parseInt(ano, 10);
    if (busca) {
        where.OR = [
            { numero: { contains: busca, mode: "insensitive" } },
            { ementa: { contains: busca, mode: "insensitive" } },
        ];
    }

    const allItems = await prisma.legislacao.findMany({
        where,
        include: { femurn: { select: { codigo: true, publicadoEm: true, edicao: true, orgao: true } } },
        orderBy: [{ ano: "desc" }, { dataAto: "desc" }, { criadoEm: "desc" }],
    });

    allItems.sort(compareLegislacaoDesc);
    const total = allItems.length;
    const items = allItems.slice(skip, skip + limit);

    return NextResponse.json(
        { items, total, page, limit },
        { headers: { "Cache-Control": "public, max-age=30, s-maxage=120, stale-while-revalidate=600" } }
    );
}
