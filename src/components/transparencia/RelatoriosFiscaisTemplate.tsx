"use client";

import { useState, useEffect, useMemo } from "react";
import {
    FaFilePdf,
    FaCalendarDays,
    FaChartLine,
    FaFileSignature,
    FaBuildingColumns,
    FaShieldHalved,
} from "react-icons/fa6";
import { motion } from "framer-motion";
import { exportToCSV, exportToJSON, exportToPDF, exportToXLSX } from "@/lib/exportUtils";
import LRFDocumentCatalog, {
    type ActiveFilterBadge,
    type CatalogCategoryMeta,
    type CatalogItem,
    type CatalogStatCard,
} from "@/components/transparencia/LRFDocumentCatalog";

type RelatorioFiscal = {
    id: string;
    titulo: string;
    tipo: string;
    periodo: string;
    ano: number;
    arquivo: string;
    dataPublicacao: string;
};

export type DeclaracaoInfo = {
    exercicios: string;
    textoInicial?: string;
    declaracao: string;
    dataAtualizacao: string;
};

interface Props {
    title: string;
    subtitle: string;
    tipo: string;
    icon: React.ReactNode;
    breadcrumbLabel: string;
    showTabs?: string[];
    declaracao?: DeclaracaoInfo | React.ReactNode;
    yearSubtitle?: string;
    sortAscLabel?: string;
    sortDescLabel?: string;
    orderByPeriod?: boolean;
}

const getTipoPriority = (tipo: string): number => {
    const t = (tipo || "").toUpperCase();
    if (t === "RREO") return 1;
    if (t === "RGF") return 2;
    if (t === "LOA") return 3;
    if (t === "LDO") return 4;
    if (t === "PPA") return 5;
    return 6;
};

const getPeriodoWeight = (periodoStr: string, tituloStr: string): number => {
    const pStr = (periodoStr || "").toLowerCase();
    const tStr = (tituloStr || "").toLowerCase();

    for (let i = 1; i <= 6; i++) {
        if (
            tStr.includes(`${i}º bi`) ||
            tStr.includes(`${i}.º bi`) ||
            tStr.includes(`${i}o bi`) ||
            tStr.includes(`${i}º bim`) ||
            tStr.includes(`${i} bimestre`)
        ) {
            return i * 1.0;
        }
    }

    for (let i = 1; i <= 6; i++) {
        if (
            pStr.includes(`${i}º bi`) ||
            pStr.includes(`${i}.º bi`) ||
            pStr.includes(`${i}o bi`) ||
            pStr.includes(`${i}º bim`) ||
            pStr.includes(`${i} bimestre`)
        ) {
            return i * 1.0;
        }
    }

    for (let i = 1; i <= 3; i++) {
        if (
            tStr.includes(`${i}º quad`) ||
            tStr.includes(`${i}º sem`) ||
            pStr.includes(`${i}º quad`) ||
            pStr.includes(`${i}º sem`) ||
            tStr.includes(`${i} quadrimestre`) ||
            pStr.includes(`${i} quadrimestre`)
        ) {
            return i + 0.5;
        }
    }

    if (tStr.includes("jan") || pStr.includes("jan")) return 1.0;
    if (tStr.includes("mar") || pStr.includes("mar")) return 2.0;
    if (tStr.includes("mai") || pStr.includes("mai")) return 3.0;
    if (tStr.includes("jul") || pStr.includes("jul")) return 4.0;
    if (tStr.includes("set") || pStr.includes("set")) return 5.0;
    if (tStr.includes("nov") || pStr.includes("nov")) return 6.0;

    const match = `${pStr} ${tStr}`.match(/(\d+)\s*º?\s*(bimestre|quadrimestre|semestre)/);
    if (match) return parseFloat(match[1]);

    if (
        tStr.includes("anual") ||
        pStr.includes("anual") ||
        tStr.includes("balanço") ||
        pStr.includes("balanço")
    ) {
        return 10.0;
    }

    return 99.0;
};

