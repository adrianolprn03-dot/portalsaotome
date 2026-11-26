const MESES_PT: Record<string, number> = {
    janeiro: 1,
    fevereiro: 2,
    marco: 3,
    "março": 3,
    abril: 4,
    maio: 5,
    junho: 6,
    julho: 7,
    agosto: 8,
    setembro: 9,
    outubro: 10,
    novembro: 11,
    dezembro: 12,
};

function limparHtml(html: string) {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&ordm;/gi, "º")
        .replace(/&ordf;/gi, "ª")
        .replace(/&oacute;/gi, "ó")
        .replace(/&aacute;/gi, "á")
        .replace(/&eacute;/gi, "é")
        .replace(/&iacute;/gi, "í")
        .replace(/&uacute;/gi, "ú")
        .replace(/&atilde;/gi, "ã")
        .replace(/&otilde;/gi, "õ")
        .replace(/&ccedil;/gi, "ç")
        .replace(/&amp;/gi, "&")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export async function buscarTextoMateriaFemurn(codigo: string): Promise<string> {
    if (!/^[A-F0-9]{8}$/.test(codigo)) return "";
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    try {
        const res = await fetch(`https://www.diariomunicipal.com.br/femurn/materia/${codigo}`, {
            headers: { "User-Agent": "PortalSaoTome/1.0" },
            signal: ctrl.signal,
            cache: "no-store",
        });
        if (!res.ok) return "";
        const html = await res.text();
        return limparHtml(html);
    } catch {
        return "";
    } finally {
        clearTimeout(timer);
    }
}

export function ehPortariaConcessaoDeslocamento(tipo: string, ementa: string, texto?: string): boolean {
    const tipoNorm = tipo.toUpperCase();
    if (tipoNorm !== "PORTARIA" && tipoNorm !== "PORTARIA_DIARIA") return false;
    const base = [ementa, texto].filter(Boolean).join(" ");
    if (!base) return tipoNorm === "PORTARIA_DIARIA";

    const confirmaConcessao = /\bconceder\b[\s\S]{0,280}\bdi[aá]ria/i.test(base);
    const confirmaDeslocamento = /\bdeslocamento\b/i.test(base);
    if (confirmaConcessao && confirmaDeslocamento) return true;

    if (!texto?.trim() && tipoNorm === "PORTARIA_DIARIA") {
        return /concess[aã]o\s+de\s+di[aá]ria/i.test(ementa);
    }
    return false;
}

function parseNumeroPortaria(texto: string, numeroDoc: string, ano: number): string | null {
    const m = /PORTARIA(?:\s+DE\s+CONCESS[AÃ]O\s+DE\s+DI[AÁ]RIA)?\s+N[º°.]*\s*(\d{1,6})(?:\s*\/\s*(\d{4}))?/i.exec(texto);
    if (m) {
        return `${m[1]}/${m[2] || ano}`;
    }
    const clean = numeroDoc.trim();
    if (!clean) return null;
    return clean.includes("/") ? clean : `${clean}/${ano}`;
}

function parseDataAtoBase(dataAto: string, publicadoEm: string, texto: string): Date {
    if (dataAto && /^\d{4}-\d{2}-\d{2}$/.test(dataAto)) {
        return new Date(`${dataAto}T12:00:00.000Z`);
    }
    const m = /DE\s+(\d{1,2})\s+DE\s+([A-Za-zçÇ]+)\s+DE\s+(\d{4})/i.exec(texto);
    if (m) {
        const mes = MESES_PT[m[2].toLowerCase()];
        if (mes) {
            return new Date(Date.UTC(Number(m[3]), mes - 1, Number(m[1]), 12, 0, 0));
        }
    }
    return new Date(`${publicadoEm}T12:00:00.000Z`);
}

function parseDataDeslocamento(texto: string, dataBase: Date): { dataInicio: Date; dataFim: Date } {
    const year = dataBase.getUTCFullYear();
    const month = dataBase.getUTCMonth();

    const periodoMes = /nos?\s+dias?\s+(\d{1,2})\s+(?:e|a)\s+(\d{1,2})\s+do\s+corrente\s+m[eê]s/i.exec(texto);
    if (periodoMes) {
        return {
            dataInicio: new Date(Date.UTC(year, month, Number(periodoMes[1]), 12, 0, 0)),
            dataFim: new Date(Date.UTC(year, month, Number(periodoMes[2]), 12, 0, 0)),
        };
    }

    const diaCorrente = /no\s+dia\s+(\d{1,2})\s+do\s+corrente\s+m[eê]s/i.exec(texto);
    if (diaCorrente) {
        const d = new Date(Date.UTC(year, month, Number(diaCorrente[1]), 12, 0, 0));
        return { dataInicio: d, dataFim: d };
    }

    const dataExplicita = /no\s+dia\s+(\d{1,2})\s+de\s+([A-Za-zçÇ]+)\s+de\s+(\d{4})/i.exec(texto);
    if (dataExplicita) {
        const mesNum = MESES_PT[dataExplicita[2].toLowerCase()];
        if (mesNum) {
            const d = new Date(Date.UTC(Number(dataExplicita[3]), mesNum - 1, Number(dataExplicita[1]), 12, 0, 0));
            return { dataInicio: d, dataFim: d };
        }
    }

    return { dataInicio: dataBase, dataFim: dataBase };
}

