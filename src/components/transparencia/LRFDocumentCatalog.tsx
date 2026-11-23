"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
    FaFilePdf,
    FaMagnifyingGlass,
    FaCalendarDays,
    FaDownload,
    FaFileExcel,
    FaFileCsv,
    FaXmark,
    FaEye,
    FaArrowDownShortWide,
    FaArrowUpWideShort,
    FaChartPie,
    FaTable,
    FaArrowUpRightFromSquare,
    FaChevronDown,
    FaChevronUp,
} from "react-icons/fa6";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Cell,
    PieChart,
    Pie,
    Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import BannerPNTP from "@/components/transparencia/BannerPNTP";
import PDFViewer from "@/components/transparencia/PDFViewer";
import { isValidPublicUrl } from "@/lib/portal-links";

const CHART_COLORS = ["#01b0ef", "#fdb913", "#10B981", "#01b0ef", "#8B5CF6", "#fdb913"];

export interface CatalogStatCard {
    label: string;
    value: number | string;
    sublabel?: string;
    icon: React.ReactNode;
    variant: "primary" | "emerald" | "amber";
}

export interface CatalogCategoryMeta {
    title: string;
    subtitle: string;
    badgeStyle: string;
    icon: React.ReactNode;
    itemSingular?: string;
    itemPlural?: string;
}

export interface CatalogItem {
    id: string;
    ano: number;
    categoriaKey: string;
    badgeText: string;
    secondaryPill?: string;
    tertiaryTag?: string;
    titulo: string;
    descricao?: string | null;
    metaInfo?: string | null;
    fileUrl?: string | null;
    extraUrl?: string | null;
    extraLabel?: string;
    externalOnly?: boolean;
    onViewTitle?: string;
}

export interface CatalogTab {
    id: string;
    label: string;
}

export interface ActiveFilterBadge {
    key: string;
    label: string;
    colorClass: string;
    onClear: () => void;
}

export interface LRFDocumentCatalogProps {
    embedded?: boolean;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    breadcrumbs: { label: string; href?: string }[];

    topBanner?: React.ReactNode;
    stats: CatalogStatCard[];

    loading: boolean;
    loadingText?: string;
    totalCount: number;
    items: CatalogItem[];
    chartSourceItems?: CatalogItem[];
    availableYears: number[];
    orderedYears?: number[];

    yearSubtitle?: string;
    listTabLabel?: string;
    counterDescription?: string;
    showChartsToggle?: boolean;
    yearGroupUnitSingular?: string;
    yearGroupUnitPlural?: string;

    tabs?: CatalogTab[];
    tabsLabel?: string;
    activeTab?: string;
    onTabChange?: (tabId: string) => void;

    searchValue: string;
    onSearchChange: (val: string) => void;
    searchPlaceholder?: string;

    yearValue: number | null;
    onYearChange: (ano: number | null) => void;

    monthOptions?: { v: string; l: string }[];
    monthValue?: number | null;
    onMonthChange?: (mes: number | null) => void;

    extraFilterSlot?: React.ReactNode;

    sortOrder?: "asc" | "desc";
    onToggleSortOrder?: () => void;
    sortAscLabel?: string;
    sortDescLabel?: string;

    onExport?: (format: "pdf" | "csv" | "xlsx") => void;

    activeFilterBadges?: ActiveFilterBadge[];
    hasActiveFilters?: boolean;
    onClearAllFilters?: () => void;

    getCategoryMeta: (categoriaKey: string) => CatalogCategoryMeta;
    getCategoryPriority?: (categoriaKey: string) => number;

    emptyTitle?: string;
    emptyDescription?: string;
    emptyIcon?: React.ReactNode;

    bottomContent?: React.ReactNode;
    bannerProps?: {
        criterio?: string;
        requisito?: string;
        status?: string;
    };
}

/**
 * Template unificado no padrão visual e estrutural da página LRF
 * (PageHeader premium, cards KPI, alternância Documentos/Gráficos,
 * filtros estruturados e agrupamento por Exercício e Categoria).
 */