const getTipoMeta = (tipo: string): CatalogCategoryMeta => {
    const t = (tipo || "").toUpperCase();
    if (t === "RREO") {
        return {
            title: "RREO - Relatórios Resumidos da Execução Orçamentária",
            subtitle: "Publicações Bimestrais (1º ao 6º Bimestre)",
            badgeStyle: "bg-indigo-50 text-indigo-700 border-indigo-200",
            icon: <FaChartLine className="text-indigo-600" size={16} />,
            itemSingular: "relatório",
            itemPlural: "relatórios",
        };
    }
    if (t === "RGF") {
        return {
            title: "RGF - Relatórios de Gestão Fiscal",
            subtitle: "Publicações Quadrimestrais e Semestrais (1º ao 3º Quadrimestre)",
            badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
            icon: <FaFileSignature className="text-emerald-600" size={16} />,
            itemSingular: "relatório",
            itemPlural: "relatórios",
        };
    }
    if (t === "LOA") {
        return {
            title: "LOA - Lei Orçamentária Anual",
            subtitle: "Estimativa de receitas e fixação de despesas por exercício financeiro",
            badgeStyle: "bg-blue-50 text-[#01b0ef] border-blue-200",
            icon: <FaBuildingColumns className="text-[#01b0ef]" size={16} />,
            itemSingular: "documento",
            itemPlural: "documentos",
        };
    }
    if (t === "LDO") {
        return {
            title: "LDO - Lei de Diretrizes Orçamentárias",
            subtitle: "Metas e prioridades orientadoras do orçamento municipal",
            badgeStyle: "bg-amber-50 text-amber-700 border-amber-200",
            icon: <FaBuildingColumns className="text-amber-600" size={16} />,
            itemSingular: "documento",
            itemPlural: "documentos",
        };
    }
    if (t === "PPA") {
        return {
            title: "PPA - Plano Plurianual",
            subtitle: "Diretrizes, objetivos e metas estratégicas para 4 anos",
            badgeStyle: "bg-purple-50 text-purple-700 border-purple-200",
            icon: <FaBuildingColumns className="text-purple-600" size={16} />,
            itemSingular: "documento",
            itemPlural: "documentos",
        };
    }
    return {
        title: tipo || "Documentos Fiscais",
        subtitle: "Relatórios e Documentações Oficiais",
        badgeStyle: "bg-slate-100 text-slate-700 border-slate-200",
        icon: <FaFilePdf className="text-slate-600" size={16} />,
        itemSingular: "relatório",
        itemPlural: "relatórios",
    };
};

