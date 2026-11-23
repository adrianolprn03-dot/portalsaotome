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

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const tipo = searchParams.get("tipo");
        const ano = searchParams.get("ano");

        const where: Record<string, unknown> = {};
        if (tipo) where.tipo = tipo;
        if (ano && !Number.isNaN(parseInt(ano, 10))) where.ano = parseInt(ano, 10);

        const relatorios = await prisma.relatorioFiscal.findMany({
            where,
            orderBy: [{ ano: "desc" }, { dataPublicacao: "desc" }, { periodo: "asc" }],
        });
        return NextResponse.json(relatorios);
    } catch {
        return NextResponse.json({ error: "Erro ao buscar relatórios" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
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

        if (!titulo || !tipo || !periodo || !ano || !arquivo) {
            return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
        }

        const novoRelatorio = await prisma.relatorioFiscal.create({
            data: {
                titulo: String(titulo).trim(),
                tipo: String(tipo).trim(),
                periodo: String(periodo).trim(),
                ano: parseInt(ano.toString(), 10),
                arquivo: String(arquivo).trim(),
                dataPublicacao: new Date(),
            },
        });

        for (const p of LRF_PATHS_TO_REVALIDATE) {
            revalidatePath(p);
        }

        return NextResponse.json(novoRelatorio, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar relatório fiscal:", error);
        return NextResponse.json({ error: "Erro ao salvar no banco de dados" }, { status: 500 });
    }
}
