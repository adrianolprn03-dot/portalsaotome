export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireServerAuth } from "@/lib/rbac";

const LRF_PATHS_TO_REVALIDATE = [
    "/transparencia/lrf",
    "/transparencia/rreo",
    "/transparencia/rgf",
    "/transparencia/balanco",
    "/transparencia/prestacao-contas",
    "/transparencia/parecer-tce",
    "/transparencia/julgamento-contas",
    "/transparencia/relatorio-gestao",
    "/transparencia/relatorios",
    "/admin/relatorios-fiscais",
];

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireServerAuth([
        "admin",
        "controladoria",
        "lrf_contas",
        "financas",
        "integracao",
        "editor",
    ]);
    if (!auth.authorized) return auth.response;

    try {
        const body = await req.json();
        const { titulo, tipo, periodo, ano, arquivo } = body;

        const atualizado = await prisma.relatorioFiscal.update({
            where: { id: params.id },
            data: {
                titulo: String(titulo).trim(),
                tipo: String(tipo).trim(),
                periodo: String(periodo).trim(),
                ano: parseInt(ano.toString(), 10),
                arquivo: String(arquivo).trim(),
            },
        });

        for (const p of LRF_PATHS_TO_REVALIDATE) {
            revalidatePath(p);
        }

        return NextResponse.json(atualizado);
    } catch {
        return NextResponse.json({ error: "Erro ao atualizar relatório" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireServerAuth([
        "admin",
        "controladoria",
        "lrf_contas",
        "financas",
        "integracao",
        "editor",
    ]);
    if (!auth.authorized) return auth.response;

    try {
        const item = await prisma.relatorioFiscal.findUnique({ where: { id: params.id } });
        if (item?.arquivo) {
            const { deleteFileFromR2 } = await import("@/lib/r2");
            await deleteFileFromR2(item.arquivo);
        }
        await prisma.relatorioFiscal.delete({
            where: { id: params.id },
        });

        for (const p of LRF_PATHS_TO_REVALIDATE) {
            revalidatePath(p);
        }

        return NextResponse.json({ message: "Relatório removido" });
    } catch {
        return NextResponse.json({ error: "Erro ao excluir relatório" }, { status: 500 });
    }
}
