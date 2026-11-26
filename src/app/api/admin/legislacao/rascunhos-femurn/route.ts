export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { requireServerAuth } from "@/lib/rbac";
import { jsonNoStore } from "@/lib/revalidate-site";

// Quantidade de atos vindos da FEMURN que aguardam aprovação (rascunhos).
export async function GET() {
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
        const [total, diarias] = await Promise.all([
            prisma.legislacao.count({
                where: { ativo: false, femurn: { isNot: null } },
            }),
            prisma.diaria.count({
                where: { situacaoPublicacao: "rascunho", femurn: { isNot: null } },
            }),
        ]);
        return jsonNoStore({ total, legislacao: total, diarias });
    } catch {
        return jsonNoStore({ error: "Erro ao contar rascunhos da FEMURN" }, { status: 500 });
    }
}
