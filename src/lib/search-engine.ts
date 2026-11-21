import { prisma } from "@/lib/prisma";
import {
    FEMURN_SAO_TOME_INSTRUCTION,
    FEMURN_STABLE_SEARCH_URL,
    getSecretariaShortSummary,
    isValidPublicUrl,
    sanitizeDiarioOficialUrl,
} from "@/lib/portal-links";
import { formatDateFortaleza, isAvisoVigente } from "@/lib/timezone";

export type SearchResultCategory =
    | "servico"
    | "secretaria"
    | "unidade"
    | "noticia"
    | "documento"
    | "sistema_externo";

export interface UnifiedSearchResult {
    id: string;
    tipo: SearchResultCategory;
    tipoLabel: string;
    titulo: string;
    resumo: string;
    href: string;
    documentUrl?: string | null;
    isExternal?: boolean;
    meta?: {
        numero?: string | null;
        ano?: number | null;
        subtipo?: string | null;
        data?: string | null;
        horario?: string | null;
        endereco?: string | null;
        telefone?: string | null;
        orgao?: string | null;
    };
    score: number;
}

export interface ExternalSystemAccess {
    id: string;
    titulo: string;
    orgaoSistema: string;
    descricao: string;
    instrucao?: string;
    url: string;
    keywords: string[];
}

export function normalizeSearchText(str?: string | null): string {
    if (!str) return "";
    return String(str)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}

export function parseActNumberInt(numStr?: string | null): number | null {
    if (!numStr) return null;
    // Remove separador de milhar como "1.451/2026" -> "1451/2026"
    const cleaned = String(numStr).replace(/(\d)\.(\d{3})\b/g, "$1$2");
    const match = cleaned.match(/(\d+)/);
    if (!match) return null;
    const parsed = parseInt(match[1], 10);
    return Number.isNaN(parsed) ? null : parsed;
}

export interface ParsedActQuery {
    actType: string | null;
    actNumberInt: number | null;
    actNumberRaw: string | null;
    actYear: number | null;
    remainingTokens: string[];
}

