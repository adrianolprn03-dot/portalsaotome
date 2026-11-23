"use client";

import { useState, useEffect, useMemo } from "react";
import {
    FaBriefcase,
    FaCheckCircle,
    FaInfoCircle,
    FaLock,
} from "react-icons/fa";
import { exportToPDF, exportToCSV, exportToXLSX } from "@/lib/exportUtils";
import { isValidPublicUrl } from "@/lib/portal-links";
import { MESES } from "@/app/(site)/transparencia/legislacao/_LegislacaoClient";
import LRFDocumentCatalog, {
    type ActiveFilterBadge,
    type CatalogCategoryMeta,
    type CatalogItem,
    type CatalogStatCard,
} from "@/components/transparencia/LRFDocumentCatalog";

interface Concurso {
    id: string;
    titulo: string;
    tipo: string;
    status: string;
    vagas: string | null;
    dataPublicacao: string;
    linkEdital: string | null;
    descricao: string | null;
}

const getConcursoCategoryMeta = (catKey: string): CatalogCategoryMeta => {
    const lower = (catKey || "").toLowerCase();
    if (lower === "concurso") {
        return {
            title: "Concursos Públicos",
            subtitle: "Editais, retificações, resultados e homologações de provimento efetivo",
            badgeStyle: "bg-blue-50 text-[#01b0ef] border-blue-200",
            icon: <FaBriefcase className="text-[#01b0ef]" size={15} />,
            itemSingular: "edital",
            itemPlural: "editais",
        };
    }
    if (lower === "pss" || lower === "processo-seletivo") {
        return {
            title: "Processos Seletivos Simplificados (PSS)",
            subtitle: "Seleções públicas e contratações temporárias de pessoal",
            badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
            icon: <FaCheckCircle className="text-emerald-600" size={15} />,
            itemSingular: "seleção",
            itemPlural: "seleções",
        };
    }
    return {
        title: "Editais e Chamamentos Públicos",
        subtitle: "Convocações, notificações e processos públicos diversos",
        badgeStyle: "bg-amber-50 text-amber-800 border-amber-200",
        icon: <FaBriefcase className="text-amber-600" size={15} />,
        itemSingular: "edital",
        itemPlural: "editais",
    };
};

