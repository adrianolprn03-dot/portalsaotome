"use client";

import { useEffect, useMemo, useState } from "react";
import {
    FaBookOpen,
    FaChartLine,
    FaCheckCircle,
    FaExclamationCircle,
} from "react-icons/fa";
import { FaCalendarDays, FaFilePdf, FaGraduationCap } from "react-icons/fa6";
import { exportToCSV, exportToPDF, exportToXLSX } from "@/lib/exportUtils";
import { normalizeText } from "@/lib/unidades";
import { isValidPublicUrl } from "@/lib/portal-links";
import LRFDocumentCatalog, {
    type ActiveFilterBadge,
    type CatalogCategoryMeta,
    type CatalogItem,
    type CatalogStatCard,
} from "@/components/transparencia/LRFDocumentCatalog";

interface DocPME {
    id: string;
    titulo: string;
    descricao: string | null;
    tipo: string;
    orgaoResponsavel: string | null;
    arquivo: string | null;
    documentUrl: string | null;
    arquivoEditavelUrl: string | null;
    ano: number | null;
    competencia: string | null;
    criadoEm: string;
    atualizadoEm?: string;
}

const EDUCACAO_META: Record<string, CatalogCategoryMeta> = {
    "plano-educacao": {
        title: "PME - Plano Municipal de Educação",
        subtitle: "Diretrizes, objetivos e metas decenais da educação básica municipal",
        badgeStyle: "bg-blue-50 text-[#01b0ef] border-blue-200",
        icon: <FaBookOpen className="text-[#01b0ef]" size={15} />,
        itemSingular: "documento",
        itemPlural: "documentos",
    },
    "relatorio-plano-educacao": {
        title: "Relatório de Resultados e Monitoramento do PME",
        subtitle: "Avaliações periódicas e indicadores do Plano Municipal de Educação",
        badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: <FaChartLine className="text-emerald-600" size={15} />,
        itemSingular: "relatório",
        itemPlural: "relatórios",
    },
};

function resolveLink(d: DocPME): string | null {
    const raw = (d.arquivo || d.documentUrl || "").trim();
    if (!raw || raw === "#") return null;
    const normalized = raw.startsWith("http") || raw.startsWith("/") ? raw : `/${raw}`;
    return isValidPublicUrl(normalized) ? normalized : null;
}

