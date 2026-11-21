export const FEMURN_STABLE_SEARCH_URL = "https://www.diariomunicipal.com.br/femurn/pesquisar";
export const FEMURN_SAO_TOME_INSTRUCTION =
    "Na pesquisa da FEMURN, selecione Prefeitura Municipal de São Tomé.";

/**
 * Verifica se uma URL pode ser exibida publicamente.
 * Rejeita strings vazias, "#", "javascript:", ou placeholders inválidos.
 */
export function isValidPublicUrl(url?: string | null): boolean {
    if (!url) return false;
    const trimmed = String(url).trim();
    if (!trimmed || trimmed === "#" || trimmed === "http://#" || trimmed === "https://#") {
        return false;
    }
    if (/^javascript:/i.test(trimmed)) return false;
    if (trimmed.startsWith("/")) return trimmed.length > 1 || trimmed === "/";
    if (/^https?:\/\/[^/\s]+\.[^/\s]+/i.test(trimmed)) return true;
    if (/^(mailto:|tel:)/i.test(trimmed)) return trimmed.length > 7;
    return false;
}

/**
 * Normaliza URLs do Diário Oficial da FEMURN para remover tokens de sessão (_token)
 * e filtros fixos de datas antigas (dataInicio / dataFim).
 */
export function sanitizeDiarioOficialUrl(url?: string | null): string {
    if (!isValidPublicUrl(url)) return FEMURN_STABLE_SEARCH_URL;
    const trimmed = String(url).trim();
    if (/diariomunicipal\.com\.br\/femurn/i.test(trimmed)) {
        if (
            trimmed.includes("_token") ||
            trimmed.includes("dataInicio") ||
            trimmed.includes("dataFim") ||
            trimmed.includes("entidadeUsuaria")
        ) {
            return FEMURN_STABLE_SEARCH_URL;
        }
    }
    return trimmed;
}

/**
 * Constrói o link oficial de WhatsApp somente quando há número institucional confirmado.
 * Nunca deduz WhatsApp a partir do telefone geral e nunca retorna "#".
 */
export function buildWhatsAppHref(rawWhatsapp?: string | null): string | null {
    if (!rawWhatsapp) return null;
    const digits = String(rawWhatsapp).replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) return null;
    const withCountry = digits.startsWith("55") && digits.length >= 12 ? digits : `55${digits}`;
    return `https://wa.me/${withCountry}`;
}

/**
 * Gera um rótulo curto e acessível para o link de uma secretaria,
 * sem incluir o texto de competências no nome acessível do link.
 * Ex: "Conhecer a Secretaria de Saúde", "Conhecer a Controladoria Municipal".
 */
export function getSecretariaLinkLabel(nome: string): string {
    const clean = (nome || "Secretaria").trim();
    const lower = clean.toLowerCase();
    if (
        lower.startsWith("gabinete") ||
        lower.startsWith("fundo") ||
        lower.startsWith("conselho") ||
        lower.startsWith("instituto")
    ) {
        return `Conhecer o ${clean}`;
    }
    return `Conhecer a ${clean}`;
}

/**
 * Retorna uma frase curta e clara sobre o atendimento da secretaria para o diretório da home,
 * evitando exibir parágrafos longos de competências administrativas na página inicial.
 */
export function getSecretariaShortSummary(sec: {
    nome: string;
    slug?: string;
    resumoAtendimento?: string | null;
    descricao?: string | null;
}): string {
    if (sec.resumoAtendimento && sec.resumoAtendimento.trim()) {
        return sec.resumoAtendimento.trim();
    }

    const text = `${sec.slug || ""} ${sec.nome || ""}`.toLowerCase();

    if (text.includes("saude") || text.includes("saúde")) {
        return "Atendimento da rede municipal do SUS, unidades básicas de saúde, vacinação, farmácia e regulação de exames.";
    }
    if (text.includes("educacao") || text.includes("educação")) {
        return "Gestão das escolas e creches municipais, matrículas, transporte escolar, cultura e atividades esportivas.";
    }
    if (text.includes("assistencia") || text.includes("assistência") || text.includes("social") || text.includes("trabalho")) {
        return "Atendimento socioassistencial, Cadastro Único, CRAS, programas sociais, habitação e apoio às famílias.";
    }
    if (text.includes("financas") || text.includes("finanças") || text.includes("tribut")) {
        return "Atendimento tributário ao contribuinte, emissão de guias de IPTU, certidões, alvarás e nota fiscal.";
    }
    if (text.includes("obras") || text.includes("urban") || text.includes("transporte")) {
        return "Manutenção urbana, limpeza pública, iluminação, conservação de vias e acompanhamento de obras.";
    }
    if (text.includes("agricultura") || text.includes("meio-ambiente") || text.includes("turismo")) {
        return "Apoio ao produtor rural, abastecimento hídrico, preservação ambiental e incentivo ao turismo local.";
    }
    if (text.includes("administracao") || text.includes("administração") || text.includes("planejamento")) {
        return "Gestão administrativa, atendimento ao servidor público, recursos humanos, patrimônio e protocolo.";
    }
    if (text.includes("ouvidoria")) {
        return "Recebimento e acompanhamento de manifestações, sugestões, elogios, reclamações, denúncias e pedidos e-SIC.";
    }
    if (text.includes("controladoria")) {
        return "Controle interno, fiscalização contábil e apoio à transparência pública e conformidade legal.";
    }
    if (text.includes("procuradoria")) {
        return "Representação jurídica do município, consultoria legal administrativa e cobrança da dívida ativa.";
    }
    if (text.includes("governo") || text.includes("gabinete")) {
        return "Articulação institucional, atendimento de gabinete e coordenação das ações do Poder Executivo.";
    }

    if (sec.descricao && sec.descricao.trim()) {
        const firstSentence = sec.descricao.trim().split(/(?<=\.)\s+/)[0];
        if (firstSentence.length <= 135) return firstSentence;
        return firstSentence.slice(0, 132).trim() + "…";
    }

    return "Atendimento presencial e orientação sobre serviços públicos da pasta.";
}

/**
 * Classifica a secretaria em uma área temática para o diretório compacto da página inicial.
 */
export function getSecretariaAreaGroup(sec: { nome: string; slug?: string }): string {
    const text = `${sec.slug || ""} ${sec.nome || ""}`.toLowerCase();
    if (
        text.includes("saude") ||
        text.includes("saúde") ||
        text.includes("educacao") ||
        text.includes("educação") ||
        text.includes("assistencia") ||
        text.includes("assistência") ||
        text.includes("social")
    ) {
        return "Atendimento ao Cidadão: Saúde, Educação e Assistência Social";
    }
    if (
        text.includes("obras") ||
        text.includes("agricultura") ||
        text.includes("financas") ||
        text.includes("finanças") ||
        text.includes("tribut")
    ) {
        return "Serviços Urbanos, Desenvolvimento Rural e Tributos";
    }
    return "Gestão, Atendimento Institucional e Controle";
}
