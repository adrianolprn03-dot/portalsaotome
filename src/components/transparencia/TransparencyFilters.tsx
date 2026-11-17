"use client";
import { Search, X, FileText, FileSpreadsheet, FileCode } from "lucide-react";
import { useEffect } from "react";
import { MUNICIPIO } from "@/config/municipio";

interface TransparencyFiltersProps {
    onSearch: (query: string) => void;
    onYearChange?: (year: string) => void;
    onMonthChange?: (month: string) => void;
    onClear: () => void;
    onExport: (format: "pdf" | "csv" | "json" | "xlsx") => void;
    availableYears?: string[];
    currentYear?: string;
    currentMonth?: string;
    searchValue: string;
    placeholder?: string;
    hideYearFilter?: boolean;
    hideMonthFilter?: boolean;
    children?: React.ReactNode;
}

export default function TransparencyFilters({
    onSearch,
    onYearChange = () => {},
    onMonthChange = () => {},
    onClear,
    onExport,
    availableYears = MUNICIPIO.cicloAvaliacaoAnos || [
        "2026",
        "2025",
        "2024",
        "2023",
        "2022",
    ],
    currentYear = "",
    currentMonth = "",
    searchValue,
    placeholder = "Pesquisar nos resultados...",
    hideYearFilter = false,
    hideMonthFilter = false,
    children,
}: TransparencyFiltersProps) {
    const meses = [
        { v: "", l: "Todos os Meses" },
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

    useEffect(() => {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        const urlAno = params.get("ano");
        const urlMes = params.get("mes");
        const urlQ = params.get("q");

        if (urlAno && !hideYearFilter && urlAno !== currentYear)
            onYearChange(urlAno);
        if (urlMes !== null && !hideMonthFilter && urlMes !== currentMonth)
            onMonthChange(urlMes);
        if (urlQ && urlQ !== searchValue) onSearch(urlQ);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        if (!hideYearFilter && currentYear) params.set("ano", currentYear);
        else if (!hideYearFilter && !currentYear) params.delete("ano");

        if (!hideMonthFilter && currentMonth) params.set("mes", currentMonth);
        else if (!hideMonthFilter && !currentMonth) params.delete("mes");

        if (searchValue) params.set("q", searchValue);
        else params.delete("q");

        const qs = params.toString();
        const newUrl = qs
            ? `${window.location.pathname}?${qs}`
            : window.location.pathname;
        window.history.replaceState(null, "", newUrl);
    }, [currentYear, currentMonth, searchValue, hideYearFilter, hideMonthFilter]);

    return (
        <div className="bg-white rounded-2xl shadow-civic-sm border border-slate-200/80 p-5 sm:p-6 mb-8 relative z-40">
            <div className="flex flex-wrap items-end gap-4">
                {/* Busca Textual */}
                <div className="flex-1 min-w-[260px]">
                    <label
                        htmlFor="transparencia-busca-textual"
                        className="block text-xs font-bold text-slate-600 mb-1.5"
                    >
                        Busca Textual
                    </label>
                    <div className="relative group">
                        <Search
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors"
                        />
                        <input
                            id="transparencia-busca-textual"
                            type="text"
                            value={searchValue}
                            onChange={(e) => onSearch(e.target.value)}
                            placeholder={placeholder}
                            className="input-field pl-11 py-2.5 text-xs"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-end gap-3 w-full lg:w-auto">
                    {!hideYearFilter && (
                        <div className="w-full sm:w-28">
                            <label
                                htmlFor="transparencia-filtro-ano"
                                className="block text-xs font-bold text-slate-600 mb-1.5"
                            >
                                Exercício
                            </label>
                            <select
                                id="transparencia-filtro-ano"
                                value={currentYear}
                                onChange={(e) => onYearChange(e.target.value)}
                                className="input-field py-2.5 px-3 text-xs font-mono font-bold cursor-pointer"
                            >
                                {availableYears.map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {!hideMonthFilter && (
                        <div className="w-full sm:w-40">
                            <label
                                htmlFor="transparencia-filtro-mes"
                                className="block text-xs font-bold text-slate-600 mb-1.5"
                            >
                                Período
                            </label>
                            <select
                                id="transparencia-filtro-mes"
                                value={currentMonth}
                                onChange={(e) => onMonthChange(e.target.value)}
                                className="input-field py-2.5 px-3 text-xs font-semibold cursor-pointer"
                            >
                                {meses.map((m) => (
                                    <option key={m.v} value={m.v}>
                                        {m.l}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Ações e Exportação */}
                    <div className="flex flex-wrap items-center gap-2 lg:ml-1">
                        <button
                            type="button"
                            onClick={onClear}
                            aria-label="Limpar filtros"
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 w-10 h-10 rounded-xl transition-all border border-slate-200/80 flex items-center justify-center shrink-0"
                            title="Limpar Filtros"
                        >
                            <X size={16} />
                        </button>

                        <div className="h-7 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => onExport("pdf")}
                                className="bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white px-3 py-2.5 rounded-xl transition-all border border-rose-200 hover:border-rose-600 flex items-center gap-1.5 font-mono font-bold text-[11px]"
                                title="Exportar resultados filtrados em PDF"
                            >
                                <FileText size={14} />
                                <span className="hidden sm:inline">PDF</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => onExport("csv")}
                                className="bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white px-3 py-2.5 rounded-xl transition-all border border-emerald-200 hover:border-emerald-600 flex items-center gap-1.5 font-mono font-bold text-[11px]"
                                title="Exportar resultados filtrados em CSV"
                            >
                                <FileSpreadsheet size={14} />
                                <span className="hidden sm:inline">CSV</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => onExport("xlsx")}
                                className="bg-primary-50 hover:bg-primary-600 text-primary-700 hover:text-white px-3 py-2.5 rounded-xl transition-all border border-primary-200 hover:border-primary-600 flex items-center gap-1.5 font-mono font-bold text-[11px]"
                                title="Exportar resultados filtrados em Planilha Excel (XLSX)"
                            >
                                <FileSpreadsheet size={14} />
                                <span className="hidden sm:inline">XLSX</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => onExport("json")}
                                className="bg-slate-100 hover:bg-[#071E3D] text-slate-700 hover:text-white px-3 py-2.5 rounded-xl transition-all border border-slate-200 hover:border-[#071E3D] flex items-center gap-1.5 font-mono font-bold text-[11px]"
                                title="Exportar resultados filtrados em JSON"
                            >
                                <FileCode size={14} />
                                <span className="hidden sm:inline">JSON</span>
                            </button>
                        </div>
                    </div>
                </div>

                {children && (
                    <div className="w-full flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 mt-1">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}
