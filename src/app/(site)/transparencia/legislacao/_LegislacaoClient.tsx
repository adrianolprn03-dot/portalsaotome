"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    FaFilePdf,
    FaCalendarDays,
    FaGavel,
    FaFileSignature,
    FaScroll,
    FaFileLines,
    FaScaleBalanced,
    FaFileCircleCheck,
    FaGlobe,
    FaArrowUpRightFromSquare,
} from "react-icons/fa6";
import { exportToCSV, exportToPDF, exportToXLSX } from "@/lib/exportUtils";
import { MUNICIPIO } from "@/config/municipio";
import { isValidPublicUrl } from "@/lib/portal-links";
import LRFDocumentCatalog, {
    type ActiveFilterBadge,
    type CatalogCategoryMeta,
    type CatalogItem,
    type CatalogStatCard,
} from "@/components/transparencia/LRFDocumentCatalog";

export type Legislacao = {
    id: string;
    tipo: string;
    numero: string;
    ano: number;
    dataAto?: string | null;
    ementa: string;
    arquivo: string | null;
    documentUrl?: string | null;
    criadoEm: string;
    atualizadoEm?: string | null;
    dataAtualizacaoEfetiva?: string | null;
    femurn?: { codigo: string; publicadoEm: string; edicao: string; orgao: string } | null;
};

export interface LinkExternoItem {
    id: string;
    titulo: string;
    descricao?: string | null;
    url: string;
    hostname: string;
}

export type LegislacaoIconKey = "scale" | "gavel" | "file-check" | "file-lines" | "scroll";

const ICON_MAP: Record<LegislacaoIconKey, React.ReactNode> = {
    scale: <FaScaleBalanced />,
    gavel: <FaGavel />,
    "file-check": <FaFileCircleCheck />,
    "file-lines": <FaFileLines />,
    scroll: <FaScroll />,
};

const parseNumero = (numStr: string): number => {
    if (!numStr) return 0;
    const match = numStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
};

const safeDecode = (str: string): string => {
    try {
        return decodeURIComponent(str);
    } catch {
        return str;
    }
};

const MONTH_MAP: Record<string, number> = {
    janeiro: 1,
    jan: 1,
    fevereiro: 2,
    fev: 2,
    marco: 3,
    março: 3,
    mar: 3,
    abril: 4,
    abr: 4,
    maio: 5,
    mai: 5,
    junho: 6,
    jun: 6,
    julho: 7,
    jul: 7,
    agosto: 8,
    ago: 8,
    setembro: 9,
    set: 9,
    outubro: 10,
    out: 10,
    novembro: 11,
    nov: 11,
    dezembro: 12,
    dez: 12,
};

export const MESES = [
    { v: "", l: "Todos os meses" },
    { v: "1", l: "Janeiro" },
    { v: "2", l: "Fevereiro" },
    { v: "3", l: "Março" },
    { v: "4", l: "Abril" },
    { v: "5", l: "Maio" },
    { v: "6", l: "Junho" },
    { v: "7", l: "Julho" },
    { v: "8", l: "Agosto" },
    { v: "9", l: "Setembro" },
    { v: "10", l: "Outubro" },
    { v: "11", l: "Novembro" },
    { v: "12", l: "Dezembro" },
];