export default function RelatoriosFiscaisTemplate({
    title,
    subtitle,
    tipo,
    icon,
    breadcrumbLabel,
    showTabs,
    declaracao,
    yearSubtitle = "Demonstrativos da LRF",
    sortAscLabel = "Ordem: 1º ao 6º Bimestre",
    sortDescLabel = "Ordem: 6º ao 1º Bimestre",
    orderByPeriod = true,
}: Props) {
    const [relatorios, setRelatorios] = useState<RelatorioFiscal[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [tabAtiva, setTabAtiva] = useState(showTabs ? "TODOS" : tipo);
    const [anoFiltro, setAnoFiltro] = useState<number | null>(null);
    const [ordemPeriodo, setOrdemPeriodo] = useState<"asc" | "desc">(
        orderByPeriod ? "asc" : "desc"
    );

    const tabsKey = useMemo(() => (showTabs ? showTabs.join(",") : ""), [showTabs]);

    useEffect(() => {
        const fetchRelatorios = async () => {
            try {
                setLoading(true);
                const urls = [
                    showTabs
                        ? "/api/admin/relatorios-fiscais"
                        : `/api/admin/relatorios-fiscais?tipo=${encodeURIComponent(tipo)}`,
                ];

                const hasBudget = showTabs?.some((t) => ["LOA", "LDO", "PPA"].includes(t));
                if (hasBudget) {
                    urls.push("/api/legislacao?tipo=LOA,LDO,PPA&limit=200");
                }

                const docTypes = showTabs
                    ? showTabs.map((t) => t.toLowerCase()).join(",")
                    : tipo.toLowerCase();
                urls.push(`/api/documentos?tipo=${encodeURIComponent(docTypes)}`);

                const responses = await Promise.all(urls.map((url) => fetch(url)));
                const dataSets = await Promise.all(
                    responses.map((res) => (res.ok ? res.json() : []))
                );

                let combinedRecords: RelatorioFiscal[] = [];

                if (dataSets[0]) {
                    combinedRecords = [
                        ...(Array.isArray(dataSets[0]) ? dataSets[0] : []).map((r: any) => ({
                            ...r,
                            tipo: String(r.tipo || "").toUpperCase(),
                            arquivo: r.arquivo || "",
                        })),
                    ];
                }

                if (hasBudget && dataSets[1] && dataSets[1].items) {
                    const mappedBudget: RelatorioFiscal[] = dataSets[1].items.map((item: any) => ({
                        id: `leg-${item.id}`,
                        titulo: item.numero ? `${item.tipo.toUpperCase()} nº ${item.numero} — ${item.ementa}` : item.ementa,
                        tipo: String(item.tipo || "").toUpperCase(),
                        periodo: "Instrumento de Planejamento",
                        ano: item.ano,
                        arquivo: item.arquivo || item.documentUrl || "",
                        dataPublicacao: item.dataAto || item.criadoEm,
                    }));
                    combinedRecords = [...combinedRecords, ...mappedBudget];
                }

                const docIndex = hasBudget ? 2 : 1;
                if (dataSets[docIndex]) {
                    const rawDocs = Array.isArray(dataSets[docIndex]) ? dataSets[docIndex] : [];
                    const mappedDocs: RelatorioFiscal[] = rawDocs
                        .filter((item: any) => item.ativo !== false)
                        .map((item: any) => ({
                            id: `doc-${item.id}`,
                            titulo: item.titulo,
                            tipo: String(item.tipo || "").toUpperCase(),
                            periodo: hasBudget ? "Instrumento de Planejamento" : "Documento",
                            ano: item.ano || new Date(item.criadoEm).getFullYear(),
                            arquivo: item.arquivo || item.documentUrl || "",
                            dataPublicacao: item.criadoEm,
                        }));
                    combinedRecords = [...combinedRecords, ...mappedDocs];
                }

                const allowedSet = showTabs
                    ? new Set(showTabs.map((t) => t.toUpperCase()))
                    : new Set([tipo.toUpperCase()]);

                const scopedRecords = combinedRecords.filter((r) =>
                    allowedSet.has((r.tipo || "").toUpperCase())
                );

                const seenIds = new Set<string>();
                const seenUrls = new Set<string>();
                const seenCrossSourceKeys = new Set<string>();
                const uniqueRecords: RelatorioFiscal[] = [];
                for (const r of scopedRecords) {
                    const idKey = r.id ? String(r.id) : "";
                    const urlKey = r.arquivo ? r.arquivo.toLowerCase().trim() : "";
                    const titleKey = `${r.ano}-${r.tipo}-${r.titulo}`.toLowerCase().trim();
                    const isMergedExtra = idKey.startsWith("leg-") || idKey.startsWith("doc-");

                    if (idKey && seenIds.has(idKey)) continue;
                    if (urlKey && seenUrls.has(urlKey)) continue;
                    if (isMergedExtra && seenCrossSourceKeys.has(titleKey)) continue;

                    if (idKey) seenIds.add(idKey);
                    if (urlKey) seenUrls.add(urlKey);
                    seenCrossSourceKeys.add(titleKey);
                    uniqueRecords.push(r);
                }

                setRelatorios(uniqueRecords);
            } catch (error) {
                console.error("Erro ao buscar relatórios:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRelatorios();
    }, [tipo, tabsKey, showTabs]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        return relatorios.filter((r) => {
            const matchesSearch =
                !q ||
                r.titulo.toLowerCase().includes(q) ||
                (r.periodo || "").toLowerCase().includes(q);
            const matchesTab = !showTabs || tabAtiva === "TODOS" || r.tipo === tabAtiva.toUpperCase();
            const matchesAno = anoFiltro === null || r.ano === anoFiltro;
            return matchesSearch && matchesTab && matchesAno;
        });
    }, [relatorios, search, showTabs, tabAtiva, anoFiltro]);

    const sortedFiltered = useMemo(() => {
        return [...filtered].sort((a, b) => {
            if (orderByPeriod) {
                const dir = ordemPeriodo === "asc" ? 1 : -1;
                const wA = getPeriodoWeight(a.periodo, a.titulo);
                const wB = getPeriodoWeight(b.periodo, b.titulo);
                if (wA !== wB) return (wA - wB) * dir;
            }
            return a.titulo.localeCompare(b.titulo, "pt-BR");
        });
    }, [filtered, ordemPeriodo, orderByPeriod]);

    const todosOsAnos = useMemo(() => {
        return Array.from(
            new Set(
                relatorios
                    .filter(
                        (r) => !showTabs || tabAtiva === "TODOS" || r.tipo === tabAtiva.toUpperCase()
                    )
                    .map((r) => r.ano)
            )
        ).sort((a, b) => b - a);
    }, [relatorios, showTabs, tabAtiva]);

    const anosDisponiveis = useMemo(() => {
        const anos = Array.from(new Set(filtered.map((r) => r.ano)));
        return orderByPeriod
            ? anos.sort((a, b) => b - a)
            : anos.sort((a, b) => (ordemPeriodo === "desc" ? b - a : a - b));
    }, [filtered, orderByPeriod, ordemPeriodo]);

    const handleExport = (format: "pdf" | "csv" | "xlsx") => {
        const payload = sortedFiltered.map((r) => ({
            "Título": r.titulo,
            "Tipo": r.tipo,
            "Período": r.periodo,
            "Ano": r.ano,
            "Data de Publicação": new Date(r.dataPublicacao).toLocaleDateString("pt-BR"),
            "Link": r.arquivo || "Não disponível",
        }));

        const filename = `relatorios_${tipo.toLowerCase()}${anoFiltro ? `_${anoFiltro}` : ""}`;
        const exportTitle = `${title}${anoFiltro ? ` (${anoFiltro})` : ""} – São Tomé/RN`;

        if (format === "csv") exportToCSV(payload, filename);
        else if (format === "xlsx") exportToXLSX(payload, filename);
        else exportToPDF(payload, filename, exportTitle);
    };

    const currentYear = new Date().getFullYear();

    const stats: CatalogStatCard[] = [
        {
            label: "Total de Documentos",
            value: filtered.length,
            sublabel: "Registros catalogados",
            icon: <FaChartLine size={20} />,
            variant: "primary",
        },
        {
            label: `Exercício ${currentYear}`,
            value: relatorios.filter((r) => r.ano === currentYear).length,
            sublabel: "Publicações no ano vigente",
            icon: <FaCalendarDays size={20} />,
            variant: "emerald",
        },
        {
            label: "Arquivos em PDF",
            value: relatorios.filter((r) => r.arquivo.toLowerCase().endsWith(".pdf")).length,
            sublabel: "Inteiro teor disponível",
            icon: <FaFilePdf size={20} />,
            variant: "amber",
        },
    ];

    const catalogItems: CatalogItem[] = useMemo(
        () =>
            sortedFiltered.map((r) => ({
                id: r.id,
                ano: r.ano,
                categoriaKey: r.tipo,
                badgeText: r.tipo,
                secondaryPill: r.periodo || undefined,
                titulo: r.titulo,
                fileUrl: r.arquivo,
            })),
        [sortedFiltered]
    );

    const chartSourceItems: CatalogItem[] = useMemo(
        () =>
            relatorios.map((r) => ({
                id: r.id,
                ano: r.ano,
                categoriaKey: r.tipo,
                badgeText: r.tipo,
                titulo: r.titulo,
                fileUrl: r.arquivo,
            })),
        [relatorios]
    );

    const activeFilterBadges: ActiveFilterBadge[] = [];
    if (showTabs && tabAtiva !== "TODOS") {
        activeFilterBadges.push({
            key: "tab",
            label: tabAtiva,
            colorClass: "bg-blue-50 text-[#01b0ef] border-blue-200",
            onClear: () => setTabAtiva("TODOS"),
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
    if (search) {
        activeFilterBadges.push({
            key: "search",
            label: `"${search}"`,
            colorClass: "bg-sky-50 text-sky-800 border-sky-200",
            onClear: () => setSearch(""),
        });
    }

    const declaracaoBanner = declaracao ? (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 md:p-8 border border-amber-200/80 shadow-xl shadow-amber-500/5 mb-10 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-5 border-b border-amber-100/80">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#fdb913] text-slate-900 rounded-2xl shadow-md shadow-[#fdb913]/25">
                        <FaShieldHalved size={22} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-900 bg-[#fff4d4] px-2.5 py-0.5 rounded-full uppercase tracking-widest inline-block mb-1">
                            Declaração de Transparência Pública (PNTP)
                        </span>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">
                            {typeof declaracao === "object" && declaracao !== null && "exercicios" in declaracao
                                ? declaracao.exercicios
                                : "Declaração Oficial"}
                        </h3>
                    </div>
                </div>
                {typeof declaracao === "object" &&
                    declaracao !== null &&
                    "dataAtualizacao" in declaracao && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-900 rounded-full border border-amber-200 text-xs font-bold shadow-sm">
                            <FaCalendarDays size={13} className="text-amber-600" />
                            <span>
                                Data de Atualização:{" "}
                                <strong className="text-amber-950 font-black">
                                    {declaracao.dataAtualizacao}
                                </strong>
                            </span>
                        </div>
                    )}
            </div>

            {typeof declaracao === "object" && declaracao !== null && "declaracao" in declaracao ? (
                <div className="space-y-4 text-slate-700 text-sm md:text-base leading-relaxed">
                    {declaracao.textoInicial && (
                        <p className="text-slate-600 font-medium">{declaracao.textoInicial}</p>
                    )}
                    <div className="p-6 bg-amber-50/70 rounded-2xl border-l-4 border-amber-500 border border-amber-200/50 shadow-inner">
                        <p className="font-semibold text-slate-800 leading-relaxed">
                            {declaracao.declaracao}
                        </p>
                    </div>
                </div>
            ) : (
                declaracao
            )}
        </motion.div>
    ) : null;

    return (
        <LRFDocumentCatalog
            title={title}
            subtitle={subtitle}
            icon={icon}
            breadcrumbs={[
                { label: "Início", href: "/" },
                { label: "Transparência", href: "/transparencia" },
                { label: breadcrumbLabel },
            ]}
            topBanner={declaracaoBanner}
            stats={stats}
            loading={loading}
            loadingText="Carregando relatórios e documentos..."
            totalCount={relatorios.length}
            items={catalogItems}
            chartSourceItems={chartSourceItems}
            availableYears={todosOsAnos}
            orderedYears={anosDisponiveis}
            yearSubtitle={yearSubtitle}
            counterDescription={
                orderByPeriod
                    ? "organizados em sequência cronológica (1º ao 6º Bimestre / 1º ao 3º Quadrimestre)"
                    : "organizados por exercício e categoria"
            }
            tabs={
                showTabs
                    ? ["TODOS", ...showTabs].map((t) => ({
                          id: t,
                          label: t === "TODOS" ? "Todos" : t,
                      }))
                    : undefined
            }
            tabsLabel="Tipo de Documento / Relatório"
            activeTab={tabAtiva}
            onTabChange={setTabAtiva}
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Pesquisar documento..."
            yearValue={anoFiltro}
            onYearChange={setAnoFiltro}
            sortOrder={ordemPeriodo}
            onToggleSortOrder={() =>
                setOrdemPeriodo((prev) => (prev === "asc" ? "desc" : "asc"))
            }
            sortAscLabel={sortAscLabel}
            sortDescLabel={sortDescLabel}
            onExport={handleExport}
            activeFilterBadges={activeFilterBadges}
            hasActiveFilters={Boolean(search || anoFiltro || (showTabs && tabAtiva !== "TODOS"))}
            onClearAllFilters={() => {
                setSearch("");
                setAnoFiltro(null);
                if (showTabs) setTabAtiva("TODOS");
            }}
            getCategoryMeta={getTipoMeta}
            getCategoryPriority={getTipoPriority}
            emptyIcon={<FaChartLine size={28} />}
        />
    );
}
