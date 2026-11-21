"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import type { UnifiedSearchResult, ExternalSystemAccess } from "@/lib/search-engine";

export const LAST_SEARCH_STORAGE_KEY = "portal_sao_tome_last_search";

const SUGGESTED_QUERIES = [
    "IPTU",
    "Unidade de saúde",
    "Lei 1451/2026",
    "Diário Oficial",
    "e-SIC",
    "Ouvidoria",
];

export default function BuscaGlobal({
    onClose,
    initialQuery = "",
}: {
    onClose?: () => void;
    initialQuery?: string;
}) {
    const [query, setQuery] = useState(initialQuery);
    const [resultados, setResultados] = useState<UnifiedSearchResult[]>([]);
    const [externalAccesses, setExternalAccesses] = useState<ExternalSystemAccess[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (!initialQuery && typeof window !== "undefined") {
            const saved = sessionStorage.getItem(LAST_SEARCH_STORAGE_KEY);
            if (saved) setQuery(saved);
        }
        inputRef.current?.focus();
    }, [initialQuery]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            sessionStorage.setItem(LAST_SEARCH_STORAGE_KEY, query);
        }

        const clean = query.trim();
        if (clean.length < 2) {
            setResultados([]);
            setError(null);
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        setLoading(true);
        setError(null);

        const timer = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/api/search?q=${encodeURIComponent(clean)}&limit=10`,
                    { signal: controller.signal }
                );
                if (!res.ok) throw new Error("Falha na busca");
                const data = await res.json();
                setResultados(Array.isArray(data.results) ? data.results : []);
                setExternalAccesses(Array.isArray(data.externalAccesses) ? data.externalAccesses : []);
            } catch (err: any) {
                if (err?.name !== "AbortError") {
                    setError("Não foi possível concluir a busca agora. Tente novamente.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }, 180);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const clean = query.trim();
        if (!clean) return;
        if (typeof window !== "undefined") {
            sessionStorage.setItem(LAST_SEARCH_STORAGE_KEY, clean);
        }
        onClose?.();
        router.push(`/busca?q=${encodeURIComponent(clean)}`);
    };

    const handleSelectResult = (item: UnifiedSearchResult) => {
        const clean = query.trim();
        if (typeof window !== "undefined" && clean) {
            sessionStorage.setItem(LAST_SEARCH_STORAGE_KEY, clean);
        }
        onClose?.();
        if (item.isExternal) {
            window.open(item.href, "_blank", "noopener,noreferrer");
        } else {
            router.push(item.href);
        }
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
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-busca-label"
            className="w-full bg-white rounded-2xl shadow-2xl border-2 border-[#006494]/30 overflow-hidden"
        >
            <div className="h-1.5 w-full heraldic-stripe" />

            <form onSubmit={handleFormSubmit} className="p-4 sm:p-5 border-b border-slate-200 bg-[#f8fcff]">
                <div className="flex items-center justify-between mb-2">
                    <label
                        id="modal-busca-label"
                        htmlFor="modal-busca-input"
                        className="text-xs font-extrabold uppercase tracking-wider text-[#00557d]"
                    >
                        Buscar no portal
                    </label>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                            aria-label="Fechar janela de busca"
                        >
                            <span>Fechar</span>
                            <X size={15} />
                        </button>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1 flex items-center bg-white border-2 border-slate-300 focus-within:border-[#006494] rounded-xl px-3.5 py-2.5">
                        <Search className="text-[#006494] shrink-0 mr-2.5" size={19} aria-hidden="true" />
                        <input
                            ref={inputRef}
                            id="modal-busca-input"
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="IPTU, unidade de saúde, lei municipal…"
                            className="w-full bg-transparent text-base font-medium text-slate-900 placeholder:text-slate-500 outline-none"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => {
                                    setQuery("");
                                    inputRef.current?.focus();
                                }}
                                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                                aria-label="Limpar termo pesquisado"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="btn-primary shrink-0 px-5 py-3 text-sm cursor-pointer"
                    >
                        <span>Ver todos os resultados</span>
                        <ArrowRight size={15} aria-hidden="true" />
                    </button>
                </div>
            </form>

            {/* Sugestões quando vazio */}
            {query.trim().length < 2 && (
                <div className="p-5 bg-white">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                        Exemplos de pesquisa rápida
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {SUGGESTED_QUERIES.map((term) => (
                            <button
                                key={term}
                                type="button"
                                onClick={() => {
                                    setQuery(term);
                                    inputRef.current?.focus();
                                }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f4fbff] border border-slate-200 text-xs font-bold text-[#00557d] hover:border-[#006494] hover:bg-[#006494] hover:text-white transition-colors cursor-pointer"
                            >
                                <span>{term}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Estado de carregamento */}
            {loading && query.trim().length >= 2 && (
                <div className="p-8 text-center flex items-center justify-center gap-2.5 text-sm font-semibold text-slate-700">
                    <Loader2 size={18} className="animate-spin text-[#006494]" />
                    <span>Pesquisando em serviços, unidades, notícias e legislação…</span>
                </div>
            )}

            {/* Estado de erro */}
            {error && !loading && (
                <div className="p-6 text-center text-sm text-rose-700 bg-rose-50 font-semibold">
                    {error}
                </div>
            )}

            {/* Lista de resultados */}
            {!loading && !error && resultados.length > 0 && (
                <div className="max-h-[400px] overflow-y-auto p-3 divide-y divide-slate-100">
                    {resultados.map((r) => {
                        const Icon = getCategoryIcon(r.tipo);
                        return (
                            <div
                                key={r.id}
                                className="py-2.5 px-3 hover:bg-[#f4fbff] rounded-xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                            >
                                <button
                                    type="button"
                                    onClick={() => handleSelectResult(r)}
                                    className="flex items-start gap-3 text-left flex-1 min-w-0 cursor-pointer group"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-[#edf8ff] text-[#00557d] group-hover:bg-[#006494] group-hover:text-white flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                                        <Icon size={17} aria-hidden="true" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                                {r.tipoLabel}
                                            </span>
                                            {r.meta?.data && (
                                                <span className="text-[11px] font-mono text-slate-600">
                                                    {r.meta.data}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 group-hover:text-[#00557d] leading-snug">
                                            {r.titulo}
                                        </p>
                                        <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                                            {r.resumo}
                                        </p>
                                    </div>
                                </button>

                                <div className="flex items-center gap-2 shrink-0 pl-12 sm:pl-0">
                                    {r.documentUrl && (
                                        <a
                                            href={r.documentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => onClose?.()}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#fdb913] hover:bg-[#e5a50a] text-slate-900 text-xs font-bold transition-colors"
                                        >
                                            <FileText size={13} aria-hidden="true" />
                                            <span>Abrir documento</span>
                                        </a>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleSelectResult(r)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:border-[#006494] text-[#00557d] text-xs font-bold transition-colors cursor-pointer"
                                    >
                                        <span>{r.isExternal ? "Acessar sistema" : "Abrir página"}</span>
                                        {r.isExternal ? (
                                            <ExternalLink size={12} aria-hidden="true" />
                                        ) : (
                                            <ArrowRight size={12} aria-hidden="true" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Estado vazio útil */}
            {!loading && !error && query.trim().length >= 2 && resultados.length === 0 && (
                <div className="p-6 text-center space-y-4">
                    <div>
                        <p className="text-slate-900 text-sm font-bold">
                            Nenhum resultado interno encontrado para &ldquo;{query}&rdquo;
                        </p>
                        <p className="text-slate-600 text-xs mt-1">
                            Revise o termo digitado acima ou consulte diretamente os sistemas externos oficiais:
                        </p>
                    </div>
                    {externalAccesses.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 pt-1">
                            {externalAccesses.slice(0, 3).map((ext) => (
                                <a
                                    key={ext.id}
                                    href={ext.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#f4fbff] border border-slate-300 text-xs font-bold text-[#00557d] hover:border-[#006494] hover:bg-[#006494] hover:text-white transition-colors"
                                >
                                    <span>{ext.titulo}</span>
                                    <ExternalLink size={12} aria-hidden="true" />
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="px-5 py-3 bg-[#f4fbff] border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span>Pesquisa pública integrada • Prefeitura de São Tomé/RN</span>
                <button
                    type="button"
                    onClick={handleFormSubmit}
                    className="font-bold text-[#00557d] hover:underline cursor-pointer"
                >
                    Abrir página completa de busca →
                </button>
            </div>
        </div>
    );
}
