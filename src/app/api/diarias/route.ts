export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const ano = searchParams.get("ano");
    const mes = searchParams.get("mes");
    const query = searchParams.get("query");
    const secretaria = searchParams.get("secretaria");
    const incluirRascunhos = searchParams.get("incluirRascunhos") === "true";

    const session = incluirRascunhos ? await getServerSession(authOptions) : null;
    const where: Record<string, unknown> = {};
    if (!session) {
        where.situacaoPublicacao = "publicado";
    }
    if (ano) where.ano = parseInt(ano, 10);
    if (mes) where.mes = parseInt(mes, 10);
    if (secretaria) where.secretaria = { contains: secretaria, mode: "insensitive" };

    if (query) {
        where.OR = [
            { servidor: { contains: query, mode: "insensitive" } },
            { destino: { contains: query, mode: "insensitive" } },
            { motivo: { contains: query, mode: "insensitive" } },
            { numeroPortaria: { contains: query, mode: "insensitive" } },
            { codigoPermanente: { contains: query, mode: "insensitive" } },
        ];
    }

    try {
        const [items, total] = await Promise.all([
            prisma.diaria.findMany({
                where,
                include: { femurn: { select: { codigo: true, edicao: true, publicadoEm: true } } },
                orderBy: [{ dataInicio: "desc" }, { criadoEm: "desc" }],
            }),
            prisma.diaria.count({ where }),
        ]);
        const totalValor = items.reduce((sum, d) => sum + d.valor, 0);
        return NextResponse.json({ items, total, totalValor });
    } catch (error) {
        console.error("Erro ao buscar diárias:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    try {
        const body = await req.json();
        const data = {
            ...body,
            dataInicio: new Date(body.dataInicio),
            dataFim: new Date(body.dataFim),
            valor: parseFloat(body.valor) || 0,
            valorUnitario: parseFloat(body.valorUnitario) || 0,
            quantidadeDias: parseFloat(body.quantidadeDias) || 1,
            mes: parseInt(body.mes, 10) || new Date().getMonth() + 1,
            ano: parseInt(body.ano, 10) || new Date().getFullYear(),
        };

        const diaria = await prisma.diaria.create({ data });
        return NextResponse.json(diaria, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar diária:", error);
        return NextResponse.json({ error: "Erro ao salvar diária no banco de dados" }, { status: 500 });
    }
}

