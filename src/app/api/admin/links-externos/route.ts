export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { jsonNoStore, revalidatePaths, REVALIDATE_GROUPS } from "@/lib/revalidate-site";
import { isValidPublicUrl, sanitizeDiarioOficialUrl } from "@/lib/portal-links";

const db = prisma as any;

export async function GET() {
    try {
        const links = await db.linkExterno.findMany({
            orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
        });
        return jsonNoStore(links);
    } catch (err) {
        console.error("Erro ao buscar links:", err);
        return jsonNoStore({ error: "Erro ao buscar links" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return jsonNoStore({ error: "Não autorizado" }, { status: 401 });

    try {
        const body = await req.json();
        if (!isValidPublicUrl(body.url)) {
            return jsonNoStore(
                { error: "Informe uma URL pública válida (links vazios ou '#' não são permitidos)." },
                { status: 400 }
            );
        }

        const sanitizedUrl = sanitizeDiarioOficialUrl(body.url);

        const link = await db.linkExterno.create({
            data: {
                titulo: String(body.titulo || "").trim(),
                url: sanitizedUrl,
                descricao: body.descricao || null,
                categoria: body.categoria,
                icone: body.icone || "FaLink",
                ativo: body.ativo ?? true,
                ordem: Number(body.ordem) || 0,
                moduloAlvo: body.moduloAlvo || null,
            },
        });
        revalidatePaths([
            ...REVALIDATE_GROUPS.institucional,
            "/transparencia-2018-2022",
            "/transparencia-2023-2025",
            "/admin/links-externos",
        ]);
        return jsonNoStore(link, { status: 201 });
    } catch (err) {
        console.error("Erro ao criar link:", err);
        return jsonNoStore({ error: "Erro ao criar link" }, { status: 500 });
    }
}
