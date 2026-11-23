"use client";

import React, { useState, useEffect, useMemo } from "react";
import { FaCalendarDays, FaFilePdf, FaFileLines, FaFolderOpen } from "react-icons/fa6";
import { exportToCSV, exportToPDF, exportToXLSX } from "@/lib/exportUtils";
import { isValidPublicUrl } from "@/lib/portal-links";
import LRFDocumentCatalog, {
    type ActiveFilterBadge,
    type CatalogCategoryMeta,
    type CatalogItem,
    type CatalogStatCard,
} from "@/components/transparencia/LRFDocumentCatalog";

type Documento = {
    id: string;
    titulo: string;
    descricao?: string | null;
    tipo: string;
    arquivo: string | null;
    documentUrl?: string | null;
    orgaoResponsavel?: string | null;
    secretaria?: string | null;
    competencia?: string | null;
    ano: number | null;
    criadoEm: string;
};

interface ListaDocumentosClientProps {
    tipoDocumento: string;
    tituloVazio?: string;
    mensagemVazia?: string;
    pageTitle?: string;
    pageSubtitle?: string;
    breadcrumbLabel?: string;
    yearSubtitle?: string;
    categoryTitle?: string;
    categorySubtitle?: string;
    criterioPntp?: string;
}

export default function ListaDocumentosClient({
    tipoDocumento,
    tituloVazio = "Nenhum documento encontrado",
    mensagemVazia = "Tente ajustar seus filtros ou realizar uma nova busca.",
    pageTitle,
    pageSubtitle,
    breadcrumbLabel,
    yearSubtitle = "Documentos Oficiais Publicados",
    categoryTitle,
    categorySubtitle = "Acervo oficial disponível para visualização e download",
    criterioPntp,
}: ListaDocumentosClientProps) {
    const [documentos, setDocumentos] = useState<Documento[]>([]);
    const [loading, setLoading] = useState(true);
    const [anoFiltro, setAnoFiltro] = useState<number | null>(null);
    const [buscaFiltro, setBuscaFiltro] = useState("");
    const [ordem, setOrdem] = useState<"desc" | "asc">("desc");

    useEffect(() => {
        async function fetchDocumentos() {
            setLoading(true);
            try {
                const query = new URLSearchParams();
                query.append("tipo", tipoDocumento);
                const res = await fetch(`/api/documentos?${query.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    setDocumentos(
                        (Array.isArray(data) ? data : []).filter((d: any) => d.ativo !== false)
                    );
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchDocumentos();
    }, [tipoDocumento]);

    const documentosFiltrados = useMemo(() => {
        const q = buscaFiltro.toLowerCase().trim();
        return documentos
            .filter((doc) => {
                const docYear = doc.ano || new Date(doc.criadoEm).getFullYear();
                const matchesAno = anoFiltro === null || docYear === anoFiltro;
                const matchesBusca =
                    !q ||
                    doc.titulo.toLowerCase().includes(q) ||
                    (doc.descricao || "").toLowerCase().includes(q) ||
                    (doc.competencia || "").toLowerCase().includes(q);
                return matchesAno && matchesBusca;
            })
            .sort((a, b) => {
                const yearA = a.ano || new Date(a.criadoEm).getFullYear();
                const yearB = b.ano || new Date(b.criadoEm).getFullYear();
                if (yearA !== yearB) return ordem === "desc" ? yearB - yearA : yearA - yearB;
                const tA = new Date(a.criadoEm).getTime();
                const tB = new Date(b.criadoEm).getTime();
                return ordem === "desc" ? tB - tA : tA - tB;
            });
    }, [documentos, buscaFiltro, anoFiltro, ordem]);

    const todosOsAnos = useMemo(() => {
        return Array.from(
            new Set(documentos.map((d) => d.ano || new Date(d.criadoEm).getFullYear()))
        ).sort((a, b) => b - a);
    }, [documentos]);

    const anosExibicao = useMemo(() => {
        return Array.from(
            new Set(documentosFiltrados.map((d) => d.ano || new Date(d.criadoEm).getFullYear()))
        ).sort((a, b) => (ordem === "desc" ? b - a : a - b));
    }, [documentosFiltrados, ordem]);

    const handleExport = (format: "pdf" | "csv" | "xlsx") => {
        const payload = documentosFiltrados.map((d) => ({
            "Título": d.titulo,
            Categoria: categoryTitle || tipoDocumento.replace(/-/g, " "),
            Ano: d.ano || new Date(d.criadoEm).getFullYear(),
            "Data de Publicação": new Date(d.criadoEm).toLocaleDateString("pt-BR"),
            Link: d.arquivo || d.documentUrl || "Não disponível",
        }));
        const filename = `documentos_${tipoDocumento}${anoFiltro ? `_${anoFiltro}` : ""}`;
        const exportTitle = `${pageTitle || "Acervo de Documentos"} – São Tomé/RN`;
        if (format === "csv") exportToCSV(payload, filename);
        else if (format === "xlsx") exportToXLSX(payload, filename);
        else exportToPDF(payload, filename, exportTitle);
    };

    const currentYear = new Date().getFullYear();
    const labelBadge = categoryTitle || tipoDocumento.replace(/-/g, " ").toUpperCase();

    const stats: CatalogStatCard[] = [
        {
            label: "Total de Documentos",
            value: documentosFiltrados.length,
            sublabel: "Registros catalogados",
            icon: <FaFolderOpen size={20} />,
            variant: "primary",
        },
        {
            label: `Exercício ${currentYear}`,
            value: documentos.filter(
                (d) => (d.ano || new Date(d.criadoEm).getFullYear()) === currentYear
            ).length,
            sublabel: "Publicações no ano vigente",
            icon: <FaCalendarDays size={20} />,
            variant: "emerald",
        },
        {
            label: "Arquivos Disponíveis",
            value: documentosFiltrados.filter((d) =>
                isValidPublicUrl(d.arquivo || d.documentUrl)
            ).length,
            sublabel: "Inteiro teor em PDF",
            icon: <FaFilePdf size={20} />,
            variant: "amber",
        },
    ];

    const catalogItems: CatalogItem[] = useMemo(
        () =>
            documentosFiltrados.map((d) => {
                const anoReal = d.ano || new Date(d.criadoEm).getFullYear();
                return {
                    id: d.id,
                    ano: anoReal,
                    categoriaKey: tipoDocumento,
                    badgeText: labelBadge,
                    secondaryPill:
                        d.competencia ||
                        `Publicado em ${new Date(d.criadoEm).toLocaleDateString("pt-BR")}`,
                    titulo: d.titulo,
                    descricao: d.descricao || undefined,
                    metaInfo: d.orgaoResponsavel || d.secretaria || undefined,
                    fileUrl: d.arquivo || d.documentUrl,
                };
            }),
        [documentosFiltrados, tipoDocumento, labelBadge]
    );

    const chartSourceItems: CatalogItem[] = useMemo(
        () =>
            documentos.map((d) => ({
                id: d.id,
                ano: d.ano || new Date(d.criadoEm).getFullYear(),
                categoriaKey: tipoDocumento,
                badgeText: labelBadge,
                titulo: d.titulo,
                fileUrl: d.arquivo || d.documentUrl,
            })),
        [documentos, tipoDocumento, labelBadge]
    );

    const getMeta = (): CatalogCategoryMeta => ({
        title: categoryTitle || tipoDocumento.replace(/-/g, " "),
        subtitle: categorySubtitle,
        badgeStyle: "bg-blue-50 text-[#01b0ef] border-blue-200",
        icon: <FaFileLines className="text-[#01b0ef]" size={16} />,
        itemSingular: "documento",
        itemPlural: "documentos",
    });

    const activeFilterBadges: ActiveFilterBadge[] = [];
    if (anoFiltro) {
        activeFilterBadges.push({
            key: "ano",
            label: `Ano: ${anoFiltro}`,
            colorClass: "bg-amber-50 text-amber-800 border-amber-200",
            onClear: () => setAnoFiltro(null),
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

    return (
        <LRFDocumentCatalog
            embedded={!pageTitle}
            title={pageTitle || "Base Oficial de Documentos"}
            subtitle={pageSubtitle || "Consulta ao acervo documental municipal."}
            icon={<FaFolderOpen />}
            breadcrumbs={[
                { label: "Início", href: "/" },
                { label: "Transparência", href: "/transparencia" },
                { label: breadcrumbLabel || pageTitle || "Documentos" },
            ]}
            stats={stats}
            loading={loading}
            loadingText="Consultando acervo documental..."
            totalCount={documentos.length}
            items={catalogItems}
            chartSourceItems={chartSourceItems}
            availableYears={todosOsAnos}
            orderedYears={anosExibicao}
            yearSubtitle={yearSubtitle}
            searchValue={buscaFiltro}
            onSearchChange={setBuscaFiltro}
            searchPlaceholder="Digite o número, ano ou assunto do documento..."
            yearValue={anoFiltro}
            onYearChange={setAnoFiltro}
            sortOrder={ordem}
            onToggleSortOrder={() => setOrdem((prev) => (prev === "desc" ? "asc" : "desc"))}
            onExport={handleExport}
            activeFilterBadges={activeFilterBadges}
            hasActiveFilters={Boolean(buscaFiltro || anoFiltro)}
            onClearAllFilters={() => {
                setBuscaFiltro("");
                setAnoFiltro(null);
            }}
            getCategoryMeta={getMeta}
            emptyTitle={tituloVazio}
            emptyDescription={mensagemVazia}
            bannerProps={criterioPntp ? { criterio: criterioPntp } : undefined}
        />
    );
}
