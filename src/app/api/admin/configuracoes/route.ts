export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET(req: Request) {
    try {
        const isPublic = new URL(req.url).searchParams.get("public") === "1";
        const configs = await prisma.configuracao.findMany({
            orderBy: { chave: "asc" }
        });
        return NextResponse.json(configs, {
            headers: {
                "Cache-Control": isPublic
                    ? "public, max-age=60, s-maxage=300, stale-while-revalidate=600"
                    : "no-store",
            },
        });
    } catch (error) {
        console.error("Erro ao buscar configurações:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    try {
        const body = await req.json();
        const { configs } = body; // Array de { chave, valor }

        if (!Array.isArray(configs)) {
            return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
        }

        const updates = configs.map((c: any) => {
            const rawVal = typeof c.valor === "string" ? c.valor.trim() : String(c.valor ?? "");
            // Impede salvar placeholders "#" em canais oficiais ou links
            const cleanVal = rawVal === "#" || rawVal === "http://#" || rawVal === "https://#" ? "" : rawVal;
            return prisma.configuracao.upsert({
                where: { chave: c.chave },
                update: { valor: cleanVal },
                create: { chave: c.chave, valor: cleanVal },
            });
        });

        await Promise.all(updates);

        revalidatePath("/", "layout");
        revalidatePath("/municipio/simbolos");
        revalidatePath("/transparencia/simbolos");
        revalidatePath("/transparencia/gestores");

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao salvar configurações:", error);
        return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
    }
}

