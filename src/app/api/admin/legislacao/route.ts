export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireServerAuth } from "@/lib/rbac";
import { jsonNoStore, revalidatePaths, REVALIDATE_GROUPS } from "@/lib/revalidate-site";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo");
    const ano = searchParams.get("ano");
    const q = searchParams.get("q")?.trim();
    const situacaoVigencia = searchParams.get("situacaoVigencia");
    const ativoParam = searchParams.get("ativo");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (tipo) where.tipo = tipo;
    if (ano && !Number.isNaN(parseInt(ano, 10))) where.ano = parseInt(ano, 10);
    if (situacaoVigencia) where.situacaoVigencia = situacaoVigencia;
    if (ativoParam === "true") where.ativo = true;
    if (ativoParam === "false") where.ativo = false;

    if (q) {
        where.OR = [
            { numero: { contains: q, mode: "insensitive" } },
            { ementa: { contains: q, mode: "insensitive" } },
            { categoria: { contains: q, mode: "insensitive" } },
            { orgaoResponsavel: { contains: q, mode: "insensitive" } },
        ];
    }

    const [items, total] = await Promise.all([
        prisma.legislacao.findMany({
            where,
            orderBy: [{ ano: "desc" }, { dataAto: "desc" }, { criadoEm: "desc" }],
            skip,
            take: limit,
        }),
        prisma.legislacao.count({ where }),
    ]);

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
