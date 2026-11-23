export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireServerAuth } from "@/lib/rbac";
import { jsonNoStore, revalidatePaths, REVALIDATE_GROUPS } from "@/lib/revalidate-site";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
    const item = await prisma.legislacao.findUnique({ where: { id: params.id } });
    if (!item) return jsonNoStore({ error: "Não encontrado" }, { status: 404 });
    return jsonNoStore(item);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireServerAuth([
        "admin",
        "controladoria",
        "legislacao",
        "lrf_contas",
        "financas",
        "editor",
    ]);
    if (!auth.authorized) return auth.response;

    try {
        const body = await request.json();
        const { tipo, numero, ano, ementa, arquivo, ativo } = body;

        const data: Record<string, unknown> = {
            dataAtualizacaoEfetiva: new Date(),
        };
        if (tipo !== undefined) data.tipo = String(tipo).trim();
        if (numero !== undefined) data.numero = String(numero).trim();
        if (ano !== undefined) data.ano = parseInt(String(ano), 10);
        if (ementa !== undefined) data.ementa = String(ementa).trim();
        if (arquivo !== undefined) data.arquivo = arquivo || null;
        if (ativo !== undefined) data.ativo = Boolean(ativo);
        if (body.categoria !== undefined) data.categoria = body.categoria ? String(body.categoria).trim() : null;
        if (body.dataAto !== undefined) data.dataAto = body.dataAto ? new Date(body.dataAto) : null;
        if (body.documentUrl !== undefined) data.documentUrl = body.documentUrl || null;
        if (body.arquivoEditavelUrl !== undefined) data.arquivoEditavelUrl = body.arquivoEditavelUrl || null;
        if (body.situacaoVigencia !== undefined) data.situacaoVigencia = body.situacaoVigencia;
        if (body.atoRelacionado !== undefined) data.atoRelacionado = body.atoRelacionado || null;
        if (body.orgaoResponsavel !== undefined) data.orgaoResponsavel = body.orgaoResponsavel || null;
        if (body.situacaoPublicacao !== undefined) data.situacaoPublicacao = body.situacaoPublicacao;

        const item = await prisma.legislacao.update({
            where: { id: params.id },
            data,
        });

        revalidatePaths(REVALIDATE_GROUPS.legislacao);
        return jsonNoStore(item);
    } catch {
        return jsonNoStore({ error: "Erro ao atualizar legislação" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireServerAuth([
        "admin",
        "controladoria",
        "legislacao",
        "lrf_contas",
        "financas",
        "editor",
    ]);
    if (!auth.authorized) return auth.response;

    try {
        const item = await prisma.legislacao.findUnique({ where: { id: params.id } });
        if (item?.arquivo) {
            const { deleteFileFromR2 } = await import("@/lib/r2");
            await deleteFileFromR2(item.arquivo);
        }
        await prisma.legislacao.delete({ where: { id: params.id } });
        revalidatePaths(REVALIDATE_GROUPS.legislacao);
        return jsonNoStore({ success: true });
    } catch {
        return jsonNoStore({ error: "Erro ao deletar legislação" }, { status: 500 });
    }
}
