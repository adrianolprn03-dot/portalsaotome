"use client";

import { useState, useEffect, useMemo } from "react";
import {
    FaNewspaper,
    FaCalendarDays,
    FaFilePdf,
    FaFileLines,
    FaTag,
} from "react-icons/fa6";
import { exportToCSV, exportToPDF, exportToXLSX } from "@/lib/exportUtils";
import { isValidPublicUrl } from "@/lib/portal-links";
import { MESES } from "@/app/(site)/transparencia/legislacao/_LegislacaoClient";
import LRFDocumentCatalog, {
    type ActiveFilterBadge,
    type CatalogCategoryMeta,
    type CatalogItem,
    type CatalogStatCard,
} from "@/components/transparencia/LRFDocumentCatalog";

type Publicacao = {
    id: string;
    titulo: string;
    tipo: string;
    descricao: string;
    dataPublicacao: string;
    ano: number;
    mes: number;
    secretaria: string;
    arquivo: string | null;
    documentUrl: string | null;
};

const TIPOS = [
    "Diário Oficial",
    "Edital",
    "Aviso",
    "Resultado",
    "Extrato de Contrato",
    "Extrato de Convênio",
    "Ata de Registro de Preços",
    "Nota de Esclarecimento",
    "Portaria",
    "Decreto Municipal",
    "Resolução",
    "Lei Municipal",
];

const QUERY_TIPOS = [
    ...TIPOS,
    "Decreto",
    "Resolucao",
    "Outros",
].join(",");

const TIPO_BADGES: Record<string, string> = {
    "Diário Oficial": "bg-blue-50 text-[#01b0ef] border-blue-200",
    Edital: "bg-purple-50 text-purple-700 border-purple-200",
    Aviso: "bg-amber-50 text-amber-800 border-amber-200",
    Resultado: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Extrato de Contrato": "bg-orange-50 text-orange-700 border-orange-200",
    "Extrato de Convênio": "bg-cyan-50 text-cyan-700 border-cyan-200",
    "Ata de Registro de Preços": "bg-indigo-50 text-indigo-700 border-indigo-200",
    "Nota de Esclarecimento": "bg-slate-100 text-slate-700 border-slate-200",
    Portaria: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Decreto Municipal": "bg-indigo-50 text-indigo-700 border-indigo-200",
    Decreto: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Resolução: "bg-rose-50 text-rose-700 border-rose-200",
    "Lei Municipal": "bg-blue-50 text-[#01b0ef] border-blue-200",
};

const getPublicacaoMeta = (tipo: string): CatalogCategoryMeta => ({
    title: tipo || "Publicações Oficiais",
    subtitle: "Documentos oficiais e comunicados publicados",
    badgeStyle: TIPO_BADGES[tipo] || "bg-slate-100 text-slate-700 border-slate-200",
    icon: <FaTag className="text-[#01b0ef]" size={15} />,
    itemSingular: "publicação",
    itemPlural: "publicações",
});

