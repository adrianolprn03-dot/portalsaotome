"use client";

import { useState, useEffect, useMemo } from "react";
import {
    FaCalendarDays,
    FaFilePdf,
    FaHeartPulse,
    FaNotesMedical,
    FaClipboardCheck,
    FaChartLine,
} from "react-icons/fa6";
import { exportToCSV, exportToPDF, exportToXLSX } from "@/lib/exportUtils";
import { isValidPublicUrl } from "@/lib/portal-links";
import LRFDocumentCatalog, {
    type ActiveFilterBadge,
    type CatalogCategoryMeta,
    type CatalogItem,
    type CatalogStatCard,
} from "@/components/transparencia/LRFDocumentCatalog";

type DocumentoSaude = {
    id: string;
    titulo: string;
    categoria: string; // "pms", "pas", "rag", "rdqa"
    anoExercicio: number;
    periodoVigencia: string | null;
    statusConselho: string | null;
    numeroResolucao: string | null;
    descricao: string | null;
    linkDocumento: string | null;
    criadoEm: string;
};

interface PlanoSaudeClientPageProps {
    categoriaInicial?: string;
    pageTitle?: string;
    pageSubtitle?: string;
    breadcrumbLabel?: string;
}

const SAUDE_META: Record<string, CatalogCategoryMeta> = {
    pms: {
        title: "PMS - Plano Municipal de Saúde",
        subtitle: "Planejamento quadrienal estratégico de diretrizes e metas do SUS",
        badgeStyle: "bg-blue-50 text-[#01b0ef] border-blue-200",
        icon: <FaHeartPulse className="text-[#01b0ef]" size={16} />,
        itemSingular: "documento",
        itemPlural: "documentos",
    },
    pas: {
        title: "PAS - Programação Anual de Saúde",
        subtitle: "Operacionalização anual de ações, metas e recursos do SUS",
        badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: <FaClipboardCheck className="text-emerald-600" size={16} />,
        itemSingular: "documento",
        itemPlural: "documentos",
    },
    rag: {
        title: "RAG - Relatório Anual de Gestão",
        subtitle: "Prestação de contas comprobatória anual com parecer do CMS",
        badgeStyle: "bg-purple-50 text-purple-700 border-purple-200",
        icon: <FaChartLine className="text-purple-600" size={16} />,
        itemSingular: "relatório",
        itemPlural: "relatórios",
    },
    rdqa: {
        title: "RDQA - Relatório Detalhado do Quadrimestre Anterior",
        subtitle: "Monitoramento quadrimestral de execução físico-financeira em saúde",
        badgeStyle: "bg-amber-50 text-amber-800 border-amber-200",
        icon: <FaNotesMedical className="text-amber-600" size={16} />,
        itemSingular: "relatório",
        itemPlural: "relatórios",
    },
};

const SAUDE_PRIORITY: Record<string, number> = {
    pms: 1,
    pas: 2,
    rag: 3,
    rdqa: 4,
};

function normalizeDocumentUrl(url: string | null): string | null {
    if (!url) return null;
    let cleanUrl = url.trim();
    if (!cleanUrl || cleanUrl === "#") return null;
    if (cleanUrl.startsWith("/")) return cleanUrl;
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
        cleanUrl = `https://${cleanUrl}`;
    }
    if (cleanUrl.includes("drive.google.com") && cleanUrl.includes("/file/d/") && !cleanUrl.includes("usp=")) {
        cleanUrl = cleanUrl.replace(/\/view.*$/, "/view?usp=sharing");
    }
    return isValidPublicUrl(cleanUrl) ? cleanUrl : null;
}