export default function ConcursosClient({
    initialData,
    typeFilter = "concurso",
    title = "Concursos e Seleções",
    subtitle = "Acompanhe os editais, convocações e resultados dos processos seletivos municipais.",
    specialBannerText,
}: {
    initialData: Concurso[];
    typeFilter?: string;
    title?: string;
    subtitle?: string;
    specialBannerText?: string;
}) {
    const [items, setItems] = useState<Concurso[]>(initialData);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [year, setYear] = useState<number | null>(null);
    const [month, setMonth] = useState<number | null>(null);
    const [status, setStatus] = useState("TODOS");
    const [ordem, setOrdem] = useState<"desc" | "asc">("desc");

    useEffect(() => {
        let active = true;
        async function fetchData() {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    q: search,
                    year: year ? String(year) : "TODOS",
                    month: month ? String(month) : "",
                    type: typeFilter,
                    status,
                });
                const res = await fetch(`/api/concursos?${params.toString()}`);
                if (res.ok && active) {
                    const data = await res.json();
                    setItems(Array.isArray(data.items) ? data.items : []);
                }
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            } finally {
                if (active) setLoading(false);
            }
        }
        fetchData();
        return () => {
            active = false;
        };
    }, [search, year, month, status, typeFilter]);

    const handleClear = () => {
        setSearch("");
        setYear(null);
        setMonth(null);
        setStatus("TODOS");
        setOrdem("desc");
    };

    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            const tA = new Date(a.dataPublicacao).getTime();
            const tB = new Date(b.dataPublicacao).getTime();
            return ordem === "desc" ? tB - tA : tA - tB;
        });
    }, [items, ordem]);

    const handleExport = (format: "pdf" | "csv" | "xlsx") => {
        const dataToExport = sortedItems.map((i) => ({
            "Título": i.titulo,
            Tipo: i.tipo.toUpperCase(),
            "Situação": i.status === "aberto" ? "Aberto" : "Encerrado",
            Vagas: i.vagas || "N/A",
            "Data de Publicação": new Date(i.dataPublicacao).toLocaleDateString("pt-BR"),
            Link: i.linkEdital || "Não disponível",
        }));

        const filename = `${typeFilter}_${year || "geral"}`;
        const exportTitle = `Portal da Transparência - ${title}${year ? ` (${year})` : ""}`;

        if (format === "pdf") exportToPDF(dataToExport, filename, exportTitle);
        else if (format === "csv") exportToCSV(dataToExport, filename);
        else exportToXLSX(dataToExport, filename);
    };

    const availableYears = useMemo(() => {
        const set = new Set<number>([2026, 2025, 2024, 2023, 2022, 2021]);
        items.forEach((i) => {
            const y = new Date(i.dataPublicacao).getFullYear();
            if (!isNaN(y)) set.add(y);
        });
        return Array.from(set).sort((a, b) => b - a);
    }, [items]);

    const anosExibicao = useMemo(() => {
        const set = new Set<number>();
        sortedItems.forEach((i) => {
            const y = new Date(i.dataPublicacao).getFullYear();
            if (!isNaN(y)) set.add(y);
        });
        return Array.from(set).sort((a, b) => (ordem === "desc" ? b - a : a - b));
    }, [sortedItems, ordem]);

    const stats: CatalogStatCard[] = [
        {
            label: "Total de Editais",
            value: sortedItems.length,
            sublabel: "Certames e seleções catalogadas",
            icon: <FaBriefcase size={20} />,
            variant: "primary",
        },
        {
            label: "Inscrições Abertas",
            value: sortedItems.filter((i) => i.status === "aberto").length,
            sublabel: "Em andamento",
            icon: <FaCheckCircle size={20} />,
            variant: "emerald",
        },
        {
            label: "Finalizados",
            value: sortedItems.filter((i) => i.status !== "aberto").length,
            sublabel: "Certames encerrados",
            icon: <FaLock size={20} />,
            variant: "amber",
        },
    ];

    const catalogItems: CatalogItem[] = useMemo(
        () =>
            sortedItems.map((i) => {
                const pubDate = new Date(i.dataPublicacao);
                const itemYear = !isNaN(pubDate.getTime())
                    ? pubDate.getFullYear()
                    : new Date().getFullYear();
                const link = isValidPublicUrl(i.linkEdital) ? i.linkEdital! : null;
                const isViewableFile = Boolean(
                    link &&
                        (link.toLowerCase().includes(".pdf") ||
                            link.includes("drive.google.com") ||
                            link.startsWith("/uploads/"))
                );

                return {
                    id: i.id,
                    ano: itemYear,
                    categoriaKey: i.tipo || typeFilter,
                    badgeText: i.tipo.toUpperCase(),
                    secondaryPill: !isNaN(pubDate.getTime())
                        ? `Publicado em ${pubDate.toLocaleDateString("pt-BR")}`
                        : undefined,
                    tertiaryTag: i.status === "aberto" ? "Inscrições Abertas" : "Finalizado",
                    titulo: i.titulo,
                    descricao: i.descricao || undefined,
                    metaInfo: i.vagas ? `Vagas: ${i.vagas}` : undefined,
                    fileUrl: link,
                    externalOnly: link ? !isViewableFile : false,
                };
            }),
        [sortedItems, typeFilter]
    );

    const activeFilterBadges: ActiveFilterBadge[] = [];
    if (status !== "TODOS") {
        activeFilterBadges.push({
            key: "status",
            label: status === "aberto" ? "Inscrições Abertas" : "Encerrado",
            colorClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
            onClear: () => setStatus("TODOS"),
        });
    }
    if (year) {
        activeFilterBadges.push({
            key: "ano",
            label: `Ano: ${year}`,
            colorClass: "bg-amber-50 text-amber-800 border-amber-200",
            onClear: () => setYear(null),
        });
    }
    if (month) {
        activeFilterBadges.push({
            key: "mes",
            label: `Mês: ${MESES.find((m) => m.v === String(month))?.l}`,
            colorClass: "bg-blue-50 text-[#01b0ef] border-blue-200",
            onClear: () => setMonth(null),
        });
    }
    if (search) {
        activeFilterBadges.push({
            key: "busca",
            label: `"${search}"`,
            colorClass: "bg-sky-50 text-sky-800 border-sky-200",
            onClear: () => setSearch(""),
        });
    }

    const avisoBanner =
        specialBannerText && sortedItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-amber-200/80 shadow-xl shadow-amber-500/5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-3 bg-[#fdb913] text-slate-900 rounded-2xl shrink-0">
                    <FaInfoCircle size={20} />
                </div>
                <div>
                    <span className="text-[10px] font-black text-slate-900 bg-[#fff4d4] px-2.5 py-0.5 rounded-full uppercase tracking-widest inline-block mb-1">
                        Comunicação Oficial
                    </span>
                    <p className="text-slate-800 font-bold text-sm md:text-base">
                        {specialBannerText}
                    </p>
                </div>
            </div>
        ) : null;

    return (
        <LRFDocumentCatalog
            title={title}
            subtitle={subtitle}
            icon={<FaBriefcase />}
            breadcrumbs={[
                { label: "Início", href: "/" },
                { label: "Transparência", href: "/transparencia" },
                { label: title },
            ]}
            topBanner={avisoBanner}
            stats={stats}
            loading={loading}
            loadingText="Atualizando editais e seleções..."
            totalCount={sortedItems.length}
            items={catalogItems}
            availableYears={availableYears}
            orderedYears={anosExibicao}
            yearSubtitle="Editais, Convocações e Seleções"
            listTabLabel="Editais Oficiais"
            yearGroupUnitSingular="edital"
            yearGroupUnitPlural="editais"
            tabs={[
                { id: "TODOS", label: "Todos" },
                { id: "aberto", label: "Aberto" },
                { id: "encerrado", label: "Encerrado" },
            ]}
            tabsLabel="Situação do Certame"
            activeTab={status}
            onTabChange={setStatus}
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Buscar por título ou descrição..."
            yearValue={year}
            onYearChange={setYear}
            monthOptions={MESES}
            monthValue={month}
            onMonthChange={setMonth}
            sortOrder={ordem}
            onToggleSortOrder={() => setOrdem((prev) => (prev === "desc" ? "asc" : "desc"))}
            onExport={handleExport}
            activeFilterBadges={activeFilterBadges}
            hasActiveFilters={Boolean(search || year || month || status !== "TODOS")}
            onClearAllFilters={handleClear}
            getCategoryMeta={getConcursoCategoryMeta}
            emptyTitle="Nenhum registro encontrado"
            emptyDescription="Tente ajustar seus filtros ou buscar por outro termo."
            emptyIcon={<FaBriefcase size={28} />}
        />
    );
}
