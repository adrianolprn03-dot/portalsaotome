export const revalidate = 300;

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PlanoEducacaoClientPage from "@/components/transparencia/PlanoEducacaoClientPage";

export const metadata: Metadata = {
    title: "Plano de Educação e Relatórios de Resultados | Transparência",
    description:
        "Plano Municipal de Educação (PME) e Relatórios de Monitoramento e Resultados com série histórica e exportação (Cartilha PNTP 2026 - Item 19.1).",
};

export default async function PlanoEducacaoPage() {
    const rawDocs = await prisma.documento.findMany({
        where: {
            ativo: true,
            tipo: { in: ["plano-educacao", "relatorio-plano-educacao"] },
        },
        orderBy: [{ ano: "desc" }, { criadoEm: "desc" }],
    });

    const docs = rawDocs.map((d) => ({
        id: d.id,
        titulo: d.titulo,
        descricao: d.descricao,
        tipo: d.tipo,
        orgaoResponsavel: d.orgaoResponsavel,
        arquivo: d.arquivo,
        documentUrl: d.documentUrl,
        arquivoEditavelUrl: d.arquivoEditavelUrl,
        ano: d.ano,
        competencia: d.competencia,
        criadoEm: d.criadoEm.toISOString(),
        atualizadoEm: d.atualizadoEm.toISOString(),
    }));

    return <PlanoEducacaoClientPage initialDocs={docs} />;
}
