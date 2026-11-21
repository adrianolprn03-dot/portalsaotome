export const PORTAL_2018_2022_DEFAULT_URL = "https://www.governotransparente.com.br/68629488?clean=false";
export const PORTAL_2023_2025_DEFAULT_URL = "https://saotome.rn.gov.br/portal-da-transparencia-copy/";
export const TOPSOLUTIONS_2023_2025_BASE_URL = "https://pmsaotomern.transparencia.topsolutionsrn.com.br";
export const CONTRACHEQUE_TOPSOLUTIONS_URL = "https://app.topsolutionsrn.com.br/ContraCheque/pmsaotome/";

export interface LinkExternoResumo {
    id?: string;
    titulo?: string;
    url: string;
    descricao?: string | null;
    categoria?: string;
    ativo?: boolean;
    moduloAlvo?: string | null;
}

export const LINKS_PADRAO_2023_2025: Record<string, { url: string; origem: string }> = {
    receitas: {
        url: `${TOPSOLUTIONS_2023_2025_BASE_URL}/receita`,
        origem: "TopSolutions",
    },
    despesas: {
        url: `${TOPSOLUTIONS_2023_2025_BASE_URL}/despesa`,
        origem: "TopSolutions",
    },
    "ordem-cronologica": {
        url: `${TOPSOLUTIONS_2023_2025_BASE_URL}/ordem-cronologica`,
        origem: "TopSolutions",
    },
    emendas: {
        url: `${TOPSOLUTIONS_2023_2025_BASE_URL}/emenda-parlamentar`,
        origem: "TopSolutions",
    },
    "renuncias-fiscais": {
        url: `${TOPSOLUTIONS_2023_2025_BASE_URL}/renuncias-fiscais`,
        origem: "TopSolutions",
    },
    licitacoes: {
        url: `${TOPSOLUTIONS_2023_2025_BASE_URL}/licitacao`,
        origem: "TopSolutions",
    },
    contratos: {
        url: `${TOPSOLUTIONS_2023_2025_BASE_URL}/contratos`,
        origem: "TopSolutions",
    },
    "atas-registro": {
        url: `${TOPSOLUTIONS_2023_2025_BASE_URL}/ata-de-registro-de-preco`,
        origem: "TopSolutions",
    },
    "plano-contratacao": {
        url: `${TOPSOLUTIONS_2023_2025_BASE_URL}/arquivos/plano-de-contratacao-anual`,
        origem: "TopSolutions",
    },
    servidores: {
        url: `${TOPSOLUTIONS_2023_2025_BASE_URL}/servidores`,
        origem: "TopSolutions",
    },
    transferencias: {
        url: `${TOPSOLUTIONS_2023_2025_BASE_URL}/transferencias-recebidas`,
        origem: "TopSolutions",
    },
    convenios: {
        url: `${TOPSOLUTIONS_2023_2025_BASE_URL}/acordos`,
        origem: "TopSolutions",
    },
    "acordos-firmados": {
        url: `${TOPSOLUTIONS_2023_2025_BASE_URL}/acordos`,
        origem: "TopSolutions",
    },
    terceirizados: {
        url: `${TOPSOLUTIONS_2023_2025_BASE_URL}/terceirizados`,
        origem: "TopSolutions",
    },
    estagiarios: {
        url: `${TOPSOLUTIONS_2023_2025_BASE_URL}/estagiarios`,
        origem: "TopSolutions",
    },
    contracheque: {
        url: CONTRACHEQUE_TOPSOLUTIONS_URL,
        origem: "TopSolutions",
    },
};

export function findActiveLinkByTarget(
    linksExternos: LinkExternoResumo[] | undefined | null,
    moduloAlvo: string
): LinkExternoResumo | undefined {
    if (!Array.isArray(linksExternos)) return undefined;
    const alvoNorm = moduloAlvo.toLowerCase();
    return linksExternos.find(
        (l) => l?.ativo !== false && l?.moduloAlvo?.toLowerCase() === alvoNorm && Boolean(l?.url)
    );
}

export function resolvePortalUrl(
    linksExternos: LinkExternoResumo[] | undefined | null,
    moduloAlvo: string,
    fallbackUrl: string
): string {
    return findActiveLinkByTarget(linksExternos, moduloAlvo)?.url || fallbackUrl;
}

export function resolveModulo2023_2025(
    linksExternos: LinkExternoResumo[] | undefined | null,
    moduloId: string,
    internalHref: string
): {
    href: string;
    isExternal: boolean;
    origem: string;
    matchedId?: string;
} {
    const dbMatch =
        findActiveLinkByTarget(linksExternos, `${moduloId}-2023-2025`) ||
        findActiveLinkByTarget(linksExternos, `${moduloId}-2023`);

    if (dbMatch) {
        return {
            href: dbMatch.url,
            isExternal: true,
            origem: dbMatch.url.includes("topsolutionsrn") ? "TopSolutions" : "Portal Externo",
            matchedId: dbMatch.id,
        };
    }

    const padrao = LINKS_PADRAO_2023_2025[moduloId];
    if (padrao) {
        return {
            href: padrao.url,
            isExternal: true,
            origem: padrao.origem,
        };
    }

    return {
        href: internalHref,
        isExternal: false,
        origem: "Acervo no Portal",
    };
}
