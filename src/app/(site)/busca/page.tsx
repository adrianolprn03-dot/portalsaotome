"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import {
    Search,
    X,
    ArrowRight,
    FileText,
    Newspaper,
    Building2,
    MapPin,
    ExternalLink,
    Briefcase,
    Loader2,
    Phone,
    Clock,
} from "lucide-react";
import type {
    UnifiedSearchResult,
    ExternalSystemAccess,
    SearchResultCategory,
} from "@/lib/search-engine";
import { LAST_SEARCH_STORAGE_KEY } from "@/components/BuscaGlobal";

const CATEGORIAS_TABS: Array<{ id: SearchResultCategory | "todos"; label: string }> = [
    { id: "todos", label: "Todos" },
    { id: "servico", label: "Serviços" },
    { id: "unidade", label: "Unidades de Atendimento" },
    { id: "secretaria", label: "Secretarias" },
    { id: "documento", label: "Leis e Documentos" },
    { id: "noticia", label: "Notícias e Avisos" },
    { id: "sistema_externo", label: "Sistemas Externos" },
];

const EXEMPLOS_BUSCA = [
    "IPTU",
    "Unidade de saúde",
    "Lei 1451/2026",
    "Lei Complementar 028/2026",
    "Diário Oficial",
    "e-SIC",
    "Ouvidoria",
    "Secretaria de Saúde",
];

function BuscaPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlQ = searchParams.get("q") || "";
    const urlCat = (searchParams.get("categoria") || "todos") as SearchResultCategory | "todos";

    const [inputQuery, setInputQuery] = useState(urlQ);
    const [activeCategory, setActiveCategory] = useState<SearchResultCategory | "todos">(urlCat);
    const [results, setResults] = useState<UnifiedSearchResult[]>([]);
    const [externalAccesses, setExternalAccesses] = useState<ExternalSystemAccess[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Restaura o termo salvo caso o usuário acesse /busca sem query e tenha pesquisado antes
    useEffect(() => {
        if (urlQ) {
            setInputQuery(urlQ);
            if (typeof window !== "undefined") {
                sessionStorage.setItem(LAST_SEARCH_STORAGE_KEY, urlQ);
            }
        } else if (typeof window !== "undefined") {
            const saved = sessionStorage.getItem(LAST_SEARCH_STORAGE_KEY);
            if (saved && saved.trim()) {
                setInputQuery(saved);
                router.replace(`/busca?q=${encodeURIComponent(saved.trim())}`, { scroll: false });
            }
        }
    }, [urlQ, router]);

    const executeSearch = useCallback(async (qToRun: string) => {
        const clean = qToRun.trim();
        if (clean.length < 2) {
            setResults([]);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(
                `/api/search?q=${encodeURIComponent(clean)}&limit=80`
            );
            if (!res.ok) throw new Error("Falha ao buscar");
            const data = await res.json();
            setResults(Array.isArray(data.results) ? data.results : []);
            setExternalAccesses(Array.isArray(data.externalAccesses) ? data.externalAccesses : []);
        } catch {
            setError("Não foi possível carregar os resultados agora. Verifique sua conexão e tente novamente.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        executeSearch(urlQ);
    }, [urlQ, executeSearch]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const clean = inputQuery.trim();
        if (typeof window !== "undefined") {
            sessionStorage.setItem(LAST_SEARCH_STORAGE_KEY, clean);
        }
        if (!clean) {
            router.push("/busca");
            return;
        }
        router.push(`/busca?q=${encodeURIComponent(clean)}`);
    };

    const handleApplyExample = (term: string) => {
        setInputQuery(term);
        if (typeof window !== "undefined") {
            sessionStorage.setItem(LAST_SEARCH_STORAGE_KEY, term);
        }
        router.push(`/busca?q=${encodeURIComponent(term)}`);
    };

    const filteredResults =
        activeCategory === "todos"
            ? results
            : results.filter((r) => r.tipo === activeCategory);

    const getCategoryCount = (catId: SearchResultCategory | "todos") => {
        if (catId === "todos") return results.length;
        return results.filter((r) => r.tipo === catId).length;
    };

    const getCategoryIcon = (tipo: UnifiedSearchResult["tipo"]) => {
        switch (tipo) {
            case "secretaria":
                return Building2;
            case "unidade":
                return MapPin;
            case "noticia":
                return Newspaper;
            case "documento":
                return FileText;
            case "sistema_externo":
                return ExternalLink;
            default:
                return Briefcase;
        }
    };

    return (
        <div className="min-h-screen bg-[#f4fbff] pb-20">
            <PageHeader
                title="Busca Geral no Portal"
                subtitle="Pesquise serviços públicos, unidades de saúde e escolas, secretarias, notícias e legislação municipal de São Tomé/RN."
                icon={<Search className="w-7 h-7" />}
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Buscar no portal" },
                ]}
            />

            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-8 space-y-8">
                {/* Formulário de busca editável */}
                <section
                    aria-label="Formulário de pesquisa geral"
                    className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-civic-sm"
                >
                    <form onSubmit={handleFormSubmit} className="space-y-3">
                        <label
                            htmlFor="pagina-busca-input"
                            className="block text-sm font-extrabold text-slate-900"
                        >
                            Buscar no portal
                        </label>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="relative flex-1 flex items-center bg-[#f8fcff] border-2 border-slate-300 focus-within:border-[#006494] focus-within:bg-white rounded-xl px-4 py-3">
                                <Search className="text-[#006494] shrink-0 mr-3" size={20} aria-hidden="true" />
                                <input
                                    id="pagina-busca-input"
                                    type="search"
                                    value={inputQuery}
                                    onChange={(e) => setInputQuery(e.target.value)}
                                    placeholder="IPTU, unidade de saúde, lei municipal…"
                                    className="w-full bg-transparent text-base font-medium text-slate-900 placeholder:text-slate-500 outline-none"
                                />
                                {inputQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setInputQuery("");
                                            if (typeof window !== "undefined") {
                                                sessionStorage.removeItem(LAST_SEARCH_STORAGE_KEY);
                                            }
                                        }}
                                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
                                        aria-label="Limpar consulta"
                                    >
                                        <X size={17} />
                                    </button>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="btn-primary px-7 py-3.5 text-base shrink-0 cursor-pointer"
                            >
                                <span>Buscar</span>
                                <ArrowRight size={17} aria-hidden="true" />
                            </button>
                        </div>
                    </form>

                    {/* Sugestões rápidas */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">Sugestões:</span>
                        {EXEMPLOS_BUSCA.map((ex) => (
                            <button
                                key={ex}
                                type="button"
                                onClick={() => handleApplyExample(ex)}
                                className="px-3 py-1 rounded-lg bg-[#f4fbff] hover:bg-[#006494] text-[#00557d] hover:text-white border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
                            >
                                {ex}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Filtros por tipo de resultado */}
                {urlQ.trim().length >= 2 && results.length > 0 && (
                    <div
                        role="tablist"
                        aria-label="Filtrar resultados por tipo"
                        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
                    >
                        {CATEGORIAS_TABS.map((tab) => {
                            const count = getCategoryCount(tab.id);
                            if (tab.id !== "todos" && count === 0) return null;
                            const isSelected = activeCategory === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={isSelected}
                                    onClick={() => setActiveCategory(tab.id)}
                                    className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                        isSelected
                                            ? "bg-[#006494] text-white shadow-xs"
                                            : "bg-white text-slate-700 border border-slate-200 hover:border-[#006494]"
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                                            isSelected
                                                ? "bg-[#fdb913] text-slate-900"
                                                : "bg-slate-100 text-slate-700"
                                        }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Estados: Carregando / Erro / Resultados / Vazio */}
                {loading ? (
                    <div className="bg-white rounded-2xl p-14 border border-slate-200 text-center space-y-3">
                        <Loader2 size={28} className="animate-spin text-[#006494] mx-auto" />
                        <p className="text-base font-bold text-slate-800">
                            Pesquisando por &ldquo;{urlQ}&rdquo;…
                        </p>
                        <p className="text-sm text-slate-600">
                            Verificando serviços, unidades de atendimento, secretarias, notícias e legislação publicada.
                        </p>
                    </div>
                ) : error ? (
                    <div className="bg-rose-50 rounded-2xl p-8 border border-rose-200 text-center space-y-3">
                        <p className="text-base font-bold text-rose-900">{error}</p>
                        <button
                            type="button"
                            onClick={() => executeSearch(urlQ)}
                            className="btn-primary"
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : urlQ.trim().length >= 2 && filteredResults.length > 0 ? (
                    <section aria-label="Resultados encontrados" className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-slate-700 font-semibold px-1">
                            <span>
                                Exibindo <strong>{filteredResults.length}</strong>{" "}
                                {filteredResults.length === 1 ? "resultado" : "resultados"} para{" "}
                                <strong>&ldquo;{urlQ}&rdquo;</strong>
                            </span>
                        </div>

                        <div className="space-y-3">
                            {filteredResults.map((item) => {
                                const Icon = getCategoryIcon(item.tipo);
                                return (
                                    <article
                                        key={item.id}
                                        className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 hover:border-[#006494] shadow-civic-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                                    >
                                        <div className="flex items-start gap-4 min-w-0 flex-1">
                                            <div className="w-11 h-11 rounded-xl bg-[#edf8ff] text-[#00557d] border border-[#9fd8f5] flex items-center justify-center shrink-0 mt-0.5">
                                                <Icon size={20} aria-hidden="true" />
                                            </div>
                                            <div className="min-w-0 flex-1 space-y-1.5">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-[#edf8ff] text-[#00557d] border border-[#9fd8f5]">
                                                        {item.tipoLabel}
                                                    </span>
                                                    {item.meta?.numero && (
                                                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800">
                                                            Nº {item.meta.numero}
                                                        </span>
                                                    )}
                                                    {item.meta?.data && (
                                                        <span className="text-xs font-mono text-slate-600">
                                                            {item.meta.data}
                                                        </span>
                                                    )}
                                                </div>

                                                <h2 className="font-heading text-lg font-extrabold text-slate-900 leading-snug">
                                                    {item.isExternal ? (
                                                        <a
                                                            href={item.href}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:text-[#00557d] hover:underline"
                                                        >
                                                            {item.titulo}
                                                        </a>
                                                    ) : (
                                                        <Link
                                                            href={item.href}
                                                            className="hover:text-[#00557d] hover:underline"
                                                        >
                                                            {item.titulo}
                                                        </Link>
                                                    )}
                                                </h2>

                                                <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                                                    {item.resumo}
                                                </p>

                                                {(item.meta?.horario || item.meta?.telefone) && (
                                                    <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold text-slate-600">
                                                        {item.meta.horario && (
                                                            <span className="inline-flex items-center gap-1.5">
                                                                <Clock size={13} className="text-[#006494]" aria-hidden="true" />
                                                                <span>{item.meta.horario}</span>
                                                            </span>
                                                        )}
                                                        {item.meta.telefone && (
                                                            <span className="inline-flex items-center gap-1.5 font-mono">
                                                                <Phone size={13} className="text-[#006494]" aria-hidden="true" />
                                                                <span>{item.meta.telefone}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2.5 shrink-0 md:pl-4">
                                            {item.documentUrl && (
                                                <a
                                                    href={item.documentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-secondary px-4 py-2.5 text-xs"
                                                >
                                                    <FileText size={14} aria-hidden="true" />
                                                    <span>Abrir documento</span>
                                                </a>
                                            )}

                                            {item.isExternal ? (
                                                <a
                                                    href={item.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-primary px-4 py-2.5 text-xs"
                                                >
                                                    <span>Acessar consulta externa</span>
                                                    <ExternalLink size={14} aria-hidden="true" />
                                                </a>
                                            ) : (
                                                <Link
                                                    href={item.href}
                                                    className="btn-outline px-4 py-2.5 text-xs"
                                                >
                                                    <span>
                                                        {item.tipo === "documento"
                                                            ? "Ver no catálogo de leis"
                                                            : "Acessar página"}
                                                    </span>
                                                    <ArrowRight size={14} aria-hidden="true" />
                                                </Link>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                ) : urlQ.trim().length >= 2 ? (
                    <section
                        aria-label="Nenhum resultado interno encontrado"
                        className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 space-y-6"
                    >
                        <div className="max-w-xl space-y-2">
                            <h2 className="font-heading text-xl font-extrabold text-slate-900">
                                Nenhum registro interno encontrado para &ldquo;{urlQ}&rdquo;
                            </h2>
                            <p className="text-slate-700 text-base leading-relaxed">
                                Você pode editar o termo pesquisado no campo acima, usar palavras mais curtas (como o número da lei ou o nome do bairro) ou consultar diretamente os sistemas externos integrados abaixo.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link href="/transparencia/carta-servicos" className="btn-primary text-xs">
                                <span>Ver Carta de Serviços</span>
                                <ArrowRight size={14} aria-hidden="true" />
                            </Link>
                            <Link href="/transparencia/legislacao" className="btn-outline text-xs">
                                <span>Consultar Legislação Municipal</span>
                            </Link>
                            <Link href="/servicos/esic" className="btn-outline text-xs">
                                <span>Solicitar informação pública (e-SIC)</span>
                            </Link>
                        </div>
                    </section>
                ) : null}

                {/* Sistemas externos sem pesquisa integrada no banco local */}
                {externalAccesses.length > 0 && (
                    <section
                        aria-labelledby="sistemas-externos-busca-titulo"
                        className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-5"
                    >
                        <div className="space-y-1">
                            <h2
                                id="sistemas-externos-busca-titulo"
                                className="font-heading text-lg sm:text-xl font-extrabold text-slate-900"
                            >
                                Consultas diretas em sistemas externos oficiais
                            </h2>
                            <p className="text-slate-700 text-sm sm:text-base">
                                Alguns acervos (como emissão de guias tributárias, edições diárias da FEMURN e execução contábil detalhada) possuem pesquisa própria nos sistemas oficiais abaixo:
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {externalAccesses.slice(0, 4).map((ext) => (
                                <a
                                    key={ext.id}
                                    href={ext.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group p-4 rounded-xl bg-[#f4fbff] hover:bg-white border border-slate-200 hover:border-[#006494] transition-all flex flex-col justify-between gap-3"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-extrabold text-[#00557d]">
                                                {ext.orgaoSistema}
                                            </span>
                                            <ExternalLink
                                                size={14}
                                                className="text-[#006494] shrink-0"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <h3 className="font-heading text-base font-bold text-slate-900 group-hover:text-[#00557d]">
                                            {ext.titulo}
                                        </h3>
                                        <p className="text-xs text-slate-700 leading-relaxed">
                                            {ext.descricao}
                                        </p>
                                        {ext.instrucao && (
                                            <p className="text-xs font-bold text-slate-900 bg-[#fff3c4] border border-[#fdb913]/50 px-2.5 py-1.5 rounded-lg mt-1.5">
                                                {ext.instrucao}
                                            </p>
                                        )}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

export default function BuscaPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#f4fbff] flex items-center justify-center p-12 text-slate-700 font-semibold">
                    Carregando busca do portal…
                </div>
            }
        >
            <BuscaPageContent />
        </Suspense>
    );
}