export default function PublicacoesPage() {
    const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState("");
    const [anoFiltro, setAnoFiltro] = useState<number | null>(null);
    const [mesFiltro, setMesFiltro] = useState<number | null>(null);
    const [tipoFiltro, setTipoFiltro] = useState("");
    const [ordem, setOrdem] = useState<"desc" | "asc">("desc");

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const query = new URLSearchParams();
                if (tipoFiltro) {
                    const queryVal =
                        tipoFiltro === "Decreto Municipal"
                            ? "Decreto,Decreto Municipal"
                            : tipoFiltro;
                    query.append("tipo", queryVal);
                } else {
                    query.append("tipo", QUERY_TIPOS);
                }

                const res = await fetch(`/api/documentos?${query.toString()}`, {
                    cache: "no-store",
                });
                if (res.ok) {
                    const data = await res.json();
                    const formatted: Publicacao[] = (Array.isArray(data) ? data : [])
                        .filter((d: any) => d.ativo !== false)
                        .map((d: any) => {
                            const dt = new Date(d.criadoEm);
                            return {
                                id: String(d.id),
                                titulo: d.titulo || "Documento Oficial",
                                tipo: d.tipo === "Decreto" ? "Decreto Municipal" : d.tipo || "Outros",
                                descricao: d.descricao || "",
                                dataPublicacao: d.criadoEm,
                                ano: d.ano || (!isNaN(dt.getTime()) ? dt.getFullYear() : new Date().getFullYear()),
                                mes: !isNaN(dt.getTime()) ? dt.getMonth() + 1 : 1,
                                secretaria: d.secretaria || d.orgaoResponsavel || "Prefeitura Municipal",
                                arquivo: d.arquivo || null,
                                documentUrl: d.documentUrl || null,
                            };
                        });
                    setPublicacoes(formatted);
                }
            } catch (error) {
                console.error("Erro ao carregar publicações:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [tipoFiltro]);

    const filtradas = useMemo(() => {
        const b = busca.toLowerCase().trim();
        return publicacoes
            .filter((p) => {
                const matchBusca =
                    !b ||
                    p.titulo.toLowerCase().includes(b) ||
                    p.descricao.toLowerCase().includes(b) ||
                    p.tipo.toLowerCase().includes(b);
                const matchAno = anoFiltro === null || p.ano === anoFiltro;
                const matchMes = mesFiltro === null || p.mes === mesFiltro;
                return matchBusca && matchAno && matchMes;
            })
            .sort((a, bItem) => {
                const tA = new Date(a.dataPublicacao).getTime();
                const tB = new Date(bItem.dataPublicacao).getTime();
                return ordem === "desc" ? tB - tA : tA - tB;
            });
    }, [publicacoes, busca, anoFiltro, mesFiltro, ordem]);

    const todosOsAnos = useMemo(() => {
        return Array.from(new Set(publicacoes.map((p) => p.ano))).sort((a, b) => b - a);
    }, [publicacoes]);

    const anosExibicao = useMemo(() => {
        return Array.from(new Set(filtradas.map((p) => p.ano))).sort((a, b) =>
            ordem === "desc" ? b - a : a - b
        );
    }, [filtradas, ordem]);

    const handleClear = () => {
        setBusca("");
        setAnoFiltro(null);
        setMesFiltro(null);
        setTipoFiltro("");
        setOrdem("desc");
    };

    const handleExport = (format: "pdf" | "csv" | "xlsx") => {
        const payload = filtradas.map((p) => ({
            "Título": p.titulo,
            Tipo: p.tipo,
            "Órgão / Secretaria": p.secretaria,
            Ano: p.ano,
            Data: new Date(p.dataPublicacao).toLocaleDateString("pt-BR"),
            Arquivo: p.arquivo || p.documentUrl || "Não disponível",
        }));
        const filename = `publicacoes_oficiais_${anoFiltro || "geral"}`;
        const exportTitle = `Publicações Oficiais – São Tomé/RN${anoFiltro ? ` (${anoFiltro})` : ""}`;
        if (format === "csv") exportToCSV(payload, filename);
        else if (format === "xlsx") exportToXLSX(payload, filename);
        else exportToPDF(payload, filename, exportTitle);
    };

    const currentYear = new Date().getFullYear();

    const stats: CatalogStatCard[] = [
        {
            label: "Total de Publicações",
            value: filtradas.length,
            sublabel: "Atos e avisos catalogados",
            icon: <FaNewspaper size={20} />,
            variant: "primary",
        },
        {
            label: `Publicações ${currentYear}`,
            value: publicacoes.filter((p) => p.ano === currentYear).length,
            sublabel: "Registros no ano vigente",
            icon: <FaCalendarDays size={20} />,
            variant: "emerald",
        },
        {
            label: "Documentos Disponíveis",
            value: filtradas.filter((p) => isValidPublicUrl(p.arquivo || p.documentUrl)).length,
            sublabel: `${new Set(filtradas.map((p) => p.tipo)).size} categorias ativas`,
            icon: <FaFilePdf size={20} />,
            variant: "amber",
        },
    ];

    const catalogItems: CatalogItem[] = useMemo(
        () =>
            filtradas.map((p) => ({
                id: p.id,
                ano: p.ano,
                categoriaKey: p.tipo,
                badgeText: p.tipo,
                secondaryPill: new Date(p.dataPublicacao).toLocaleDateString("pt-BR"),
                titulo: p.titulo,
                descricao: p.descricao && p.descricao !== p.titulo ? p.descricao : undefined,
                metaInfo: p.secretaria,
                fileUrl: p.arquivo || p.documentUrl,
            })),
        [filtradas]
    );

    const chartSourceItems: CatalogItem[] = useMemo(
        () =>
            publicacoes.map((p) => ({
                id: p.id,
                ano: p.ano,
                categoriaKey: p.tipo,
                badgeText: p.tipo,
                titulo: p.titulo,
                fileUrl: p.arquivo || p.documentUrl,
            })),
        [publicacoes]
    );

    const activeFilterBadges: ActiveFilterBadge[] = [];
    if (tipoFiltro) {
        activeFilterBadges.push({
            key: "tipo",
            label: tipoFiltro,
            colorClass: "bg-blue-50 text-[#01b0ef] border-blue-200",
            onClear: () => setTipoFiltro(""),
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
            label: `Mês: ${MESES.find((m) => m.v === String(mesFiltro))?.l}`,
            colorClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
            onClear: () => setMesFiltro(null),
        });
    }
    if (busca) {
        activeFilterBadges.push({
            key: "busca",
            label: `"${busca}"`,
            colorClass: "bg-sky-50 text-sky-800 border-sky-200",
            onClear: () => setBusca(""),
        });
    }

    return (
        <LRFDocumentCatalog
            title="Publicações e Atos Oficiais"
            subtitle="Acesso centralizado a editais, avisos, decretos, portarias, extratos e demais atos da administração municipal."
            icon={<FaFileLines />}
            breadcrumbs={[
                { label: "Início", href: "/" },
                { label: "Transparência", href: "/transparencia" },
                { label: "Publicações Oficiais" },
            ]}
            stats={stats}
            loading={loading}
            loadingText="Carregando publicações oficiais..."
            totalCount={publicacoes.length}
            items={catalogItems}
            chartSourceItems={chartSourceItems}
            availableYears={todosOsAnos}
            orderedYears={anosExibicao}
            yearSubtitle="Atos e Publicações Oficiais"
            listTabLabel="Publicações Oficiais"
            yearGroupUnitSingular="publicação"
            yearGroupUnitPlural="publicações"
            searchValue={busca}
            onSearchChange={setBusca}
            searchPlaceholder="Buscar por título ou palavras-chave..."
            extraFilterSlot={
                <div className="relative w-full md:w-52">
                    <select
                        aria-label="Filtrar por tipo de ato"
                        value={tipoFiltro}
                        onChange={(e) => setTipoFiltro(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-[#01b0ef]/20 focus:border-[#01b0ef] transition-all outline-none cursor-pointer"
                    >
                        <option value="">Todos os tipos</option>
                        {TIPOS.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </div>
            }
            yearValue={anoFiltro}
            onYearChange={setAnoFiltro}
            monthOptions={MESES}
            monthValue={mesFiltro}
            onMonthChange={setMesFiltro}
            sortOrder={ordem}
            onToggleSortOrder={() => setOrdem((prev) => (prev === "desc" ? "asc" : "desc"))}
            onExport={handleExport}
            activeFilterBadges={activeFilterBadges}
            hasActiveFilters={Boolean(busca || anoFiltro || mesFiltro || tipoFiltro)}
            onClearAllFilters={handleClear}
            getCategoryMeta={getPublicacaoMeta}
            emptyTitle="Nenhuma publicação localizada"
            emptyDescription="Ajuste os filtros de ano, mês, tipo ou palavra-chave para encontrar a publicação desejada."
        />
    );
}
