export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireServerAuth } from "@/lib/rbac";
import { jsonNoStore, revalidatePaths, REVALIDATE_GROUPS } from "@/lib/revalidate-site";

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
    const auth = await requireServerAuth([
        "admin",
        "controladoria",
        "legislacao",
        "lrf_contas",
        "financas",
        "editor",
    ]);
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo");
    const ano = searchParams.get("ano");
    const q = searchParams.get("q")?.trim();
    const situacaoVigencia = searchParams.get("situacaoVigencia");
    const ativoParam = searchParams.get("ativo");
    const rascunhosFemurn = searchParams.get("rascunhosFemurn") === "true";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.LegislacaoWhereInput = {};
    if (tipo) where.tipo = tipo;
    if (ano && !Number.isNaN(parseInt(ano, 10))) where.ano = parseInt(ano, 10);
    if (situacaoVigencia) where.situacaoVigencia = situacaoVigencia;
    if (ativoParam === "true") where.ativo = true;
    if (ativoParam === "false") where.ativo = false;
    if (rascunhosFemurn) {
        where.ativo = false;
        where.femurn = { isNot: null };
    }

    if (q) {
        where.OR = [
            { numero: { contains: q, mode: "insensitive" } },
            { ementa: { contains: q, mode: "insensitive" } },
            { categoria: { contains: q, mode: "insensitive" } },
            { orgaoResponsavel: { contains: q, mode: "insensitive" } },
            { femurn: { is: { codigo: { contains: q, mode: "insensitive" } } } },
        ];
    }

    const allItems = await prisma.legislacao.findMany({
        where,
        include: { femurn: { select: { codigo: true } } },
        orderBy: rascunhosFemurn
            ? [{ criadoEm: "desc" }, { id: "desc" }]
            : [{ ano: "desc" }, { dataAto: "desc" }, { criadoEm: "desc" }],
    });

    if (!rascunhosFemurn) allItems.sort(compareLegislacaoDesc);
    const total = allItems.length;
    const items = allItems.slice(skip, skip + limit);

    return jsonNoStore({
        items,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
    });
}

export async function POST(request: NextRequest) {
    const auth = await requireServerAuth([
        "admin",
        "controladoria",
        "legislacao",
        "lrf_contas",
        "financas",
        "editor",
    ]);
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const { tipo, numero, ano, ementa, arquivo } = body;

    if (!tipo || !numero || !ano || !ementa) {
        return jsonNoStore(
            { error: "Campos obrigatórios: tipo, numero, ano, ementa" },
            { status: 400 }
        );
    }

    const item = await prisma.legislacao.create({
        data: {
            tipo: String(tipo).trim(),
            numero: String(numero).trim(),
            ano: parseInt(String(ano), 10),
            ementa: String(ementa).trim(),
            arquivo: arquivo || null,
            categoria: body.categoria ? String(body.categoria).trim() : null,
            dataAto: body.dataAto ? new Date(body.dataAto) : null,
            documentUrl: body.documentUrl || arquivo || null,
            arquivoEditavelUrl: body.arquivoEditavelUrl || null,
            situacaoVigencia: body.situacaoVigencia || "vigente",
            atoRelacionado: body.atoRelacionado || null,
            orgaoResponsavel: body.orgaoResponsavel || "Gabinete do Prefeito",
            situacaoPublicacao: body.situacaoPublicacao || "publicado",
            ativo: body.ativo !== undefined ? Boolean(body.ativo) : true,
            dataAtualizacaoEfetiva: new Date(),
        },
    });

    revalidatePaths(REVALIDATE_GROUPS.legislacao);
    return jsonNoStore(item, { status: 201 });
}