export type DadosDiariaExtraida = {
    codigoPermanente: string;
    servidor: string;
    cargo: string;
    destino: string;
    tipoDestino: string;
    motivo: string;
    dataInicio: Date;
    dataFim: Date;
    valor: number;
    valorUnitario: number;
    quantidadeDias: number;
    secretaria: string;
    mes: number;
    ano: number;
    numeroPortaria: string | null;
    portariaUrl: string;
    fonteOrigem: string;
    situacaoPublicacao: string;
};

export function extrairDadosDiariaFemurn(
    texto: string,
    doc: {
        codigo: string;
        numero: string;
        data_ato: string;
        publicado_em: string;
        ementa: string;
        orgao: string;
        edicao: string;
    }
): DadosDiariaExtraida {
    const dataBase = parseDataAtoBase(doc.data_ato, doc.publicado_em, texto);
    const { dataInicio, dataFim } = parseDataDeslocamento(texto, dataBase);
    const ano = dataInicio.getUTCFullYear();
    const mes = dataInicio.getUTCMonth() + 1;

    // Servidor e cargo: "CONCEDER a Sra. NOME, Cargo, inscrita no CPF..."
    let servidor = "Servidor não identificado";
    let cargo = "Não informado";
    const servMatch = /CONCEDER\s+(?:a|ao)\s+(?:Sra?\.?|Sr\.?)\s+([^,]+),\s*([^,]+?)(?:,\s*(?:inscrit[oa]|portador|matr[ií]cula|CPF|RG|a\s+quantia))/i.exec(texto);
    if (servMatch) {
        servidor = servMatch[1].trim();
        cargo = servMatch[2].trim();
    }

    // Valor: "R$ 150,00"
    let valor = 0;
    const valMatch = /quantia\s+de\s+R\$\s*([\d.]+,\d{2})/i.exec(texto) || /R\$\s*([\d.]+,\d{2})/i.exec(texto);
    if (valMatch) {
        valor = parseFloat(valMatch[1].replace(/\./g, "").replace(",", ".")) || 0;
    }

    // Quantidade de diárias: "01 (uma) diária" ou "1,5 diárias"
    let quantidadeDias = 1;
    const qtdMatch = /referente\s+a\s+(\d+(?:[.,]\d+)?)\s*(?:\([^)]+\))?\s*di[aá]ria/i.exec(texto);
    if (qtdMatch) {
        quantidadeDias = parseFloat(qtdMatch[1].replace(",", ".")) || 1;
    }
    const valorUnitario = quantidadeDias > 0 ? Number((valor / quantidadeDias).toFixed(2)) : valor;

    // Destino: "deslocamento a cidade de Natal, no Estado do Rio Grande do Norte"
    let destino = "Não informado";
    const destMatch = /deslocamento\s+(?:a|à|para\s+a?)\s+(?:cidade\s+de\s+)?([^,.;]+?)(?:,\s*no\s+(?:Estado\s+do\s+)?Rio\s+Grande\s+do\s+Norte|\s*[-/]\s*RN|\s+no\s+dia|\s*,)/i.exec(texto);
    if (destMatch) {
        const cidade = destMatch[1].trim();
        destino = /\/[A-Z]{2}$/.test(cidade) ? cidade : `${cidade}/RN`;
    }
    const tipoDestino = /\/RN$/i.test(destino) || /Rio\s+Grande\s+do\s+Norte/i.test(texto) ? "estadual" : "nacional";

    // Motivo: texto após "ou seja, para ..." ou "para ..." antes de "Art. 2º"
    let motivo = doc.ementa.trim() || "Concessão de diária";
    const motMatch = /(?:ou\s+seja,\s*(?:para\s+)?|finalidade\s+de\s+)([\s\S]+?)(?=\s*Art\.\s*2[º°]|\s*Registre-se)/i.exec(texto);
    if (motMatch && motMatch[1].trim().length >= 8) {
        const rawMotivo = motMatch[1].trim();
        motivo = rawMotivo.charAt(0).toUpperCase() + rawMotivo.slice(1);
    }

    return {
        codigoPermanente: doc.codigo,
        servidor,
        cargo,
        destino,
        tipoDestino,
        motivo,
        dataInicio,
        dataFim,
        valor,
        valorUnitario,
        quantidadeDias,
        secretaria: doc.orgao.trim() || "SECRETARIA MUNICIPAL DE GOVERNO",
        mes,
        ano,
        numeroPortaria: parseNumeroPortaria(texto, doc.numero, ano),
        portariaUrl: `/api/diarias/femurn/${doc.codigo}`,
        fonteOrigem: `FEMURN (Edição ${doc.edicao})`,
        situacaoPublicacao: "rascunho",
    };
}