export default function PlanoSaudeClientPage({
    categoriaInicial = "todos",
    pageTitle = "Plano Municipal de Saúde",
    pageSubtitle = "Planejamento quadrienal com diretrizes, metas e prestações de contas da saúde municipal (PMS, PAS, RAG e RDQA).",
    breadcrumbLabel = "Plano de Saúde",
}: PlanoSaudeClientPageProps) {
    const [documentos, setDocumentos] = useState<DocumentoSaude[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoriaFiltro, setCategoriaFiltro] = useState(categoriaInicial);
    const [anoFiltro, setAnoFiltro] = useState<number | null>(null);
    const [busca, setBusca] = useState("");
    const [ordem, setOrdem] = useState<"desc" | "asc">("desc");

    useEffect(() => {
        const fetchDocumentos = async () => {
            setLoading(true);
            try {
                const [saudeRes, docRes] = await Promise.all([
                    fetch("/api/transparencia/saude", { cache: "no-store" }),
                    fetch("/api/documentos?tipo=plano-saude,pas,rag,rdqa", { cache: "no-store" }),
                ]);

                const saudeList: DocumentoSaude[] =
                    saudeRes.ok ? await saudeRes.json() : [];
                const combined: DocumentoSaude[] = Array.isArray(saudeList) ? [...saudeList] : [];
                const seenUrls = new Set(
                    combined
                        .map((d) => normalizeDocumentUrl(d.linkDocumento)?.toLowerCase())
                        .filter(Boolean)
                );

                if (docRes.ok) {
                    const docsData = await docRes.json();
                    if (Array.isArray(docsData)) {
                        for (const d of docsData) {
                            if (d.ativo === false) continue;
                            const rawUrl = d.arquivo || d.documentUrl || null;
                            const normUrl = normalizeDocumentUrl(rawUrl)?.toLowerCase();
                            if (normUrl && seenUrls.has(normUrl)) continue;
                            if (normUrl) seenUrls.add(normUrl);

                            const cat =
                                d.tipo === "plano-saude"
                                    ? "pms"
                                    : ["pas", "rag", "rdqa"].includes((d.tipo || "").toLowerCase())
                                    ? d.tipo.toLowerCase()
                                    : "pms";

                            combined.push({
                                id: `doc-${d.id}`,
                                titulo: d.titulo,
                                categoria: cat,
                                anoExercicio: d.ano || new Date(d.criadoEm).getFullYear(),
                                periodoVigencia: d.competencia || null,
                                statusConselho: null,
                                numeroResolucao: null,
                                descricao: d.descricao || null,
                                linkDocumento: rawUrl,
                                criadoEm: d.criadoEm,
                            });
                        }
                    }
                }

                setDocumentos(combined);
            } catch (error) {
                console.error("Erro ao buscar documentos da transparência da saúde:", error);
                setDocumentos([]);
            } finally {
                setLoading(false);
            }
        };
        fetchDocumentos();
    }, []);

    const anosDisponiveis = useMemo(() => {
        return Array.from(
            new Set(documentos.map((d) => d?.anoExercicio).filter(Boolean))
        ).sort((a, b) => b - a);
    }, [documentos]);

    const documentosFiltrados = useMemo(() => {
        const q = busca.toLowerCase().trim();
        return documentos
            .filter((doc) => {
                if (!doc) return false;
                const matchCat =
                    categoriaFiltro === "todos" || doc.categoria === categoriaFiltro;
                const matchAno = anoFiltro === null || doc.anoExercicio === anoFiltro;
                const matchBusca =
                    !q ||
                    (doc.titulo || "").toLowerCase().includes(q) ||
                    (doc.descricao || "").toLowerCase().includes(q) ||
                    (doc.numeroResolucao || "").toLowerCase().includes(q) ||
                    (doc.periodoVigencia || "").toLowerCase().includes(q);
                return matchCat && matchAno && matchBusca;
            })
            .sort((a, b) =>
                ordem === "desc"
                    ? b.anoExercicio - a.anoExercicio
                    : a.anoExercicio - b.anoExercicio
            );
    }, [documentos, categoriaFiltro, anoFiltro, busca, ordem]);

    const anosExibicao = useMemo(() => {
        return Array.from(new Set(documentosFiltrados.map((d) => d.anoExercicio))).sort((a, b) =>
            ordem === "desc" ? b - a : a - b
        );
    }, [documentosFiltrados, ordem]);

    const handleExport = (format: "pdf" | "csv" | "xlsx") => {
        const payload = documentosFiltrados.map((d) => ({
            Instrumento: (d.categoria || "").toUpperCase(),
            "Título": d.titulo,
            Exercício: d.anoExercicio,
            "Vigência": d.periodoVigencia || "-",
            "Resolução CMS": d.numeroResolucao || "-",
            "Status CMS": d.statusConselho || "-",
            Link: normalizeDocumentUrl(d.linkDocumento) || "Não disponível",
        }));
        const filename = `gestao_saude_${categoriaFiltro}_${anoFiltro || "geral"}`;
        const exportTitle = `${pageTitle} – São Tomé/RN`;
        if (format === "csv") exportToCSV(payload, filename);
        else if (format === "xlsx") exportToXLSX(payload, filename);
        else exportToPDF(payload, filename, exportTitle);
    };

    const currentYear = new Date().getFullYear();

    const stats: CatalogStatCard[] = [
        {
            label: "Total de Instrumentos",
            value: documentosFiltrados.length,
            sublabel: "Documentos da Gestão do SUS",
            icon: <FaHeartPulse size={20} />,
            variant: "primary",
        },
        {
            label: `Exercício ${currentYear}`,
            value: documentos.filter((d) => d.anoExercicio === currentYear).length,
            sublabel: "Publicações no ano vigente",
            icon: <FaCalendarDays size={20} />,
            variant: "emerald",
        },
        {
            label: "Documentos Publicados",
            value: documentosFiltrados.filter((d) => normalizeDocumentUrl(d.linkDocumento)).length,
            sublabel: "Disponíveis para consulta",
            icon: <FaFilePdf size={20} />,
            variant: "amber",
        },
    ];

    const catalogItems: CatalogItem[] = useMemo(
        () =>
            documentosFiltrados.map((d) => {
                const fileUrl = normalizeDocumentUrl(d.linkDocumento);
                return {
                    id: d.id,
                    ano: d.anoExercicio,
                    categoriaKey: d.categoria,
                    badgeText: (d.categoria || "SUS").toUpperCase(),
                    secondaryPill: d.periodoVigencia ? `Vigência: ${d.periodoVigencia}` : undefined,
                    tertiaryTag: d.statusConselho || undefined,
                    titulo: d.titulo,
                    descricao: d.descricao || undefined,
                    metaInfo: d.numeroResolucao || undefined,
                    fileUrl,
                };
            }),
        [documentosFiltrados]
    );

    const chartSourceItems: CatalogItem[] = useMemo(
        () =>
            documentos.map((d) => ({
                id: d.id,
                ano: d.anoExercicio,
                categoriaKey: d.categoria,
                badgeText: (d.categoria || "SUS").toUpperCase(),
                titulo: d.titulo,
                fileUrl: normalizeDocumentUrl(d.linkDocumento),
            })),
        [documentos]
    );

    const activeFilterBadges: ActiveFilterBadge[] = [];
    if (categoriaFiltro !== "todos") {
        activeFilterBadges.push({
            key: "cat",
            label: categoriaFiltro.toUpperCase(),
            colorClass: "bg-blue-50 text-[#01b0ef] border-blue-200",
            onClear: () => setCategoriaFiltro("todos"),
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
            title={pageTitle}
            subtitle={pageSubtitle}
            icon={<FaHeartPulse />}
            breadcrumbs={[
                { label: "Início", href: "/" },
                { label: "Transparência", href: "/transparencia" },
                { label: breadcrumbLabel },
            ]}
            stats={stats}
            loading={loading}
            loadingText="Carregando documentos da gestão da saúde..."
            totalCount={documentos.length}
            items={catalogItems}
            chartSourceItems={chartSourceItems}
            availableYears={anosDisponiveis}
            orderedYears={anosExibicao}
            yearSubtitle="Instrumentos de Planejamento e Gestão do SUS"
            tabs={[
                { id: "todos", label: "Todos" },
                { id: "pms", label: "PMS (Plano Municipal)" },
                { id: "pas", label: "PAS (Programação Anual)" },
                { id: "rag", label: "RAG (Relatório Anual)" },
                { id: "rdqa", label: "RDQA (Quadrimestral)" },
            ]}
            tabsLabel="Instrumento de Saúde (LC 141/2012)"
            activeTab={categoriaFiltro}
            onTabChange={setCategoriaFiltro}
            searchValue={busca}
            onSearchChange={setBusca}
            searchPlaceholder="Pesquisar por título, metas ou resolução do CMS..."
            yearValue={anoFiltro}
            onYearChange={setAnoFiltro}
            sortOrder={ordem}
            onToggleSortOrder={() => setOrdem((prev) => (prev === "desc" ? "asc" : "desc"))}
            onExport={handleExport}
            activeFilterBadges={activeFilterBadges}
            hasActiveFilters={Boolean(
                busca || anoFiltro || categoriaFiltro !== "todos"
            )}
            onClearAllFilters={() => {
                setBusca("");
                setAnoFiltro(null);
                setCategoriaFiltro("todos");
            }}
            getCategoryMeta={(key) =>
                SAUDE_META[key] || {
                    title: key.toUpperCase(),
                    subtitle: "Documento oficial da Saúde Municipal",
                    badgeStyle: "bg-slate-100 text-slate-700 border-slate-200",
                    icon: <FaNotesMedical className="text-slate-600" size={16} />,
                }
            }
            getCategoryPriority={(key) => SAUDE_PRIORITY[key] ?? 10}
            emptyIcon={<FaNotesMedical size={28} />}
        />
    );
}