export default function PlanoEducacaoClientPage({
    initialDocs,
}: {
    initialDocs?: DocPME[];
}) {
    const [docs, setDocs] = useState<DocPME[]>(initialDocs || []);
    const [loading, setLoading] = useState(!initialDocs);
    const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
    const [anoFiltro, setAnoFiltro] = useState<number | null>(null);
    const [busca, setBusca] = useState("");
    const [ordem, setOrdem] = useState<"desc" | "asc">("desc");

    useEffect(() => {
        if (initialDocs) {
            setDocs(initialDocs);
            setLoading(false);
            return;
        }
        async function load() {
            setLoading(true);
            try {
                const res = await fetch(
                    "/api/documentos?tipo=plano-educacao,relatorio-plano-educacao",
                    { cache: "no-store" }
                );
                if (res.ok) {
                    const data = await res.json();
                    setDocs(Array.isArray(data) ? data : []);
                }
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [initialDocs]);

    const filteredDocs = useMemo(() => {
        return docs
            .filter((d) => {
                if (tipoFiltro !== "todos" && d.tipo !== tipoFiltro) return false;
                const docYear = d.ano || new Date(d.criadoEm).getFullYear();
                if (anoFiltro !== null && docYear !== anoFiltro) return false;
                if (!busca.trim()) return true;
                const q = normalizeText(busca);
                return (
                    normalizeText(d.titulo).includes(q) ||
                    normalizeText(d.descricao).includes(q) ||
                    normalizeText(d.competencia).includes(q) ||
                    normalizeText(d.orgaoResponsavel).includes(q) ||
                    String(docYear).includes(q)
                );
            })
            .sort((a, b) => {
                const yA = a.ano || new Date(a.criadoEm).getFullYear();
                const yB = b.ano || new Date(b.criadoEm).getFullYear();
                if (yA !== yB) return ordem === "desc" ? yB - yA : yA - yB;
                return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime();
            });
    }, [docs, tipoFiltro, anoFiltro, busca, ordem]);

    const pmes = docs.filter((d) => d.tipo === "plano-educacao");
    const relatorios = docs.filter((d) => d.tipo === "relatorio-plano-educacao");

    const anosDisponiveis = useMemo(() => {
        const anos = new Set<number>();
        docs.forEach((d) => {
            anos.add(d.ano || new Date(d.criadoEm).getFullYear());
        });
        return Array.from(anos).sort((a, b) => b - a);
    }, [docs]);

    const anosExibicao = useMemo(() => {
        const anos = new Set<number>();
        filteredDocs.forEach((d) => {
            anos.add(d.ano || new Date(d.criadoEm).getFullYear());
        });
        return Array.from(anos).sort((a, b) => (ordem === "desc" ? b - a : a - b));
    }, [filteredDocs, ordem]);

    const handleExport = (format: "pdf" | "csv" | "xlsx") => {
        const rows = filteredDocs.map((d) => ({
            Instrumento:
                d.tipo === "relatorio-plano-educacao"
                    ? "Relatório de Resultados / Monitoramento do PME"
                    : "Plano Municipal de Educação (PME)",
            Titulo: d.titulo,
            Exercicio: d.ano || "-",
            Periodo_Competencia: d.competencia || "-",
            Orgao_Responsavel: d.orgaoResponsavel || "Secretaria Municipal de Educação",
            Resumo_Metas: d.descricao || "-",
            Data_Publicacao: new Date(d.criadoEm).toLocaleDateString("pt-BR"),
            Link_Documento: resolveLink(d) || "-",
        }));

        const filename = "plano_educacao_relatorio_resultados_pntp_19_1";
        const meta = {
            titulo: "Plano Municipal de Educação (PME) e Relatório de Resultados (PNTP 19.1)",
            fonte: "Secretaria Municipal de Educação",
            filtros: `Tipo=${tipoFiltro}, Ano=${anoFiltro || "Todos"}${busca ? `, Busca=${busca}` : ""}`,
        };

        if (format === "csv") exportToCSV(rows, filename, meta);
        else if (format === "xlsx") exportToXLSX(rows, filename, meta);
        else exportToPDF(rows, filename, meta.titulo, meta);
    };

    const currentYear = new Date().getFullYear();

    const stats: CatalogStatCard[] = [
        {
            label: "Total de Documentos",
            value: filteredDocs.length,
            sublabel: `${pmes.length} plano(s) e ${relatorios.length} relatório(s)`,
            icon: <FaGraduationCap size={20} />,
            variant: "primary",
        },
        {
            label: `Exercício ${currentYear}`,
            value: docs.filter(
                (d) => (d.ano || new Date(d.criadoEm).getFullYear()) === currentYear
            ).length,
            sublabel: "Registros no ano vigente",
            icon: <FaCalendarDays size={20} />,
            variant: "emerald",
        },
        {
            label: "Arquivos em PDF",
            value: filteredDocs.filter((d) => resolveLink(d)).length,
            sublabel: "Inteiro teor disponível",
            icon: <FaFilePdf size={20} />,
            variant: "amber",
        },
    ];

    const catalogItems: CatalogItem[] = useMemo(
        () =>
            filteredDocs.map((d) => {
                const anoReal = d.ano || new Date(d.criadoEm).getFullYear();
                const isRel = d.tipo === "relatorio-plano-educacao";
                return {
                    id: d.id,
                    ano: anoReal,
                    categoriaKey: d.tipo,
                    badgeText: isRel ? "Relatório PME" : "Plano PME",
                    secondaryPill:
                        d.competencia ||
                        `Publicado em ${new Date(d.atualizadoEm || d.criadoEm).toLocaleDateString("pt-BR")}`,
                    titulo: d.titulo,
                    descricao: d.descricao || undefined,
                    metaInfo: d.orgaoResponsavel || "Secretaria Municipal de Educação",
                    fileUrl: resolveLink(d),
                    extraUrl: isValidPublicUrl(d.arquivoEditavelUrl) ? d.arquivoEditavelUrl : null,
                    extraLabel: "Editável",
                };
            }),
        [filteredDocs]
    );

    const chartSourceItems: CatalogItem[] = useMemo(
        () =>
            docs.map((d) => ({
                id: d.id,
                ano: d.ano || new Date(d.criadoEm).getFullYear(),
                categoriaKey: d.tipo,
                badgeText: d.tipo === "relatorio-plano-educacao" ? "Relatório PME" : "Plano PME",
                titulo: d.titulo,
                fileUrl: resolveLink(d),
            })),
        [docs]
    );

    const activeFilterBadges: ActiveFilterBadge[] = [];
    if (tipoFiltro !== "todos") {
        activeFilterBadges.push({
            key: "tipo",
            label:
                tipoFiltro === "relatorio-plano-educacao"
                    ? "Relatórios de Resultados"
                    : "Planos de Educação",
            colorClass: "bg-blue-50 text-[#01b0ef] border-blue-200",
            onClear: () => setTipoFiltro("todos"),
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

    const pntpTopNotice = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#01b0ef] flex items-center justify-center shrink-0">
                    <FaBookOpen size={20} />
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900">Plano Municipal de Educação (PME)</h3>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {pmes.length} publicado(s)
                        </span>
                    </div>
                    <p className="text-xs text-slate-600">
                        Diretrizes, objetivos e metas decenais da educação básica pública municipal.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <FaChartLine size={20} />
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900">Relatório de Resultados / Monitoramento do PME</h3>
                        {relatorios.length > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                <FaCheckCircle size={10} /> {relatorios.length} publicado(s)
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                <FaExclamationCircle size={10} /> Em publicação no Admin Educação
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-600">
                        Acompanhamento de metas e indicadores exigido pelo Critério 19.1 da Cartilha PNTP 2026.
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <LRFDocumentCatalog
            title="Plano Municipal de Educação e Relatórios de Resultados"
            subtitle="Acompanhamento das metas, estratégias decenais do PME e respectivos relatórios de monitoramento e avaliação educacional (Critério 19.1 PNTP 2026)."
            icon={<FaGraduationCap />}
            breadcrumbs={[
                { label: "Início", href: "/" },
                { label: "Transparência", href: "/transparencia" },
                { label: "Educação", href: "/transparencia/educacao" },
                { label: "Plano de Educação (PME)" },
            ]}
            topBanner={pntpTopNotice}
            stats={stats}
            loading={loading}
            loadingText="Consultando documentos do Plano Municipal de Educação..."
            totalCount={docs.length}
            items={catalogItems}
            chartSourceItems={chartSourceItems}
            availableYears={anosDisponiveis}
            orderedYears={anosExibicao}
            yearSubtitle="Planejamento e Monitoramento Educacional (PME)"
            tabs={[
                { id: "todos", label: `Todos (${docs.length})` },
                { id: "plano-educacao", label: `Plano de Educação (${pmes.length})` },
                {
                    id: "relatorio-plano-educacao",
                    label: `Relatório de Resultados (${relatorios.length})`,
                },
            ]}
            tabsLabel="Tipo de Instrumento (Critério 19.1)"
            activeTab={tipoFiltro}
            onTabChange={setTipoFiltro}
            searchValue={busca}
            onSearchChange={setBusca}
            searchPlaceholder="Pesquisar por título, metas, relatório bienal ou órgão responsável..."
            yearValue={anoFiltro}
            onYearChange={setAnoFiltro}
            sortOrder={ordem}
            onToggleSortOrder={() => setOrdem((prev) => (prev === "desc" ? "asc" : "desc"))}
            onExport={handleExport}
            activeFilterBadges={activeFilterBadges}
            hasActiveFilters={Boolean(busca || anoFiltro || tipoFiltro !== "todos")}
            onClearAllFilters={() => {
                setBusca("");
                setAnoFiltro(null);
                setTipoFiltro("todos");
            }}
            getCategoryMeta={(key) =>
                EDUCACAO_META[key] || {
                    title: key,
                    subtitle: "Instrumento Educacional Municipal",
                    badgeStyle: "bg-slate-100 text-slate-700 border-slate-200",
                    icon: <FaBookOpen className="text-slate-600" size={15} />,
                }
            }
            emptyTitle="Nenhum documento localizado para os filtros aplicados"
            emptyDescription={
                tipoFiltro === "relatorio-plano-educacao" && relatorios.length === 0
                    ? "Ainda não há Relatório de Resultados do PME publicado nesta categoria."
                    : "Limpe os filtros ou selecione 'Todos os anos' para consultar a série histórica completa."
            }
            emptyIcon={<FaBookOpen size={28} />}
            bannerProps={{
                criterio: "19.1",
                requisito:
                    "Divulgação do Plano Municipal de Educação e do respectivo relatório de resultados com série histórica e pesquisa",
                status: "Em Conformidade PNTP 2026",
            }}
        />
    );
}
