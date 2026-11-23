import { prisma } from "@/lib/prisma";
import { isValidPublicUrl } from "@/lib/portal-links";
import LegislacaoClient, {
    type LegislacaoIconKey,
    type LinkExternoItem,
} from "@/app/(site)/transparencia/legislacao/_LegislacaoClient";

interface LegislacaoPageShellProps {
    pageTitle: string;
    pageSubtitle: string;
    breadcrumbLabel: string;
    iconKey?: LegislacaoIconKey;
    initialTipo?: string;
    hideTipoFilter?: boolean;
    yearSubtitle?: string;
}

/**
 * Container servidor compartilhado para as páginas normativas e legislativas
 * (Legislação, Leis, Decretos, Portarias, Resoluções e Lei Orgânica),
 * unificando o layout ao padrão da página LRF.
 */
export default async function LegislacaoPageShell({
    pageTitle,
    pageSubtitle,
    breadcrumbLabel,
    iconKey = "scale",
    initialTipo = "",
    hideTipoFilter = false,
    yearSubtitle = "Atos Normativos e Legislação Municipal",
}: LegislacaoPageShellProps) {
    let validExternalLinks: LinkExternoItem[] = [];

    try {
        const rows = await (prisma as any).linkExterno.findMany({
            where: {
                ativo: true,
                categoria: { in: ["legislacao", "geral"] },
            },
            orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
        });

        validExternalLinks = (Array.isArray(rows) ? rows : [])
            .filter((link: any) => isValidPublicUrl(link?.url))
            .map((link: any) => {
                let hostname = "Portal externo";
                try {
                    hostname = new URL(link.url).hostname;
                } catch {
                    hostname = "Link institucional";
                }
                return {
                    id: String(link.id),
                    titulo: String(link.titulo || "Fonte Oficial"),
                    descricao: link.descricao || null,
                    url: String(link.url),
                    hostname,
                };
            });
    } catch {
        validExternalLinks = [];
    }

    return (
        <LegislacaoClient
            initialTipo={initialTipo}
            hideTipoFilter={hideTipoFilter}
            pageTitle={pageTitle}
            pageSubtitle={pageSubtitle}
            breadcrumbLabel={breadcrumbLabel}
            iconKey={iconKey}
            yearSubtitle={yearSubtitle}
            linksExternos={validExternalLinks}
        />
    );
}