export function getAtoMetadata(l: Legislacao) {
    const rawAno = typeof l.ano === "number" ? l.ano : parseInt(String(l.ano), 10) || 0;
    let year = rawAno === 2923 ? 2023 : rawAno > 2050 || rawAno < 1900 ? 2024 : rawAno;
    let month: number | null = null;
    let day: number | null = null;

    if (l.dataAto) {
        const d = new Date(l.dataAto);
        if (!isNaN(d.getTime())) {
            return {
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                day: d.getDate(),
                hasExactDate: true,
                date: d,
                displayDate: d.toLocaleDateString("pt-BR"),
            };
        }
    }

    if (l.femurn?.publicadoEm) {
        const d = new Date(l.femurn.publicadoEm);
        if (!isNaN(d.getTime())) {
            return {
                year: year || d.getFullYear(),
                month: d.getMonth() + 1,
                day: d.getDate(),
                hasExactDate: true,
                date: d,
                displayDate: d.toLocaleDateString("pt-BR"),
            };
        }
    }

    const textToSearch = safeDecode(
        (l.arquivo || "") + " " + (l.ementa || "") + " " + (l.numero || "")
    );

    const writtenMatch = textToSearch.match(
        /(?:de[\s\-_]+)?(\d{1,2})[\s\-_]+de[\s\-_]+(janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)(?:[\s\-_]+de[\s\-_]+(\d{4}))?/i
    );
    if (writtenMatch) {
        day = parseInt(writtenMatch[1], 10);
        const mesNome = writtenMatch[2].toLowerCase();
        month = MONTH_MAP[mesNome] || null;
        if (writtenMatch[3]) {
            const parsedYear = parseInt(writtenMatch[3], 10);
            if (parsedYear >= 1990 && parsedYear <= 2050) year = parsedYear;
        }
        if (month && day) {
            const d = new Date(year, month - 1, day);
            return {
                year,
                month,
                day,
                hasExactDate: true,
                date: d,
                displayDate: `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`,
            };
        }
    }

    const numericMatch = textToSearch.match(
        /(?:em|data:?[\s\-_]*)?(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/i
    );
    if (numericMatch) {
        day = parseInt(numericMatch[1], 10);
        month = parseInt(numericMatch[2], 10);
        const parsedYear = parseInt(numericMatch[3], 10);
        if (parsedYear >= 1990 && parsedYear <= 2050) year = parsedYear;
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            const d = new Date(year, month - 1, day);
            return {
                year,
                month,
                day,
                hasExactDate: true,
                date: d,
                displayDate: `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`,
            };
        }
    }

    const wpMatch = (l.arquivo || "").match(/\/(\d{4})\/(\d{2})\//);
    if (wpMatch) {
        const wpYear = parseInt(wpMatch[1], 10);
        const wpMonth = parseInt(wpMatch[2], 10);
        const targetYear = year && year >= 1990 && year <= 2050 ? year : wpYear;
        if (wpMonth >= 1 && wpMonth <= 12) {
            const d = new Date(targetYear, wpMonth - 1, 1);
            const nomeMes = MESES.find((m) => m.v === String(wpMonth))?.l || `Mês ${wpMonth}`;
            return {
                year: targetYear,
                month: wpMonth,
                day: 1,
                hasExactDate: false,
                date: d,
                displayDate: `${nomeMes} de ${targetYear}`,
            };
        }
    }

    return {
        year,
        month: null,
        day: null,
        hasExactDate: false,
        date: new Date(year, 0, 1),
        displayDate: `Exercício ${year}`,
    };
}

function normalizeActTypeKey(rawTipo: string): string {
    const clean = (rawTipo || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    if (clean === "lei-organica" || clean === "lei organica") return "lei-organica";
    if (clean === "resolucao" || clean === "resolucoes") return "resolucao";
    if (clean === "decreto" || clean === "decreto municipal" || clean === "decretos")
        return "decreto";
    if (clean === "portaria" || clean === "portarias") return "portaria";
    if (clean === "portaria_diaria" || clean === "portaria de diaria") return "portaria_diaria";
    if (clean === "lei" || clean === "lei municipal" || clean === "leis") return "lei";
    if (clean === "loa") return "LOA";
    if (clean === "ldo") return "LDO";
    if (clean === "ppa") return "PPA";
    return rawTipo || "outros";
}

const getActCategoryMeta = (catKey: string): CatalogCategoryMeta => {
    switch (catKey) {
        case "lei-organica":
            return {
                title: "Lei Orgânica do Município",
                subtitle: "Carta Magna municipal, emendas e texto consolidado",
                badgeStyle: "bg-purple-50 text-purple-700 border-purple-200",
                icon: <FaScroll className="text-purple-600" size={16} />,
                itemSingular: "ato",
                itemPlural: "atos",
            };
        case "lei":
            return {
                title: "Leis Municipais",
                subtitle: "Leis ordinárias e complementares sancionadas pelo Executivo",
                badgeStyle: "bg-blue-50 text-[#01b0ef] border-blue-200",
                icon: <FaScaleBalanced className="text-[#01b0ef]" size={16} />,
                itemSingular: "lei",
                itemPlural: "leis",
            };
        case "decreto":
            return {
                title: "Decretos Executivos",
                subtitle: "Atos normativos e regulamentares emitidos pelo Prefeito",
                badgeStyle: "bg-indigo-50 text-indigo-700 border-indigo-200",
                icon: <FaGavel className="text-indigo-600" size={16} />,
                itemSingular: "decreto",
                itemPlural: "decretos",
            };
        case "portaria":
        case "portaria_diaria":
            return {
                title: catKey === "portaria_diaria" ? "Portarias de Diárias" : "Portarias Municipais",
                subtitle: "Atos administrativos de pessoal, designações e concessões",
                badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
                icon: <FaFileSignature className="text-emerald-600" size={16} />,
                itemSingular: "portaria",
                itemPlural: "portarias",
            };
        case "resolucao":
            return {
                title: "Resoluções Municipais",
                subtitle: "Deliberações, normativas de órgãos e conselhos municipais",
                badgeStyle: "bg-amber-50 text-amber-800 border-amber-200",
                icon: <FaFileLines className="text-amber-600" size={16} />,
                itemSingular: "resolução",
                itemPlural: "resoluções",
            };
        default:
            return {
                title: catKey || "Atos Oficiais",
                subtitle: "Normativas e publicações legais do município",
                badgeStyle: "bg-slate-100 text-slate-700 border-slate-200",
                icon: <FaFilePdf className="text-slate-600" size={16} />,
                itemSingular: "ato",
                itemPlural: "atos",
            };
    }
};

const getActPriority = (catKey: string): number => {
    const order: Record<string, number> = {
        "lei-organica": 1,
        lei: 2,
        decreto: 3,
        portaria: 4,
        portaria_diaria: 5,
        resolucao: 6,
    };
    return order[catKey] ?? 10;
};

const DOC_TYPES_BY_ATO: Record<string, string[]> = {
    TODOS: ["Portaria", "Decreto", "Decreto Municipal", "Resolução", "Lei Municipal", "Lei Orgânica", "lei-organica", "resolucao"],
    lei: ["Lei Municipal"],
    decreto: ["Decreto", "Decreto Municipal"],
    portaria: ["Portaria"],
    resolucao: ["Resolução", "resolucao"],
    "lei-organica": ["Lei Orgânica", "lei-organica"],
};

const tipoLabelsShort: Record<string, string> = {
    "lei-organica": "Lei Orgânica",
    lei: "Lei Municipal",
    decreto: "Decreto",
    portaria: "Portaria",
    portaria_diaria: "Portaria de Diária",
    resolucao: "Resolução",
};

interface LegislacaoClientProps {
    initialTipo?: string;
    hideTipoFilter?: boolean;
    pageTitle?: string;
    pageSubtitle?: string;
    breadcrumbLabel?: string;
    iconKey?: LegislacaoIconKey;
    yearSubtitle?: string;
    linksExternos?: LinkExternoItem[];
}

export default function LegislacaoClient({
    initialTipo = "",
    hideTipoFilter = false,
    pageTitle,
    pageSubtitle,
    breadcrumbLabel,
    iconKey = "scale",
    yearSubtitle = "Atos Normativos e Legislação Municipal",
    linksExternos = [],
}: LegislacaoClientProps) {
    const [leis, setLeis] = useState<Legislacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [tipoFiltro, setTipoFiltro] = useState(initialTipo || "TODOS");
    const [anoFiltro, setAnoFiltro] = useState<number | null>(null);
    const [mesFiltro, setMesFiltro] = useState<number | null>(null);
    const [buscaFiltro, setBuscaFiltro] = useState("");
    const [ordem, setOrdem] = useState<"desc" | "asc">("desc");

    const isStandalone = Boolean(pageTitle);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        const qParam = params.get("q") || params.get("busca");
        const anoParam = params.get("ano");
        const tipoParam = params.get("tipo");
        if (qParam && qParam.trim()) {
            setBuscaFiltro(qParam.trim());
        }
        if (anoParam && /^\d{4}$/.test(anoParam)) {
            setAnoFiltro(Number(anoParam));
        }
        if (tipoParam && !hideTipoFilter) {
            setTipoFiltro(tipoParam);
        }
    }, [hideTipoFilter]);

    const fetchLeis = useCallback(async () => {
        setLoading(true);
        try {
            const legQuery = new URLSearchParams({ limit: "5000" });
            if (tipoFiltro && tipoFiltro !== "TODOS") {
                legQuery.append("tipo", tipoFiltro);
            }

            const docTipos = DOC_TYPES_BY_ATO[tipoFiltro] || DOC_TYPES_BY_ATO[tipoFiltro.toLowerCase()];
            const requests: Promise<Response>[] = [fetch(`/api/legislacao?${legQuery.toString()}`)];
            if (docTipos && docTipos.length > 0 && tipoFiltro !== "portaria_diaria") {
                requests.push(
                    fetch(`/api/documentos?tipo=${encodeURIComponent(docTipos.join(","))}`)
                );
            }

            const responses = await Promise.all(requests);
            const legData = responses[0]?.ok ? await responses[0].json() : { items: [] };
            const legItems: Legislacao[] = Array.isArray(legData?.items) ? legData.items : [];

            const combined: Legislacao[] = [...legItems];
            const seenUrls = new Set<string>(
                legItems
                    .map((i) => (i.arquivo || i.documentUrl || "").toLowerCase().trim())
                    .filter(Boolean)
            );

            if (responses[1]?.ok) {
                const docsData = await responses[1].json();
                if (Array.isArray(docsData)) {
                    for (const d of docsData) {
                        if (d.ativo === false) continue;
                        const fileUrl = (d.arquivo || d.documentUrl || "").trim();
                        if (fileUrl && seenUrls.has(fileUrl.toLowerCase())) continue;
                        if (fileUrl) seenUrls.add(fileUrl.toLowerCase());

                        combined.push({
                            id: `doc-${d.id}`,
                            tipo: normalizeActTypeKey(d.tipo),
                            numero: d.competencia || "",
                            ano: d.ano || new Date(d.criadoEm).getFullYear(),
                            dataAto: d.dataAtualizacaoEfetiva || d.criadoEm,
                            ementa: d.descricao ? `${d.titulo} — ${d.descricao}` : d.titulo,
                            arquivo: d.arquivo || null,
                            documentUrl: d.documentUrl || null,
                            criadoEm: d.criadoEm,
                        });
                    }
                }
            }

            setLeis(combined);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [tipoFiltro]);

    useEffect(() => {
        fetchLeis();
    }, [fetchLeis]);

    const processedLeis = useMemo(() => {
        return leis.map((l) => {
            const normTipo = normalizeActTypeKey(l.tipo);
            return {
                ...l,
                normTipo,
                meta: getAtoMetadata(l),
            };
        });
    }, [leis]);

    const filtered = useMemo(() => {
        const norm = (s: string) =>
            (s || "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/(\d)\.(\d{3})\b/g, "$1$2")
                .trim();

        const buscaNorm = norm(buscaFiltro);
        const queryTokens = buscaNorm
            .replace(/[\/.\-,;:()"]/g, " ")
            .split(/\s+/)
            .filter((t) => t.length >= 1 && !["de", "da", "do", "n", "no", "nº"].includes(t));

        return processedLeis
            .filter((item) => {
                const matchesAno = anoFiltro === null || item.meta.year === anoFiltro;
                const matchesMes = mesFiltro === null || item.meta.month === mesFiltro;
                if (!matchesAno || !matchesMes) return false;
                if (!buscaNorm) return true;

                const numInt = parseNumero(item.numero);
                const tipoLabel = tipoLabelsShort[item.normTipo] || item.tipo;
                const candidateNorm = norm(
                    `${tipoLabel} ${item.tipo} ${item.numero} ${numInt || ""}/${item.meta.year} ${
                        numInt || ""
                    } ${item.meta.year} ${item.ementa}`
                );

                if (candidateNorm.includes(buscaNorm)) return true;
                if (queryTokens.length > 0 && queryTokens.every((tk) => candidateNorm.includes(tk))) {
                    return true;
                }
                return false;
            })
            .sort((a, b) => {
                const dir = ordem === "desc" ? 1 : -1;

                if (a.meta.year !== b.meta.year) {
                    return (b.meta.year - a.meta.year) * dir;
                }

                const numA = parseNumero(a.numero);
                const numB = parseNumero(b.numero);
                if (numA !== numB) {
                    return (numB - numA) * dir;
                }

                const timeA = a.meta.date.getTime();
                const timeB = b.meta.date.getTime();
                if (timeA !== timeB && !isNaN(timeA) && !isNaN(timeB)) {
                    return (timeB - timeA) * dir;
                }

                const updA = new Date(
                    a.dataAtualizacaoEfetiva || a.atualizadoEm || a.criadoEm || 0
                ).getTime();
                const updB = new Date(
                    b.dataAtualizacaoEfetiva || b.atualizadoEm || b.criadoEm || 0
                ).getTime();
                if (updA !== updB && !isNaN(updA) && !isNaN(updB)) {
                    return (updB - updA) * dir;
                }

                return (
                    b.numero.localeCompare(a.numero, undefined, {
                        numeric: true,
                        sensitivity: "base",
                    }) * dir
                );
            });
    }, [processedLeis, buscaFiltro, anoFiltro, mesFiltro, ordem]);

    const todosOsAnos = useMemo(() => {
        const set = new Set<number>();
        for (const item of processedLeis) {
            if (item.meta.year >= 1990 && item.meta.year <= 2050) {
                set.add(item.meta.year);
            }
        }
        return Array.from(set).sort((a, b) => b - a);
    }, [processedLeis]);

    const anosDisponiveis = useMemo(() => {
        const set = new Set<number>();
        for (const item of filtered) {
            if (item.meta.year >= 1990 && item.meta.year <= 2050) {
                set.add(item.meta.year);
            }
        }
        return Array.from(set).sort((a, b) => (ordem === "desc" ? b - a : a - b));
    }, [filtered, ordem]);

    const handleClearFilters = () => {
        setBuscaFiltro("");
        setAnoFiltro(null);
        setMesFiltro(null);
        setTipoFiltro(initialTipo || "TODOS");
        setOrdem("desc");
    };

    const handleExport = (format: "pdf" | "csv" | "xlsx") => {
        const payload = filtered.map((l) => ({
            Tipo: tipoLabelsShort[l.normTipo] || l.tipo,
            "Número": l.numero || "S/N",
            Ano: l.meta.year,
            Ementa: l.ementa,
            "Data de Publicação": l.meta.displayDate,
            Arquivo: l.arquivo || l.documentUrl || "Não disponível",
        }));

        const filename = `legislacao_${tipoFiltro.toLowerCase()}_${anoFiltro || "geral"}`;
        const exportTitle = `${pageTitle || "Relatório de Legislação Municipal"} – ${MUNICIPIO.nome}/${MUNICIPIO.uf}`;

        if (format === "csv") exportToCSV(payload, filename);
        else if (format === "xlsx") exportToXLSX(payload, filename);
        else exportToPDF(payload, filename, exportTitle);
    };

    const currentYear = new Date().getFullYear();

    const stats: CatalogStatCard[] = [
        {
            label: "Total de Atos Registrados",
            value: filtered.length,
            sublabel: "Atos catalogados na consulta",
            icon: <FaScaleBalanced size={20} />,
            variant: "primary",
        },
        {
            label: `Publicados em ${currentYear}`,
            value: processedLeis.filter((l) => l.meta.year === currentYear).length,
            sublabel: "Publicações no exercício vigente",
            icon: <FaCalendarDays size={20} />,
            variant: "emerald",
        },
        {
            label: "Arquivos Disponíveis",
            value: filtered.filter((l) => isValidPublicUrl(l.arquivo || l.documentUrl)).length,
            sublabel: "Inteiro teor disponível",
            icon: <FaFilePdf size={20} />,
            variant: "amber",
        },
    ];

    const catalogItems: CatalogItem[] = useMemo(
        () =>
            filtered.map((l) => {
                const label = tipoLabelsShort[l.normTipo] || l.tipo;
                const fileUrl = l.arquivo || l.documentUrl || null;
                const numClean = (l.numero || "").trim();
                const displayNumero = numClean
                    ? numClean.endsWith(`/${l.meta.year}`)
                        ? numClean
                        : `${numClean}/${l.meta.year}`
                    : "";
                const cardTitle = numClean ? `${label} nº ${numClean}` : l.ementa;

                const femurnMeta = l.femurn
                    ? `${l.femurn.orgao}${l.dataAto ? ` · Ato de ${l.dataAto.slice(0, 10).split("-").reverse().join("/")}` : ""}`
                    : undefined;
                const femurnUrl = l.femurn
                    ? `https://www.diariomunicipal.com.br/femurn/materia/${l.femurn.codigo}`
                    : undefined;
                const femurnLabel = l.femurn
                    ? `FEMURN · Edição ${l.femurn.edicao} · ${l.femurn.publicadoEm.slice(0, 10).split("-").reverse().join("/")}`
                    : undefined;

                return {
                    id: l.id,
                    ano: l.meta.year,
                    categoriaKey: l.normTipo,
                    badgeText: label,
                    secondaryPill: l.meta.displayDate.startsWith("Exercício")
                        ? l.meta.displayDate
                        : `Publicado em ${l.meta.displayDate}`,
                    tertiaryTag: l.femurn ? `FEMURN · Ed. ${l.femurn.edicao}` : undefined,
                    titulo: cardTitle,
                    descricao: numClean ? l.ementa : undefined,
                    metaInfo: femurnMeta,
                    fileUrl,
                    extraUrl: femurnUrl,
                    extraLabel: femurnLabel,
                    onViewTitle: displayNumero ? `${label} Nº ${displayNumero}` : cardTitle,
                };
            }),
        [filtered]
    );

    const chartSourceItems: CatalogItem[] = useMemo(
        () =>
            processedLeis.map((l) => ({
                id: l.id,
                ano: l.meta.year,
                categoriaKey: l.normTipo,
                badgeText: tipoLabelsShort[l.normTipo] || l.tipo,
                titulo: l.numero || l.ementa,
                fileUrl: l.arquivo || l.documentUrl,
            })),
        [processedLeis]
    );

    const activeFilterBadges: ActiveFilterBadge[] = [];
    if (tipoFiltro !== "TODOS" && !hideTipoFilter) {
        activeFilterBadges.push({
            key: "tipo",
            label: tipoLabelsShort[normalizeActTypeKey(tipoFiltro)] || tipoFiltro,
            colorClass: "bg-blue-50 text-[#01b0ef] border-blue-200",
            onClear: () => setTipoFiltro("TODOS"),
        });
    }
    if (anoFiltro) {
        activeFilterBadges.push({
            key: "ano",
            label: `Ano: ${anoFiltro}`,
            colorClass: "bg-amber-50 text-amber-800 border-amber-200",
            onClear: () => setAnoFiltro(null),
        });
    }
    if (mesFiltro) {
        activeFilterBadges.push({
            key: "mes",
            label: `Mês: ${MESES.find((m) => m.v === mesFiltro.toString())?.l}`,
            colorClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
            onClear: () => setMesFiltro(null),
        });
    }
    if (buscaFiltro) {
        activeFilterBadges.push({
            key: "busca",
            label: `"${buscaFiltro}"`,
            colorClass: "bg-sky-50 text-sky-800 border-sky-200",
            onClear: () => setBuscaFiltro(""),
        });
    }

    const hasActiveFilters = Boolean(
        buscaFiltro ||
            anoFiltro ||
            mesFiltro !== null ||
            (tipoFiltro !== "TODOS" && !hideTipoFilter)
    );

    const externalLinksSection =
        linksExternos.length > 0 ? (
            <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-[#e2e8f0]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-[#01b0ef] rounded-xl flex items-center justify-center shrink-0">
                            <FaGlobe size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">
                                Outras Fontes de Legislação e Publicações
                            </h3>
                            <p className="text-xs text-slate-600">
                                Portais oficiais complementares e repositórios externos integrados
                            </p>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 bg-[#f4fbff] border border-[#e2e8f0] px-3 py-1 rounded-lg">
                        {linksExternos.length}{" "}
                        {linksExternos.length === 1 ? "fonte" : "fontes"}
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {linksExternos.map((link) => (
                        <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group bg-[#f4fbff] hover:bg-white rounded-xl p-4 border border-[#e2e8f0] hover:border-[#01b0ef]/50 shadow-xs hover:shadow-sm transition-all flex items-start gap-3"
                        >
                            <div className="w-9 h-9 bg-white text-[#01b0ef] border border-[#e2e8f0] rounded-lg flex items-center justify-center shrink-0 group-hover:bg-[#01b0ef] group-hover:text-white transition-colors">
                                <FaArrowUpRightFromSquare size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <span className="font-bold text-slate-900 text-xs block mb-1 group-hover:text-[#01b0ef] transition-colors">
                                    {link.titulo}
                                </span>
                                {link.descricao && (
                                    <span className="text-[11px] text-slate-600 block mb-2 leading-relaxed line-clamp-2">
                                        {link.descricao}
                                    </span>
                                )}
                                <span className="text-[10px] text-[#01b0ef] font-bold inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-[#e2e8f0]">
                                    <FaGlobe size={9} /> {link.hostname}
                                </span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        ) : null;

    return (
        <LRFDocumentCatalog
            embedded={!isStandalone}
            title={pageTitle || "Legislação Municipal"}
            subtitle={
                pageSubtitle ||
                "Atos normativos do Município de São Tomé — leis, decretos, portarias, resoluções e Lei Orgânica."
            }
            icon={ICON_MAP[iconKey] || <FaScaleBalanced />}
            breadcrumbs={[
                { label: "Início", href: "/" },
                { label: "Transparência", href: "/transparencia" },
                { label: breadcrumbLabel || pageTitle || "Legislação" },
            ]}
            stats={stats}
            loading={loading}
            loadingText="Carregando atos normativos..."
            totalCount={processedLeis.length}
            items={catalogItems}
            chartSourceItems={chartSourceItems}
            availableYears={todosOsAnos}
            orderedYears={anosDisponiveis}
            yearSubtitle={yearSubtitle}
            listTabLabel="Atos Oficiais"
            yearGroupUnitSingular="ato"
            yearGroupUnitPlural="atos"
            counterDescription="organizados em sequência cronológica"
            tabs={
                !hideTipoFilter
                    ? [
                          { id: "TODOS", label: "Todos" },
                          { id: "lei", label: "Leis" },
                          { id: "decreto", label: "Decretos" },
                          { id: "portaria", label: "Portarias" },
                          { id: "resolucao", label: "Resoluções" },
                          { id: "lei-organica", label: "Lei Orgânica" },
                      ]
                    : undefined
            }
            tabsLabel="Tipo de Ato / Legislação"
            activeTab={tipoFiltro}
            onTabChange={setTipoFiltro}
            searchValue={buscaFiltro}
            onSearchChange={setBuscaFiltro}
            searchPlaceholder="Pesquisar por número ou ementa..."
            yearValue={anoFiltro}
            onYearChange={setAnoFiltro}
            monthOptions={MESES}
            monthValue={mesFiltro}
            onMonthChange={setMesFiltro}
            sortOrder={ordem}
            onToggleSortOrder={() => setOrdem((prev) => (prev === "desc" ? "asc" : "desc"))}
            sortAscLabel="Mais antigos primeiro"
            sortDescLabel="Mais atuais primeiro"
            onExport={handleExport}
            activeFilterBadges={activeFilterBadges}
            hasActiveFilters={hasActiveFilters}
            onClearAllFilters={handleClearFilters}
            getCategoryMeta={getActCategoryMeta}
            getCategoryPriority={getActPriority}
            emptyTitle="Nenhum ato encontrado"
            emptyDescription="Não localizamos registros para os critérios selecionados (Mês / Ano / Termo de busca)."
            bottomContent={isStandalone ? externalLinksSection : null}
        />
    );
}
