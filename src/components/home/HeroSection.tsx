"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search,
    ArrowRight,
    MapPin,
    X,
    FileText,
    ExternalLink,
    Loader2,
    Landmark,
} from "lucide-react";
import type { UnifiedSearchResult } from "@/lib/search-engine";
import { LAST_SEARCH_STORAGE_KEY } from "@/components/BuscaGlobal";

const QUICK_SEARCH_EXAMPLES = [
    { label: "IPTU", query: "IPTU" },
    { label: "Unidade de saúde", query: "Unidade de saúde" },
    { label: "Lei 1451/2026", query: "1451/2026" },
    { label: "Diário Oficial", query: "Diário Oficial" },
];

export default function HeroSection() {
    const [searchQuery, setSearchQuery] = useState("");
    const [imageFailed, setImageFailed] = useState(false);
    const [suggestions, setSuggestions] = useState<UnifiedSearchResult[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchBoxRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Preserva o termo ao voltar dos resultados de busca
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = sessionStorage.getItem(LAST_SEARCH_STORAGE_KEY);
            if (saved) {
                setSearchQuery(saved);
            }
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const clean = searchQuery.trim();
        if (clean.length < 2) {
            setSuggestions([]);
            setLoadingSuggestions(false);
            return;
        }

        const controller = new AbortController();
        setLoadingSuggestions(true);

        const timer = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/api/search?q=${encodeURIComponent(clean)}&limit=6`,
                    { signal: controller.signal }
                );
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(Array.isArray(data.results) ? data.results : []);
                }
            } catch {
                // Silencioso para abort/rede
            } finally {
                if (!controller.signal.aborted) {
                    setLoadingSuggestions(false);
                }
            }
        }, 180);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [searchQuery]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const clean = searchQuery.trim();
        if (typeof window !== "undefined") {
            sessionStorage.setItem(LAST_SEARCH_STORAGE_KEY, clean);
        }
        setShowDropdown(false);
        if (!clean) {
            router.push("/busca");
            return;
        }
        router.push(`/busca?q=${encodeURIComponent(clean)}`);
    };

    const handleQuickExample = (term: string) => {
        setSearchQuery(term);
        if (typeof window !== "undefined") {
            sessionStorage.setItem(LAST_SEARCH_STORAGE_KEY, term);
        }
        router.push(`/busca?q=${encodeURIComponent(term)}`);
    };

    return (
        <section
            aria-labelledby="home-titulo-principal"
            className="relative w-full bg-gradient-to-b from-white via-[#f7fcff] to-[#ecf8ff] border-b border-slate-200"
        >
            <div className="h-1 w-full heraldic-stripe" />

            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                    {/* Coluna 1 (Primeiro no celular): Identificação Institucional + Busca Geral (7 cols) */}
                    <div className="lg:col-span-7 space-y-4 sm:space-y-5">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#edf8ff] border border-[#9fd8f5] text-[#00557d] text-xs font-extrabold tracking-wide">
                                <span
                                    className="w-2 h-2 rounded-full bg-[#fdb913]"
                                    aria-hidden="true"
                                />
                                <span>Portal Oficial • Município de São Tomé/RN</span>
                            </div>

                            <h1
                                id="home-titulo-principal"
                                className="font-heading text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold text-slate-900 tracking-tight leading-[1.12]"
                            >
                                Prefeitura de São Tomé
                            </h1>

                            <p className="text-slate-700 text-base sm:text-[17px] leading-relaxed max-w-2xl">
                                Encontre atendimento presencial e digital, serviços ao cidadão, notícias municipais e legislação oficial.
                            </p>
                        </div>

                        {/* Busca Geral Unificada */}
                        <div ref={searchBoxRef} className="relative max-w-2xl">
                            <form
                                onSubmit={handleSearchSubmit}
                                role="search"
                                aria-label="Busca geral do portal"
                                className="bg-white rounded-2xl p-3 sm:p-3.5 shadow-civic-lg border-2 border-[#006494]/30 focus-within:border-[#006494] transition-colors"
                            >
                                <label
                                    htmlFor="campo-busca-portal"
                                    className="block text-xs font-extrabold uppercase tracking-wider text-[#00557d] mb-1.5 px-1"
                                >
                                    Buscar no portal
                                </label>

                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                    <div className="relative flex items-center flex-1 min-w-0 bg-[#f8fcff] border border-slate-300 focus-within:border-[#006494] focus-within:bg-white rounded-xl px-3.5 py-2.5">
                                        <Search
                                            size={19}
                                            className="text-[#006494] shrink-0 mr-2.5"
                                            aria-hidden="true"
                                        />
                                        <input
                                            id="campo-busca-portal"
                                            type="search"
                                            value={searchQuery}
                                            onFocus={() => setShowDropdown(true)}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setShowDropdown(true);
                                                if (typeof window !== "undefined") {
                                                    sessionStorage.setItem(
                                                        LAST_SEARCH_STORAGE_KEY,
                                                        e.target.value
                                                    );
                                                }
                                            }}
                                            placeholder="IPTU, unidade de saúde, lei municipal…"
                                            className="w-full min-w-0 text-base font-medium text-slate-900 placeholder:text-slate-500 bg-transparent outline-none"
                                            autoComplete="off"
                                        />
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSearchQuery("");
                                                    setSuggestions([]);
                                                    if (typeof window !== "undefined") {
                                                        sessionStorage.removeItem(
                                                            LAST_SEARCH_STORAGE_KEY
                                                        );
                                                    }
                                                }}
                                                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
                                                aria-label="Limpar termo de busca"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        className="shrink-0 min-h-[46px] bg-[#fdb913] hover:bg-[#e5a50a] text-slate-900 font-extrabold text-sm px-6 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                                    >
                                        <span>Buscar</span>
                                        <ArrowRight size={16} aria-hidden="true" />
                                    </button>
                                </div>

                                {/* Exemplos clicáveis */}
                                <div className="mt-2.5 px-1 flex flex-wrap items-center gap-1.5 text-xs">
                                    <span className="font-semibold text-slate-600">
                                        Mais procurados:
                                    </span>
                                    {QUICK_SEARCH_EXAMPLES.map((item) => (
                                        <button
                                            key={item.label}
                                            type="button"
                                            onClick={() => handleQuickExample(item.query)}
                                            className="px-2.5 py-0.5 rounded-md bg-[#edf8ff] hover:bg-[#006494] text-[#00557d] hover:text-white font-bold transition-colors cursor-pointer"
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </form>

                            {/* Prévia rápida de resultados */}
                            {showDropdown && searchQuery.trim().length >= 2 && (
                                <div
                                    role="region"
                                    aria-label="Sugestões de resultados da busca"
                                    className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border-2 border-[#006494]/30 z-40 overflow-hidden"
                                >
                                    {loadingSuggestions ? (
                                        <div className="p-4 flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                                            <Loader2
                                                size={16}
                                                className="animate-spin text-[#006494]"
                                            />
                                            <span>Buscando em serviços, unidades e leis…</span>
                                        </div>
                                    ) : suggestions.length > 0 ? (
                                        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto p-2">
                                            {suggestions.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="p-2.5 hover:bg-[#f4fbff] rounded-xl flex items-center justify-between gap-3"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-[#edf8ff] text-[#00557d] mb-0.5">
                                                            {item.tipoLabel}
                                                        </span>
                                                        <p className="text-sm font-bold text-slate-900 truncate">
                                                            {item.titulo}
                                                        </p>
                                                        <p className="text-xs text-slate-600 truncate">
                                                            {item.resumo}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        {item.documentUrl && (
                                                            <a
                                                                href={item.documentUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={() => setShowDropdown(false)}
                                                                className="px-2.5 py-1.5 rounded-lg bg-[#fdb913] hover:bg-[#e5a50a] text-slate-900 text-xs font-bold inline-flex items-center gap-1"
                                                            >
                                                                <FileText size={12} aria-hidden="true" />
                                                                <span>Documento</span>
                                                            </a>
                                                        )}
                                                        {item.isExternal ? (
                                                            <a
                                                                href={item.href}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={() => setShowDropdown(false)}
                                                                className="px-2.5 py-1.5 rounded-lg bg-[#006494] hover:bg-[#004f75] text-white text-xs font-bold inline-flex items-center gap-1"
                                                            >
                                                                <span>Abrir</span>
                                                                <ExternalLink size={12} aria-hidden="true" />
                                                            </a>
                                                        ) : (
                                                            <Link
                                                                href={item.href}
                                                                onClick={() => setShowDropdown(false)}
                                                                className="px-2.5 py-1.5 rounded-lg bg-[#006494] hover:bg-[#004f75] text-white text-xs font-bold inline-flex items-center gap-1"
                                                            >
                                                                <span>Abrir</span>
                                                                <ArrowRight size={12} aria-hidden="true" />
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="pt-2 px-2">
                                                <button
                                                    type="button"
                                                    onClick={handleSearchSubmit}
                                                    className="w-full py-2 text-center text-xs font-extrabold text-[#00557d] hover:underline cursor-pointer"
                                                >
                                                    Ver todos os resultados para &ldquo;{searchQuery.trim()}&rdquo; →
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 text-xs text-slate-700 flex items-center justify-between">
                                            <span>
                                                Pressione <strong>Buscar</strong> para pesquisar &ldquo;{searchQuery.trim()}&rdquo; em todo o portal e sistemas externos.
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleSearchSubmit}
                                                className="font-bold text-[#00557d] hover:underline shrink-0 ml-2 cursor-pointer"
                                            >
                                                Pesquisar →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Coluna 2 (Abaixo da busca no celular): Fotografia Panorâmica Real e Otimizada de São Tomé (5 cols) */}
                    <div className="lg:col-span-5">
                        <figure className="bg-white rounded-2xl p-2 border border-slate-200 shadow-civic-lg overflow-hidden">
                            <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#004666]">
                                {!imageFailed ? (
                                    <picture>
                                        <source
                                            srcSet="/images/hero-panoramica.webp"
                                            type="image/webp"
                                        />
                                        <img
                                            src="/images/hero-panoramica.jpg"
                                            alt="Vista aérea panorâmica da cidade de São Tomé, Rio Grande do Norte, cercada pelas serras da região do Potengi"
                                            width={640}
                                            height={360}
                                            fetchPriority="high"
                                            onError={() => setImageFailed(true)}
                                            className="w-full h-full object-cover object-[50%_42%]"
                                        />
                                    </picture>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#004666] to-[#006494] text-white">
                                        <Landmark size={36} className="text-[#fdb913] mb-2" aria-hidden="true" />
                                        <p className="font-heading text-base font-bold">
                                            Município de São Tomé • Rio Grande do Norte
                                        </p>
                                        <p className="text-xs text-sky-100 mt-0.5">
                                            Região do Potengi • Sede do Poder Executivo Municipal
                                        </p>
                                    </div>
                                )}
                            </div>
                            <figcaption className="mt-2 px-1.5 flex items-center justify-between gap-2 text-xs text-slate-700">
                                <span className="inline-flex items-center gap-1.5 font-semibold truncate">
                                    <MapPin size={13} className="text-[#006494] shrink-0" aria-hidden="true" />
                                    <span>Vista panorâmica de São Tomé/RN</span>
                                </span>
                                <Link
                                    href="/a-prefeitura/historia"
                                    className="font-bold text-[#00557d] hover:underline shrink-0"
                                >
                                    Conhecer o município →
                                </Link>
                            </figcaption>
                        </figure>
                    </div>
                </div>
            </div>
        </section>
    );
}