export function parseActQuery(rawQuery: string): ParsedActQuery {
    const norm = normalizeSearchText(rawQuery).replace(/(\d)\.(\d{3})\b/g, "$1$2");

    let actType: string | null = null;
    if (/\blei\s+organica\b/.test(norm)) actType = "lei-organica";
    else if (/\blei\b|\bleis\b/.test(norm)) actType = "lei";
    else if (/\bdecreto\b|\bdecretos\b/.test(norm)) actType = "decreto";
    else if (/\bportaria\b|\bportarias\b/.test(norm)) actType = "portaria";
    else if (/\bresolucao\b|\bresolucoes\b/.test(norm)) actType = "resolucao";

    let actNumberInt: number | null = null;
    let actNumberRaw: string | null = null;
    let actYear: number | null = null;

    // Formato explícito numero/ano ou numero-ano (ex: 1451/2026, 028/2026, 23-2025)
    const slashMatch = norm.match(/\b0*(\d{1,5})\s*[\/.\-]\s*(19\d{2}|20\d{2})\b/);
    if (slashMatch) {
        actNumberRaw = slashMatch[1];
        actNumberInt = parseInt(slashMatch[1], 10);
        actYear = parseInt(slashMatch[2], 10);
    } else {
        // Procura ano de 4 dígitos (1950-2049) e outro número separado (ex: "lei 1451 de 2026" ou "1451 2026")
        const allNumbers = Array.from(norm.matchAll(/\b(\d{1,5})\b/g)).map((m) => m[1]);
        const yearCandidate = allNumbers.find((n) => /^(19[5-9]\d|20[0-4]\d)$/.test(n));
        const otherNumbers = allNumbers.filter((n) => n !== yearCandidate);

        if (yearCandidate && otherNumbers.length > 0) {
            actYear = parseInt(yearCandidate, 10);
            actNumberRaw = otherNumbers[0];
            actNumberInt = parseInt(otherNumbers[0], 10);
        } else if (allNumbers.length === 1) {
            const single = allNumbers[0];
            if (/^(19[5-9]\d|20[0-4]\d)$/.test(single) && !actType && !/\bn[º°o.]?\s*\d/.test(norm)) {
                actYear = parseInt(single, 10);
            } else {
                actNumberRaw = single;
                actNumberInt = parseInt(single, 10);
            }
        }
    }

    const stopWords = new Set([
        "de",
        "da",
        "do",
        "das",
        "dos",
        "e",
        "em",
        "para",
        "com",
        "no",
        "na",
        "nos",
        "nas",
        "n",
        "no",
        "nº",
        "numero",
        "ano",
    ]);

    const tokens = norm
        .replace(/[\/.\-,;:()"]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length >= 2 && !stopWords.has(t));

    return {
        actType,
        actNumberInt,
        actNumberRaw,
        actYear,
        remainingTokens: tokens,
    };
}

const PORTAL_CORE_SERVICES: Array<{
    id: string;
    titulo: string;
    resumo: string;
    href: string;
    keywords: string[];
}> = [
    {
        id: "srv-carta",
        titulo: "Carta de Serviços ao Cidadão",
        resumo: "Catálogo oficial de serviços públicos municipais, locais de atendimento, documentos necessários e prazos.",
        href: "/transparencia/carta-servicos",
        keywords: ["carta de servicos", "catalogo de servicos", "servicos", "atendimento ao cidadao"],
    },
    {
        id: "srv-esic",
        titulo: "Solicitar informação pública (e-SIC)",
        resumo: "Pedido eletrônico de acesso à informação pública nos termos da Lei Federal nº 12.527/2011 (LAI), com protocolo.",
        href: "/servicos/esic",
        keywords: ["esic", "e-sic", "lai", "solicitar informacao", "informacao publica", "pedido de informacao", "acesso a informacao"],
    },
    {
        id: "srv-ouvidoria",
        titulo: "Registrar manifestação na Ouvidoria",
        resumo: "Canal oficial para registrar reclamações, denúncias, sugestões, elogios e solicitações de providência.",
        href: "/servicos/ouvidoria",
        keywords: ["ouvidoria", "registrar manifestacao", "denuncia", "reclamacao", "sugestao", "elogio", "manifestacao"],
    },
    {
        id: "srv-protocolo",
        titulo: "Consultar protocolo (Ouvidoria e e-SIC)",
        resumo: "Acompanhe o andamento e a resposta de protocolos registrados na Ouvidoria Municipal ou no e-SIC.",
        href: "/servicos/consulta-protocolo",
        keywords: ["consultar protocolo", "protocolo", "rastrear pedido", "acompanhar manifestacao", "andamento"],
    },
    {
        id: "srv-unidades-saude",
        titulo: "Encontrar unidade de saúde (UBS)",
        resumo: "Endereços, horários de funcionamento, serviços ofertados, especialidades e equipes das Unidades Básicas de Saúde.",
        href: "/unidades-de-saude",
        keywords: ["ubs", "unidade de saude", "posto de saude", "medico", "enfermeiro", "vacina", "dentista", "atendimento medico", "horario ubs"],
    },
    {
        id: "srv-medicamentos",
        titulo: "Medicamentos SUS (REMUME) e Farmácia Básica",
        resumo: "Relação municipal de medicamentos essenciais, disponibilidade em estoque e orientações de retirada no SUS.",
        href: "/transparencia/medicamentos-sus",
        keywords: ["medicamentos", "remedios", "farmacia basica", "remume", "estoque de medicamentos", "sus"],
    },
    {
        id: "srv-regulacao",
        titulo: "Central de Regulação do SUS (Exames e Consultas)",
        resumo: "Acompanhamento das filas de espera para consultas especializadas, exames e procedimentos eletivos.",
        href: "/transparencia/central-regulacao",
        keywords: ["central de regulacao", "exames", "fila do sus", "consulta especializada", "cirurgia"],
    },
    {
        id: "srv-escolas",
        titulo: "Unidades Escolares e Creches Municipais",
        resumo: "Endereços, contatos, horários de atendimento e etapas de ensino das escolas e creches da rede municipal.",
        href: "/unidades-escolares",
        keywords: ["escola", "escolas", "creche", "creches", "matricula", "educacao", "ensino infantil", "ensino fundamental"],
    },
    {
        id: "srv-fila-creches",
        titulo: "Fila de Espera em Creches e Critérios de Vagas",
        resumo: "Consulta pública de protocolos e critérios legais de priorização na educação infantil municipal.",
        href: "/transparencia/fila-creches",
        keywords: ["fila de creche", "vaga em creche", "lista de espera creche", "proinfancia"],
    },
    {
        id: "srv-social",
        titulo: "Assistência Social (CRAS e SCFV)",
        resumo: "Atendimento socioassistencial, Cadastro Único, benefícios eventuais e fortalecimento de vínculos.",
        href: "/socioassistencial",
        keywords: ["cras", "assistencia social", "cadastro unico", "cadunico", "bolsa familia", "scfv", "servico social"],
    },
    {
        id: "srv-legislacao",
        titulo: "Legislação Municipal (Leis, Decretos e Portarias)",
        resumo: "Acervo de leis ordinárias, leis complementares, decretos executivos e portarias do Município de São Tomé.",
        href: "/transparencia/legislacao",
        keywords: ["legislacao", "leis", "lei municipal", "decretos", "portarias", "lei organica", "atos normativos"],
    },
    {
        id: "srv-transparencia",
        titulo: "Portal da Transparência",
        resumo: "Acesso centralizado a despesas, receitas, licitações, contratos, obras, servidores e relatórios fiscais.",
        href: "/transparencia",
        keywords: ["transparencia", "portal da transparencia", "pntp", "prestacao de contas", "lrf", "rreo", "rgf"],
    },
];

function scoreTextMatch(
    queryNorm: string,
    tokens: string[],
    primaryText: string,
    secondaryText: string = "",
    keywords: string[] = []
): number {
    const pNorm = normalizeSearchText(primaryText);
    const sNorm = normalizeSearchText(secondaryText);
    const kNorm = keywords.map(normalizeSearchText).join(" ");
    const fullNorm = `${pNorm} ${sNorm} ${kNorm}`;

    if (!pNorm && !sNorm) return 0;

    let score = 0;

    // Correspondência exata do título ou palavra-chave
    if (pNorm === queryNorm || keywords.some((k) => normalizeSearchText(k) === queryNorm)) {
        score += 950;
    } else if (pNorm.startsWith(queryNorm)) {
        score += 720;
    } else if (pNorm.includes(queryNorm)) {
        score += 560;
    } else if (kNorm.includes(queryNorm)) {
        score += 500;
    } else if (sNorm.includes(queryNorm)) {
        score += 360;
    }

    if (tokens.length > 0) {
        let matchedTokens = 0;
        let primaryTokens = 0;
        for (const token of tokens) {
            if (pNorm.includes(token) || kNorm.includes(token)) {
                matchedTokens++;
                primaryTokens++;
            } else if (sNorm.includes(token)) {
                matchedTokens++;
            }
        }

        // Exige que todos os tokens relevantes (ou ao menos a maioria em consultas longas) apareçam
        const minRequired = tokens.length <= 2 ? tokens.length : Math.ceil(tokens.length * 0.75);
        if (matchedTokens < minRequired && score === 0) {
            return 0;
        }

        score += matchedTokens * 110 + primaryTokens * 65;
    }

    if (!fullNorm.includes(queryNorm) && tokens.length === 0) {
        return 0;
    }

    return score;
}

function getLegislacaoTipoLabel(tipo: string, categoria?: string | null): string {
    if (categoria && categoria.trim()) return categoria.trim();
    const t = normalizeSearchText(tipo);
    if (t === "lei-organica") return "Lei Orgânica";
    if (t === "lei") return "Lei Municipal";
    if (t === "decreto") return "Decreto Municipal";
    if (t === "portaria" || t === "portaria_diaria") return "Portaria";
    if (t === "resolucao") return "Resolução";
    return tipo || "Ato Oficial";
}

export async function getExternalSystemsCatalog(): Promise<ExternalSystemAccess[]> {
    let links: Array<{ moduloAlvo: string | null; url: string; titulo: string; ativo: boolean }> = [];
    try {
        links = await prisma.linkExterno.findMany({
            where: { ativo: true },
            select: { moduloAlvo: true, url: true, titulo: true, ativo: true },
        });
    } catch {
        links = [];
    }

    const findUrl = (modulo: string, fallback: string) => {
        const found = links.find(
            (l) => l.moduloAlvo?.toLowerCase() === modulo.toLowerCase() && isValidPublicUrl(l.url)
        );
        return found ? found.url.trim() : fallback;
    };

    const contribuinteUrl = findUrl(
        "home-contribuinte",
        "https://www.tinus.com.br/csp/SAOTOME/portal/index.csp?398ePKh0101MOVZE78365xmEw9088og=xbCN41Noq203lgm19139rlZlh569ZevDU2955S1071625bJbX145"
    );
    const diarioUrl = sanitizeDiarioOficialUrl(
        findUrl("home-diario", FEMURN_STABLE_SEARCH_URL)
    );
    const contrachequeUrl = findUrl(
        "home-contracheque",
        "https://app.topsolutionsrn.com.br/ContraCheque/pmsaotome/"
    );
    const despesasUrl = findUrl(
        "despesas",
        "https://transparencia.e-publica.net/epublica-portal/#/sao_tome/portal/despesa/avancado/empenhosTable?entidade=2162"
    );
    const receitasUrl = findUrl(
        "receitas",
        "https://transparencia.e-publica.net/epublica-portal/#/sao_tome/portal/receita/avancado/categoriaTable?entidade=2162"
    );
    const licitacoesUrl = findUrl(
        "licitacoes",
        "https://transparencia.e-publica.net/epublica-portal/#/sao_tome/portal/compras/licitacaoTable?entidade=2162"
    );
    const contratosUrl = findUrl(
        "contratos",
        "https://transparencia.e-publica.net/epublica-portal/#/sao_tome/portal/compras/contratoTable?entidade=2162"
    );

    return [
        {
            id: "ext-contribuinte",
            titulo: "Emitir guia ou certidão — Portal do Contribuinte",
            orgaoSistema: "Sistema Tributário (Tinus)",
            descricao:
                "Emissão de guias de IPTU, DAM, Certidão Negativa de Débitos, alvarás e Nota Fiscal de Serviços Eletrônica (NFS-e).",
            url: contribuinteUrl,
            keywords: [
                "iptu",
                "iss",
                "dam",
                "guia",
                "certidao",
                "certidao negativa",
                "alvara",
                "nota fiscal",
                "nfse",
                "tributos",
                "contribuinte",
                "imposto",
                "taxa",
            ],
        },
        {
            id: "ext-diario",
            titulo: "Consultar Diário Oficial dos Municípios (FEMURN)",
            orgaoSistema: "FEMURN • Diário Oficial",
            descricao:
                "Pesquisa oficial de atos, decretos, portarias, avisos de licitação e publicações legais do Município de São Tomé/RN.",
            instrucao: FEMURN_SAO_TOME_INSTRUCTION,
            url: diarioUrl,
            keywords: [
                "diario oficial",
                "femurn",
                "publicacao oficial",
                "edicao diario",
                "imprensa oficial",
            ],
        },
        {
            id: "ext-despesas",
            titulo: "Consulta de Despesas e Empenhos (e-Pública)",
            orgaoSistema: "Portal Contábil • e-Pública",
            descricao:
                "Consulta detalhada da execução de empenhos, liquidações e pagamentos no sistema contábil integrado.",
            url: despesasUrl,
            keywords: ["despesa", "despesas", "empenho", "empenhos", "pagamento", "pagamentos", "gastos"],
        },
        {
            id: "ext-receitas",
            titulo: "Consulta de Receitas e Arrecadação (e-Pública)",
            orgaoSistema: "Portal Contábil • e-Pública",
            descricao:
                "Consulta detalhada da arrecadação municipal e transferências constitucionais no sistema contábil integrado.",
            url: receitasUrl,
            keywords: ["receita", "receitas", "arrecadacao", "repasses"],
        },
        {
            id: "ext-licitacoes",
            titulo: "Consulta de Licitações e Editais (e-Pública)",
            orgaoSistema: "Portal de Compras • e-Pública",
            descricao:
                "Acompanhamento de processos licitatórios, pregões, dispensas e atas no sistema oficial de compras.",
            url: licitacoesUrl,
            keywords: ["licitacao", "licitacoes", "pregao", "edital de licitacao", "compras publicas"],
        },
        {
            id: "ext-contratos",
            titulo: "Consulta de Contratos Administrativos (e-Pública)",
            orgaoSistema: "Gestão de Contratos • e-Pública",
            descricao:
                "Consulta de contratos celebrados, fornecedores, vigências e aditivos no sistema oficial.",
            url: contratosUrl,
            keywords: ["contrato", "contratos", "fornecedores", "aditivos"],
        },
        {
            id: "ext-contracheque",
            titulo: "Contracheque Online do Servidor",
            orgaoSistema: "Portal do Servidor • TopSolutions",
            descricao:
                "Emissão de contracheques, holerites e informes de rendimentos para servidores públicos municipais.",
            url: contrachequeUrl,
            keywords: ["contracheque", "holerite", "servidor", "rendimentos", "folha"],
        },
    ];
}

export async function searchPortal(
    rawQuery: string,
    options?: { limit?: number; categoria?: SearchResultCategory | "todos" }
): Promise<{
    query: string;
    total: number;
    results: UnifiedSearchResult[];
    externalAccesses: ExternalSystemAccess[];
}> {
    const query = (rawQuery || "").trim();
    const limit = options?.limit ?? 40;
    const filterCat = options?.categoria && options.categoria !== "todos" ? options.categoria : null;

    const externalCatalog = await getExternalSystemsCatalog();

    if (query.length < 2) {
        return {
            query,
            total: 0,
            results: [],
            externalAccesses: externalCatalog.slice(0, 4),
        };
    }

    const queryNorm = normalizeSearchText(query);
    const parsedAct = parseActQuery(query);
    const tokens = parsedAct.remainingTokens;

    const [
        servicosCarta,
        secretarias,
        unidades,
        noticias,
        documentos,
        documentosSaude,
        legislacaoAll,
    ] = await Promise.all([
        prisma.servicoCarta
            .findMany({
                where: { ativo: true },
                orderBy: [{ ordem: "asc" }, { nome: "asc" }],
            })
            .catch(() => []),
        prisma.secretaria
            .findMany({
                where: {
                    ativa: true,
                    NOT: { situacaoPublicacao: "rascunho" },
                },
                orderBy: [{ ordem: "asc" }, { nome: "asc" }],
            })
            .catch(() => []),
        prisma.unidadeAtendimento
            .findMany({
                where: { ativa: true },
                orderBy: [{ tipo: "asc" }, { nome: "asc" }],
            })
            .catch(() => []),
        prisma.noticia
            .findMany({
                where: { publicada: true },
                orderBy: [{ publicadoEm: "desc" }, { criadoEm: "desc" }],
                take: 250,
                include: { secretaria: { select: { nome: true, slug: true } } },
            })
            .catch(() => []),
        prisma.documento
            .findMany({
                where: {
                    ativo: true,
                    acessoRestrito: false,
                    situacaoPublicacao: "publicado",
                },
                orderBy: [{ ano: "desc" }, { criadoEm: "desc" }],
            })
            .catch(() => []),
        prisma.documentoSaude
            .findMany({
                where: { ativo: true },
                orderBy: [{ anoExercicio: "desc" }, { criadoEm: "desc" }],
            })
            .catch(() => []),
        prisma.legislacao
            .findMany({
                where: {
                    ativo: true,
                    NOT: { situacaoPublicacao: "rascunho" },
                },
                orderBy: [{ ano: "desc" }, { id: "desc" }],
                select: {
                    id: true,
                    tipo: true,
                    categoria: true,
                    numero: true,
                    ano: true,
                    ementa: true,
                    arquivo: true,
                    documentUrl: true,
                },
            })
            .catch(() => []),
    ]);

    const results: UnifiedSearchResult[] = [];

    // 1. SERVIÇOS (Carta de Serviços do banco + Serviços estruturais do portal)
    if (!filterCat || filterCat === "servico") {
        for (const s of servicosCarta) {
            const sScore = scoreTextMatch(
                queryNorm,
                tokens,
                s.nome,
                `${s.categoria} ${s.descricao} ${s.local || ""} ${s.requisitos || ""}`
            );
            if (sScore > 0) {
                const validLink = isValidPublicUrl(s.linkAcesso) ? s.linkAcesso!.trim() : null;
                // Evita subdomínios antigos inexistentes como transparencia.saotome.rn.gov.br ou ouvidoria.saotome.rn.gov.br
                let resolvedHref = "/transparencia/carta-servicos";
                if (validLink) {
                    if (validLink.includes("ouvidoria.saotome.rn.gov.br")) {
                        resolvedHref = "/servicos/ouvidoria";
                    } else if (validLink.includes("transparencia.saotome.rn.gov.br/esic")) {
                        resolvedHref = "/servicos/esic";
                    } else if (validLink.includes("transparencia.saotome.rn.gov.br/legislacao")) {
                        resolvedHref = "/transparencia/legislacao";
                    } else if (validLink.includes("transparencia.saotome.rn.gov.br")) {
                        resolvedHref = "/transparencia";
                    } else if (validLink.includes("saotome.rn.gov.br/portal-contribuinte")) {
                        const extContrib = externalCatalog.find((e) => e.id === "ext-contribuinte");
                        resolvedHref = extContrib?.url || "/transparencia/carta-servicos";
                    } else if (validLink.includes("saotome.rn.gov.br/portal-servidor")) {
                        const extContra = externalCatalog.find((e) => e.id === "ext-contracheque");
                        resolvedHref = extContra?.url || "/transparencia/servidores";
                    } else {
                        resolvedHref = validLink;
                    }
                }

                results.push({
                    id: `carta-${s.id}`,
                    tipo: "servico",
                    tipoLabel: `Serviço • ${s.categoria}`,
                    titulo: s.nome,
                    resumo: `${s.descricao}${s.local ? ` • Atendimento: ${s.local}` : ""}${s.prazo ? ` • Prazo: ${s.prazo}` : ""}`,
                    href: resolvedHref,
                    isExternal: resolvedHref.startsWith("http"),
                    meta: {
                        orgao: s.local,
                    },
                    score: sScore + 40,
                });
            }
        }

        for (const core of PORTAL_CORE_SERVICES) {
            const cScore = scoreTextMatch(
                queryNorm,
                tokens,
                core.titulo,
                core.resumo,
                core.keywords
            );
            if (cScore > 0) {
                // Evita duplicar se já houver item de mesmo título na Carta
                const alreadyExists = results.some(
                    (r) =>
                        r.tipo === "servico" &&
                        normalizeSearchText(r.titulo) === normalizeSearchText(core.titulo)
                );
                if (!alreadyExists) {
                    results.push({
                        id: core.id,
                        tipo: "servico",
                        tipoLabel: "Serviço e Atendimento",
                        titulo: core.titulo,
                        resumo: core.resumo,
                        href: core.href,
                        score: cScore + 30,
                    });
                }
            }
        }
    }

    // 2. SISTEMAS EXTERNOS IDENTIFICADOS (IPTU, Diário Oficial, Contracheque, e-Pública)
    if (!filterCat || filterCat === "servico" || filterCat === "sistema_externo") {
        for (const ext of externalCatalog) {
            const eScore = scoreTextMatch(
                queryNorm,
                tokens,
                ext.titulo,
                `${ext.orgaoSistema} ${ext.descricao}`,
                ext.keywords
            );
            if (eScore > 0) {
                results.push({
                    id: ext.id,
                    tipo: "sistema_externo",
                    tipoLabel: `Consulta Externa • ${ext.orgaoSistema}`,
                    titulo: ext.titulo,
                    resumo: ext.instrucao
                        ? `${ext.descricao} (${ext.instrucao})`
                        : ext.descricao,
                    href: ext.url,
                    isExternal: true,
                    meta: {
                        orgao: ext.orgaoSistema,
                    },
                    score: eScore + 45,
                });
            }
        }
    }

    // 3. SECRETARIAS MUNICIPAIS
    if (!filterCat || filterCat === "secretaria") {
        for (const sec of secretarias) {
            const shortSummary = getSecretariaShortSummary(sec);
            const secScore = scoreTextMatch(
                queryNorm,
                tokens,
                sec.nome,
                `${shortSummary} ${sec.descricao || ""} ${sec.secretario || ""} ${sec.endereco || ""}`,
                ["secretaria", sec.slug.replace(/-/g, " ")]
            );
            if (secScore > 0) {
                results.push({
                    id: `sec-${sec.id}`,
                    tipo: "secretaria",
                    tipoLabel: "Secretaria / Órgão Municipal",
                    titulo: sec.nome,
                    resumo: shortSummary,
                    href: `/secretarias/${sec.slug}`,
                    meta: {
                        horario: sec.horarioFuncionamento,
                        endereco: sec.endereco,
                        telefone: sec.telefone,
                        orgao: sec.secretario ? `Titular: ${sec.secretario}` : undefined,
                    },
                    score: secScore + 25,
                });
            }
        }
    }

    // 4. UNIDADES DE ATENDIMENTO (UBS, Escolas, Creches, CRAS, SCFV)
    if (!filterCat || filterCat === "unidade") {
        for (const u of unidades) {
            const isUbs = normalizeSearchText(u.tipo).includes("saude") || normalizeSearchText(u.nome).includes("ubs");
            const isEscola = normalizeSearchText(u.tipo).includes("educacao");
            const isSocial = normalizeSearchText(u.tipo).includes("socio");

            const uKeywords = isUbs
                ? ["ubs", "unidade de saude", "posto de saude", "saude", "sus"]
                : isEscola
                ? ["escola", "creche", "unidade escolar", "educacao"]
                : isSocial
                ? ["cras", "scfv", "assistencia social", "socioassistencial"]
                : ["unidade de atendimento"];

            const uScore = scoreTextMatch(
                queryNorm,
                tokens,
                u.nome,
                `${u.tipo} ${u.subtipo || ""} ${u.descricao || ""} ${u.endereco || ""} ${u.horario || ""} ${u.servicos || ""}`,
                uKeywords
            );

            if (uScore > 0) {
                const href = isUbs
                    ? `/unidades-de-saude?q=${encodeURIComponent(u.nome)}`
                    : isEscola
                    ? `/unidades-escolares`
                    : isSocial
                    ? `/socioassistencial`
                    : `/servicos/cultura`;

                const tipoLabel = isUbs
                    ? "Unidade de Saúde (UBS)"
                    : isEscola
                    ? "Unidade Escolar / Creche"
                    : isSocial
                    ? "Unidade Socioassistencial"
                    : `Unidade • ${u.tipo}`;

                results.push({
                    id: `uni-${u.id}`,
                    tipo: "unidade",
                    tipoLabel,
                    titulo: u.nome,
                    resumo: `${u.endereco}${u.horario ? ` • Horário: ${u.horario}` : ""}${u.telefone ? ` • Tel: ${u.telefone}` : ""}`,
                    href,
                    meta: {
                        subtipo: u.subtipo || u.tipo,
                        horario: u.horario,
                        endereco: u.endereco,
                        telefone: u.telefone,
                    },
                    score: uScore + 35,
                });
            }
        }
    }

    // 5. NOTÍCIAS E AVISOS PUBLICADOS (Exclui rascunhos)
    if (!filterCat || filterCat === "noticia") {
        for (const n of noticias) {
            const isAviso = (n as any).tipoPublicacao === "aviso";
            const validoAte = (n as any).validoAte;
            const vigente = isAviso ? isAvisoVigente(validoAte) : true;

            const nScore = scoreTextMatch(
                queryNorm,
                tokens,
                n.titulo,
                `${n.resumo || ""} ${n.secretaria?.nome || ""}`,
                isAviso ? ["aviso", "comunicado", "edital"] : ["noticia"]
            );

            if (nScore > 0) {
                const dataPub = formatDateFortaleza(n.publicadoEm || n.criadoEm, "short");
                const prazoInfo =
                    isAviso && validoAte
                        ? vigente
                            ? ` • Prazo até ${formatDateFortaleza(validoAte, "short")}`
                            : ` • Prazo encerrado em ${formatDateFortaleza(validoAte, "short")}`
                        : "";

                results.push({
                    id: `not-${n.id}`,
                    tipo: "noticia",
                    tipoLabel: isAviso
                        ? vigente
                            ? "Aviso Oficial Vigente"
                            : "Aviso Oficial (Histórico)"
                        : "Notícia Publicada",
                    titulo: n.titulo,
                    resumo: `${n.resumo}${prazoInfo}`,
                    href: `/noticias/${n.slug}`,
                    meta: {
                        data: dataPub,
                        orgao: n.secretaria?.nome || "Prefeitura de São Tomé",
                    },
                    score: nScore,
                });
            }
        }
    }

    // 6. DOCUMENTOS OFICIAIS E LEGISLAÇÃO (Número, Ano, Tipo, Ementa e link direto)
    if (!filterCat || filterCat === "documento") {
        for (const l of legislacaoAll) {
            let lScore = 0;
            const recNumInt = parseActNumberInt(l.numero);
            const recTypeNorm = normalizeSearchText(l.tipo);
            const recCatNorm = normalizeSearchText(l.categoria);

            // Verifica correspondência de número e ano do ato
            const typeMatches =
                !parsedAct.actType ||
                recTypeNorm.includes(parsedAct.actType) ||
                recCatNorm.includes(parsedAct.actType);

            if (
                parsedAct.actNumberInt !== null &&
                recNumInt === parsedAct.actNumberInt &&
                typeMatches
            ) {
                if (parsedAct.actYear !== null) {
                    if (l.ano === parsedAct.actYear) {
                        // Correspondência exata de número + ano (ex: Lei 1451/2026 ou 028/2026)
                        lScore = 1300;
                    }
                } else {
                    // Correspondência exata do número do ato
                    lScore = 980;
                }
            }

            if (lScore === 0) {
                // Se o usuário filtrou um ano específico e o ato é de outro ano, reduz ou descarta se for busca puramente numérica
                if (
                    parsedAct.actYear !== null &&
                    parsedAct.actNumberInt !== null &&
                    l.ano !== parsedAct.actYear
                ) {
                    continue;
                }

                const tipoLabel = getLegislacaoTipoLabel(l.tipo, l.categoria);
                const numeroExibicao = l.numero.includes(String(l.ano))
                    ? l.numero
                    : `${l.numero}/${l.ano}`;

                lScore = scoreTextMatch(
                    queryNorm,
                    tokens,
                    `${tipoLabel} Nº ${numeroExibicao}`,
                    `${l.ementa || ""} ${l.ano}`,
                    [l.tipo, l.categoria || "", l.numero, `${recNumInt || ""}/${l.ano}`]
                );
            }

            if (lScore > 0) {
                const tipoLabel = getLegislacaoTipoLabel(l.tipo, l.categoria);
                const numeroFormatado = l.numero.endsWith(`/${l.ano}`)
                    ? l.numero
                    : `${l.numero}/${l.ano}`;
                const docFileUrl = isValidPublicUrl(l.arquivo)
                    ? l.arquivo!
                    : isValidPublicUrl(l.documentUrl)
                    ? l.documentUrl!
                    : null;

                results.push({
                    id: `leg-${l.id}`,
                    tipo: "documento",
                    tipoLabel: `${tipoLabel} • ${l.ano}`,
                    titulo: `${tipoLabel} nº ${numeroFormatado}`,
                    resumo: l.ementa,
                    href: `/transparencia/legislacao?q=${encodeURIComponent(l.numero)}&ano=${l.ano}`,
                    documentUrl: docFileUrl,
                    meta: {
                        numero: numeroFormatado,
                        ano: l.ano,
                        subtipo: tipoLabel,
                    },
                    score: lScore,
                });
            }
        }

        for (const d of documentos) {
            const dScore = scoreTextMatch(
                queryNorm,
                tokens,
                d.titulo,
                `${d.descricao || ""} ${d.tipo} ${d.ano || ""} ${d.secretaria || ""}`,
                ["documento", d.tipo]
            );
            if (dScore > 0) {
                const docFileUrl = isValidPublicUrl(d.arquivo)
                    ? d.arquivo!
                    : isValidPublicUrl(d.documentUrl)
                    ? d.documentUrl!
                    : null;

                const internalHref =
                    d.tipo === "plano-saude"
                        ? "/transparencia/plano-saude"
                        : d.tipo === "plano-educacao"
                        ? "/transparencia/plano-educacao"
                        : "/transparencia/publicacoes";

                results.push({
                    id: `doc-${d.id}`,
                    tipo: "documento",
                    tipoLabel: `Documento Oficial${d.ano ? ` • ${d.ano}` : ""}`,
                    titulo: d.titulo,
                    resumo: d.descricao || `Documento público oficial (${d.tipo}) publicado no acervo municipal.`,
                    href: internalHref,
                    documentUrl: docFileUrl,
                    meta: {
                        ano: d.ano,
                        subtipo: d.tipo,
                        orgao: d.secretaria || d.orgaoResponsavel,
                    },
                    score: dScore + 20,
                });
            }
        }

        for (const ds of documentosSaude) {
            const dsScore = scoreTextMatch(
                queryNorm,
                tokens,
                ds.titulo,
                `${ds.descricao || ""} ${ds.categoria} ${ds.anoExercicio} ${ds.numeroResolucao || ""}`,
                ["plano de saude", "pms", "pas", "rag", "saude"]
            );
            if (dsScore > 0) {
                const docFileUrl = isValidPublicUrl(ds.linkDocumento) ? ds.linkDocumento! : null;
                results.push({
                    id: `docsaude-${ds.id}`,
                    tipo: "documento",
                    tipoLabel: `Instrumento da Saúde • ${ds.anoExercicio}`,
                    titulo: ds.titulo,
                    resumo: ds.descricao || `${ds.statusConselho || "Documento oficial da Saúde"} (${ds.anoExercicio}).`,
                    href: "/transparencia/plano-saude",
                    documentUrl: docFileUrl,
                    meta: {
                        numero: ds.numeroResolucao,
                        ano: ds.anoExercicio,
                        subtipo: ds.categoria.toUpperCase(),
                    },
                    score: dsScore + 15,
                });
            }
        }
    }

    // Ordena por maior relevância (priorizando correspondências exatas)
    results.sort((a, b) => b.score - a.score);

    return {
        query,
        total: results.length,
        results: results.slice(0, limit),
        externalAccesses: externalCatalog,
    };
}