export default function LRFDocumentCatalog({
    embedded = false,
    title,
    subtitle,
    icon,
    breadcrumbs,
    topBanner,
    stats,
    loading,
    loadingText = "Carregando documentos oficiais...",
    totalCount,
    items,
    chartSourceItems,
    availableYears,
    orderedYears,
    yearSubtitle = "Documentos Oficiais",
    listTabLabel = "Documentos Oficiais",
    counterDescription,
    showChartsToggle = true,
    yearGroupUnitSingular = "documento",
    yearGroupUnitPlural = "documentos",
    tabs,
    tabsLabel = "Tipo de Documento",
    activeTab,
    onTabChange,
    searchValue,
    onSearchChange,
    searchPlaceholder = "Pesquisar documento...",
    yearValue,
    onYearChange,
    monthOptions,
    monthValue,
    onMonthChange,
    extraFilterSlot,
    sortOrder = "desc",
    onToggleSortOrder,
    sortAscLabel = "Mais antigos primeiro",
    sortDescLabel = "Mais atuais primeiro",
    onExport,
    activeFilterBadges = [],
    hasActiveFilters = false,
    onClearAllFilters,
    getCategoryMeta,
    getCategoryPriority,
    emptyTitle = "Nenhum documento encontrado",
    emptyDescription = "Não há registros para os filtros selecionados. Tente alterar os critérios de busca.",
    emptyIcon,
    bottomContent,
    bannerProps,
}: LRFDocumentCatalogProps) {
    const [abaVisual, setAbaVisual] = useState<"lista" | "graficos">("lista");
    const [pdfViewer, setPdfViewer] = useState<{ url: string; titulo: string } | null>(null);
    const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({});
    const [showAllYears, setShowAllYears] = useState(false);

    const closePdfViewer = useCallback(() => setPdfViewer(null), []);

    const anosExibicao = useMemo(() => {
        if (orderedYears && orderedYears.length > 0) return orderedYears;
        const set = new Set<number>();
        for (const item of items) {
            if (item.ano) set.add(item.ano);
        }
        return Array.from(set).sort((a, b) => (sortOrder === "asc" ? a - b : b - a));
    }, [items, orderedYears, sortOrder]);

    const useCollapsibleYears =
        items.length > 80 && anosExibicao.length > 2 && !hasActiveFilters && !showAllYears;

    const isYearExpanded = useCallback(
        (ano: number, index: number) => {
            if (!useCollapsibleYears) return true;
            if (ano in expandedYears) return expandedYears[ano];
            return index < 2;
        },
        [useCollapsibleYears, expandedYears]
    );

    const toggleYear = useCallback((ano: number, currentExpanded: boolean) => {
        setExpandedYears((prev) => ({ ...prev, [ano]: !currentExpanded }));
    }, []);

    const dadosPorAno = useMemo(() => {
        const src = chartSourceItems || items;
        const map: Record<number, number> = {};
        for (const r of src) {
            if (r.ano) {
                map[r.ano] = (map[r.ano] || 0) + 1;
            }
        }
        return Object.entries(map)
            .map(([ano, count]) => ({ ano: Number(ano), count }))
            .sort((a, b) => a.ano - b.ano);
    }, [chartSourceItems, items]);

    const dadosPorTipo = useMemo(() => {
        const map: Record<string, number> = {};
        for (const r of items) {
            const meta = getCategoryMeta(r.categoriaKey);
            const label = meta.title.split(" - ")[0] || r.badgeText || r.categoriaKey || "Outros";
            map[label] = (map[label] || 0) + 1;
        }
        return Object.entries(map)
            .map(([tipo, count]) => ({ tipo, count }))
            .sort((a, b) => b.count - a.count);
    }, [items, getCategoryMeta]);

    return (
        <div className={embedded ? "w-full" : "min-h-screen bg-[#f4fbff]"}>
            {!embedded && (
                <PageHeader
                    title={title}
                    subtitle={subtitle}
                    variant="premium"
                    icon={icon}
                    breadcrumbs={breadcrumbs}
                />
            )}

            <div className={embedded ? "w-full py-2" : "w-full px-4 md:px-10 lg:px-20 py-10"}>
                {topBanner}

                {/* ═══════ STATS CARDS (PADRÃO LRF) ═══════ */}
                {stats.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {stats.map((st, idx) => {
                            const isAmber = st.variant === "amber";
                            const isEmerald = st.variant === "emerald";
                            return (
                                <div
                                    key={idx}
                                    className={`bg-white p-6 rounded-2xl shadow-sm border border-[#e2e8f0] ${
                                        isAmber ? "border-t-4 border-t-[#fdb913]" : ""
                                    } flex items-center justify-between gap-4`}
                                >
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                                            {st.label}
                                        </p>
                                        <p
                                            className={`text-3xl font-black tracking-tight ${
                                                isEmerald ? "text-emerald-600" : "text-slate-900"
                                            }`}
                                        >
                                            {st.value}
                                        </p>
                                        {st.sublabel && (
                                            <p className="text-xs text-slate-600 mt-1">{st.sublabel}</p>
                                        )}
                                    </div>
                                    <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                            isAmber
                                                ? "bg-[#fdb913] text-slate-900 shadow-xs"
                                                : isEmerald
                                                ? "bg-emerald-50 text-emerald-600"
                                                : "bg-blue-50 text-[#01b0ef]"
                                        }`}
                                    >
                                        {st.icon}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ═══════ ALTERNADOR LISTA / GRÁFICOS ═══════ */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    {showChartsToggle ? (
                        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-[#e2e8f0] shadow-sm">
                            <button
                                type="button"
                                onClick={() => setAbaVisual("lista")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    abaVisual === "lista"
                                        ? "bg-[#01b0ef] text-white shadow-sm"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                <FaTable size={13} /> {listTabLabel}
                            </button>
                            <button
                                type="button"
                                onClick={() => setAbaVisual("graficos")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    abaVisual === "graficos"
                                        ? "bg-[#01b0ef] text-white shadow-sm"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                <FaChartPie size={13} /> Gráficos nos Resultados
                            </button>
                        </div>
                    ) : (
                        <div />
                    )}

                    <div className="hidden sm:flex items-center gap-2">
                        <span className="text-xs text-slate-600 font-semibold">
                            Exibindo {items.length} de {totalCount} itens
                        </span>
                    </div>
                </div>

                {/* ═══════ DASHBOARD GRÁFICO ═══════ */}
                {showChartsToggle && abaVisual === "graficos" && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
                    >
                        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">
                                        Publicações por Exercício
                                    </h3>
                                    <p className="text-xs text-slate-600">
                                        Volume de documentos publicados ao longo dos anos
                                    </p>
                                </div>
                                <span className="p-2 bg-blue-50 text-[#01b0ef] rounded-xl text-xs font-bold">
                                    {dadosPorAno.length} Exercícios
                                </span>
                            </div>
                            <div className="h-[280px] w-full">
                                {dadosPorAno.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={dadosPorAno}
                                            margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#F1F5F9"
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="ano"
                                                tick={{
                                                    fontSize: 11,
                                                    fill: "#0f172a",
                                                    fontWeight: 600,
                                                }}
                                            />
                                            <YAxis
                                                allowDecimals={false}
                                                tick={{ fontSize: 11, fill: "#475569" }}
                                            />
                                            <Tooltip
                                                formatter={(value: number) => [
                                                    `${value} publicações`,
                                                    "Total",
                                                ]}
                                            />
                                            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                                {dadosPorAno.map((_, index) => (
                                                    <Cell
                                                        key={`cell-ano-${index}`}
                                                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-sm text-slate-600">
                                        Nenhum dado disponível
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">
                                        Composição por Categoria
                                    </h3>
                                    <p className="text-xs text-slate-600">
                                        Proporção dos registros catalogados
                                    </p>
                                </div>
                                <span className="px-2.5 py-1 bg-[#fdb913] text-slate-900 rounded-xl text-xs font-bold">
                                    {dadosPorTipo.length}{" "}
                                    {dadosPorTipo.length === 1 ? "Categoria" : "Categorias"}
                                </span>
                            </div>
                            <div className="h-[280px] w-full">
                                {dadosPorTipo.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={dadosPorTipo}
                                                dataKey="count"
                                                nameKey="tipo"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={95}
                                                innerRadius={50}
                                                paddingAngle={4}
                                                label={({ name, percent }) =>
                                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                                }
                                            >
                                                {dadosPorTipo.map((_, index) => (
                                                    <Cell
                                                        key={`cell-tipo-${index}`}
                                                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(val: number) => [
                                                    `${val} documentos`,
                                                    "Quantidade",
                                                ]}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-sm text-slate-600">
                                        Nenhum dado disponível
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ═══════ FILTROS E CONTROLES ═══════ */}
                <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm mb-8">
                    {tabs && tabs.length > 0 && onTabChange && (
                        <div className="px-5 pt-5 pb-0">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5 block">
                                {tabsLabel}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => onTabChange(tab.id)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                            activeTab === tab.id
                                                ? "bg-[#01b0ef] text-white shadow-sm"
                                                : "bg-[#f4fbff] text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="p-5 flex flex-col md:flex-row flex-wrap gap-3 items-stretch md:items-center">
                        <div className="relative flex-1 min-w-[200px]">
                            <FaMagnifyingGlass
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                size={13}
                            />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                aria-label={searchPlaceholder}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#01b0ef]/20 focus:border-[#01b0ef] transition-all outline-none"
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </div>

                        {extraFilterSlot}

                        <div className="relative w-full md:w-44">
                            <FaCalendarDays
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                size={13}
                            />
                            <select
                                aria-label="Filtrar por ano"
                                value={yearValue ?? ""}
                                onChange={(e) =>
                                    onYearChange(e.target.value ? Number(e.target.value) : null)
                                }
                                className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-[#01b0ef]/20 focus:border-[#01b0ef] transition-all outline-none cursor-pointer appearance-none"
                            >
                                <option value="">Todos os anos</option>
                                {availableYears.map((ano) => (
                                    <option key={ano} value={ano}>
                                        {ano}
                                    </option>
                                ))}
                            </select>
                            <SelectChevron />
                        </div>

                        {monthOptions && onMonthChange && (
                            <div className="relative w-full md:w-44">
                                <FaCalendarDays
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                    size={13}
                                />
                                <select
                                    aria-label="Filtrar por mês"
                                    value={monthValue ?? ""}
                                    onChange={(e) =>
                                        onMonthChange(e.target.value ? Number(e.target.value) : null)
                                    }
                                    className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-[#01b0ef]/20 focus:border-[#01b0ef] transition-all outline-none cursor-pointer appearance-none"
                                >
                                    {monthOptions.map((m) => (
                                        <option key={m.v} value={m.v}>
                                            {m.l}
                                        </option>
                                    ))}
                                </select>
                                <SelectChevron />
                            </div>
                        )}

                        {onToggleSortOrder && (
                            <button
                                type="button"
                                onClick={onToggleSortOrder}
                                title="Alternar ordem de exibição"
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer shadow-sm shrink-0"
                            >
                                {sortOrder === "asc" ? (
                                    <>
                                        <FaArrowDownShortWide
                                            className="text-[#01b0ef]"
                                            size={14}
                                        />
                                        <span>{sortAscLabel}</span>
                                    </>
                                ) : (
                                    <>
                                        <FaArrowUpWideShort
                                            className="text-[#01b0ef]"
                                            size={14}
                                        />
                                        <span>{sortDescLabel}</span>
                                    </>
                                )}
                            </button>
                        )}

                        {onExport && (
                            <>
                                <div className="hidden md:block w-px h-8 bg-slate-200" />
                                <div className="flex items-center gap-1.5 justify-end">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1 hidden lg:block">
                                        Exportar:
                                    </span>
                                    {[
                                        {
                                            id: "pdf" as const,
                                            icon: <FaFilePdf size={13} />,
                                            label: "PDF",
                                            color: "text-red-500 hover:bg-red-50",
                                        },
                                        {
                                            id: "xlsx" as const,
                                            icon: <FaFileExcel size={13} />,
                                            label: "Excel",
                                            color: "text-emerald-600 hover:bg-emerald-50",
                                        },
                                        {
                                            id: "csv" as const,
                                            icon: <FaFileCsv size={13} />,
                                            label: "CSV",
                                            color: "text-[#01b0ef] hover:bg-blue-50",
                                        },
                                    ].map((tool) => (
                                        <button
                                            key={tool.id}
                                            type="button"
                                            onClick={() => onExport(tool.id)}
                                            title={`Exportar como ${tool.label}`}
                                            aria-label={`Exportar como ${tool.label}`}
                                            className={`p-2.5 rounded-lg transition-all ${tool.color} border border-transparent hover:border-current/10 cursor-pointer`}
                                        >
                                            {tool.icon}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {hasActiveFilters && (
                        <div className="px-5 pb-4 flex items-center gap-2 flex-wrap border-t border-slate-100 pt-3">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">
                                Filtros Ativos:
                            </span>
                            {activeFilterBadges.map((badge) => (
                                <span
                                    key={badge.key}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${badge.colorClass}`}
                                >
                                    {badge.label}
                                    <button
                                        type="button"
                                        onClick={badge.onClear}
                                        aria-label={`Remover filtro ${badge.label}`}
                                        className="ml-0.5 hover:opacity-75 cursor-pointer"
                                    >
                                        <FaXmark size={10} />
                                    </button>
                                </span>
                            ))}
                            {onClearAllFilters && (
                                <button
                                    type="button"
                                    onClick={onClearAllFilters}
                                    className="text-[10px] font-bold text-slate-500 hover:text-red-500 uppercase transition-colors ml-1 cursor-pointer"
                                >
                                    Limpar tudo
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* ═══════ CONTADOR ═══════ */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-slate-600">
                        <span className="font-bold text-slate-900">{items.length}</span>{" "}
                        {items.length === 1 ? yearGroupUnitSingular : yearGroupUnitPlural}{" "}
                        {counterDescription ||
                            (items.length === 1
                                ? "organizado por exercício"
                                : "organizados por exercício")}
                    </p>
                </div>

                {/* ═══════ LISTAGEM ESTRUTURADA POR EXERCÍCIO ═══════ */}
                <div className="space-y-10">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#e2e8f0] shadow-sm">
                            <div className="w-12 h-12 border-4 border-[#01b0ef]/20 border-t-[#01b0ef] rounded-full animate-spin mb-4" />
                            <p className="text-sm text-slate-500 font-medium">{loadingText}</p>
                        </div>
                    ) : anosExibicao.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 px-6">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                                {emptyIcon || <FaMagnifyingGlass size={26} />}
                            </div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2">{emptyTitle}</h4>
                            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                                {emptyDescription}
                            </p>
                            {hasActiveFilters && onClearAllFilters && (
                                <button
                                    type="button"
                                    onClick={onClearAllFilters}
                                    className="px-6 py-3 bg-[#01b0ef] text-white rounded-xl text-sm font-bold hover:bg-[#0098d4] transition-colors cursor-pointer"
                                >
                                    Limpar filtros
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {items.length > 80 && anosExibicao.length > 2 && !hasActiveFilters && (
                                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#e6f8ff] border border-[#01b0ef]/25 rounded-xl px-4 py-3 text-xs">
                                    <span className="font-semibold text-slate-700">
                                        Exibindo inicialmente os 2 exercícios mais recentes para navegação rápida. Selecione um exercício abaixo ou busque para expandir qualquer período.
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setShowAllYears((prev) => !prev)}
                                        className="font-bold text-[#007bb0] hover:text-[#01b0ef] underline cursor-pointer shrink-0"
                                    >
                                        {showAllYears
                                            ? "Recolher exercícios anteriores"
                                            : `Expandir todos os ${anosExibicao.length} exercícios`}
                                    </button>
                                </div>
                            )}

                            {anosExibicao.map((ano, yearIndex) => {
                                const itensDoAno = items.filter((r) => r.ano === ano);
                                if (itensDoAno.length === 0) return null;

                                const expanded = isYearExpanded(ano, yearIndex);

                                const categoriasDoAno = Array.from(
                                    new Set(itensDoAno.map((r) => r.categoriaKey))
                                ).sort((a, b) => {
                                    if (getCategoryPriority) {
                                        const diff = getCategoryPriority(a) - getCategoryPriority(b);
                                        if (diff !== 0) return diff;
                                    }
                                    return a.localeCompare(b, "pt-BR");
                                });

                                return (
                                    <div
                                        key={ano}
                                        className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm"
                                    >
                                        {/* Cabeçalho Principal do Exercício */}
                                        <div
                                            className={`flex flex-wrap items-center gap-4 ${
                                                expanded ? "mb-6 pb-4 border-b border-[#e2e8f0]" : ""
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#01b0ef] text-white rounded-xl flex items-center justify-center font-black text-sm shadow-sm">
                                                    <FaCalendarDays size={16} />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                                        Exercício {ano}
                                                    </h3>
                                                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                        {yearSubtitle}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex-1 h-px bg-[#e2e8f0] hidden sm:block" />
                                            <span className="text-xs font-bold text-slate-700 bg-[#f4fbff] border border-[#e2e8f0] px-3 py-1 rounded-lg">
                                                {itensDoAno.length}{" "}
                                                {itensDoAno.length === 1
                                                    ? yearGroupUnitSingular
                                                    : yearGroupUnitPlural}
                                            </span>
                                            {useCollapsibleYears && (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleYear(ano, expanded)}
                                                    aria-expanded={expanded}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f4fbff] hover:bg-[#01b0ef] text-[#007bb0] hover:text-white border border-[#e2e8f0] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                                >
                                                    <span>{expanded ? "Recolher" : "Ver atos"}</span>
                                                    {expanded ? (
                                                        <FaChevronUp size={11} />
                                                    ) : (
                                                        <FaChevronDown size={11} />
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        {/* Subgrupos por Categoria */}
                                        {expanded && (
                                            <div className="space-y-6">
                                                {categoriasDoAno.map((catKey) => {
                                                    const meta = getCategoryMeta(catKey);
                                                    const itensDaCategoria = itensDoAno.filter(
                                                        (r) => r.categoriaKey === catKey
                                                    );
                                                    const singular = meta.itemSingular || yearGroupUnitSingular;
                                                    const plural = meta.itemPlural || yearGroupUnitPlural;

                                                    return (
                                                        <div
                                                            key={catKey}
                                                            className="bg-[#f4fbff] rounded-xl p-5 border border-[#e2e8f0]"
                                                        >
                                                            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#e2e8f0]">
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <div className="p-2 rounded-lg bg-white shadow-sm border border-[#e2e8f0] shrink-0">
                                                                        {meta.icon}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <h4 className="text-sm font-black text-slate-900 tracking-tight">
                                                                            {meta.title}
                                                                        </h4>
                                                                        <p className="text-[11px] font-semibold text-slate-600">
                                                                            {meta.subtitle}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <span
                                                                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm shrink-0 ${meta.badgeStyle}`}
                                                                >
                                                                    {itensDaCategoria.length}{" "}
                                                                    {itensDaCategoria.length === 1
                                                                        ? singular
                                                                        : plural}
                                                                </span>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                                                {itensDaCategoria.map((item) => {
                                                                    const validFileUrl = isValidPublicUrl(item.fileUrl)
                                                                        ? item.fileUrl!
                                                                        : null;
                                                                    const validExtraUrl = isValidPublicUrl(item.extraUrl)
                                                                        ? item.extraUrl!
                                                                        : null;
                                                                    const cleanTitle = item.titulo.replace(
                                                                        /\.pdf$/i,
                                                                        ""
                                                                    );

                                                                    return (
                                                                        <div
                                                                            key={item.id}
                                                                            className="group bg-white rounded-xl border border-[#e2e8f0] hover:border-[#01b0ef]/50 shadow-sm transition-all duration-200 flex flex-col justify-between overflow-hidden"
                                                                        >
                                                                            <div className="p-4 flex-1">
                                                                                <div className="flex items-start gap-3">
                                                                                    <div className="w-9 h-9 bg-red-50 text-red-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                                                                                        <FaFilePdf size={16} />
                                                                                    </div>
                                                                                    <div className="min-w-0 flex-1">
                                                                                        <h5
                                                                                            className="font-bold text-slate-900 text-xs leading-snug mb-1.5 line-clamp-2 group-hover:text-[#01b0ef] transition-colors"
                                                                                            title={cleanTitle}
                                                                                        >
                                                                                            {cleanTitle}
                                                                                        </h5>

                                                                                        {item.descricao && (
                                                                                            <p
                                                                                                className="text-[11px] text-slate-600 leading-relaxed mb-2 line-clamp-3"
                                                                                                title={item.descricao}
                                                                                            >
                                                                                                {item.descricao}
                                                                                            </p>
                                                                                        )}

                                                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                                                            <span
                                                                                                className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${meta.badgeStyle}`}
                                                                                            >
                                                                                                {item.badgeText}
                                                                                            </span>
                                                                                            {item.secondaryPill && (
                                                                                                <span className="text-[10px] font-medium text-slate-600 bg-[#f4fbff] px-2 py-0.5 rounded border border-[#e2e8f0]">
                                                                                                    {item.secondaryPill}
                                                                                                </span>
                                                                                            )}
                                                                                            {item.tertiaryTag && (
                                                                                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                                                                    {item.tertiaryTag}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>

                                                                                        {item.metaInfo && (
                                                                                            <p className="text-[10px] text-slate-500 mt-2 truncate">
                                                                                                {item.metaInfo}
                                                                                            </p>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div className="px-4 py-2.5 bg-[#f4fbff] border-t border-[#e2e8f0] flex items-center gap-2 flex-wrap">
                                                                                {validFileUrl ? (
                                                                                    item.externalOnly ? (
                                                                                        <a
                                                                                            href={validFileUrl}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white text-[#01b0ef] border border-[#e2e8f0] rounded-lg text-xs font-bold hover:bg-[#01b0ef] hover:text-white hover:border-[#01b0ef] transition-all duration-150 shadow-sm cursor-pointer"
                                                                                        >
                                                                                            <FaArrowUpRightFromSquare
                                                                                                size={11}
                                                                                            />
                                                                                            <span>Acessar Documento</span>
                                                                                        </a>
                                                                                    ) : (
                                                                                        <>
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() =>
                                                                                                    setPdfViewer({
                                                                                                        url: validFileUrl,
                                                                                                        titulo:
                                                                                                            item.onViewTitle ||
                                                                                                            cleanTitle,
                                                                                                    })
                                                                                                }
                                                                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white text-[#01b0ef] border border-[#e2e8f0] rounded-lg text-xs font-bold hover:bg-[#01b0ef] hover:text-white hover:border-[#01b0ef] transition-all duration-150 shadow-sm cursor-pointer"
                                                                                            >
                                                                                                <FaEye size={12} />
                                                                                                <span>Visualizar</span>
                                                                                            </button>
                                                                                            <a
                                                                                                href={validFileUrl}
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                                className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white text-slate-900 border border-[#e2e8f0] rounded-lg text-xs font-bold hover:bg-[#0f172a] hover:text-white transition-all duration-150 cursor-pointer"
                                                                                            >
                                                                                                <FaDownload size={11} />
                                                                                                <span>Baixar</span>
                                                                                            </a>
                                                                                        </>
                                                                                    )
                                                                                ) : (
                                                                                    <div className="w-full py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold text-center border border-dashed border-slate-200">
                                                                                        Arquivo Indisponível
                                                                                    </div>
                                                                                )}
                                                                                {validExtraUrl && (
                                                                                    <a
                                                                                        href={validExtraUrl}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white text-slate-800 border border-[#e2e8f0] rounded-lg text-xs font-bold hover:bg-[#fdb913] hover:text-slate-900 transition-all duration-150 cursor-pointer"
                                                                                    >
                                                                                        <FaDownload size={11} />
                                                                                        <span>
                                                                                            {item.extraLabel || "Editável"}
                                                                                        </span>
                                                                                    </a>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {bottomContent && <div className="mt-12">{bottomContent}</div>}

                {!embedded && (
                    <div className="mt-16">
                        <BannerPNTP
                            criterio={bannerProps?.criterio}
                            requisito={bannerProps?.requisito}
                            status={bannerProps?.status}
                        />
                    </div>
                )}
            </div>

            <AnimatePresence>
                {pdfViewer && (
                    <PDFViewer
                        url={pdfViewer.url}
                        titulo={pdfViewer.titulo}
                        onClose={closePdfViewer}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

const SelectChevron = () => (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
    </div>
);
