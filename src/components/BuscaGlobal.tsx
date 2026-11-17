"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    X,
    ArrowRight,
    FileText,
    ShieldCheck,
    Newspaper,
    Building2,
    Sparkles,
    CornerDownLeft,
} from "lucide-react";

interface SearchResult {
    titulo: string;
    href: string;
    secao: string;
    tipo: "pagina" | "noticia" | "licitacao";
}

const paginasEstaticas: SearchResult[] = [
    { titulo: "Portal da Transparência", href: "/transparencia", secao: "Transparência", tipo: "pagina" },
    { titulo: "Obras Públicas", href: "/transparencia/obras", secao: "Transparência", tipo: "pagina" },
    { titulo: "Receitas Públicas", href: "/transparencia/receitas", secao: "Transparência", tipo: "pagina" },
    { titulo: "Despesas Públicas", href: "/transparencia/despesas", secao: "Transparência", tipo: "pagina" },
    { titulo: "Licitações e Editais", href: "/transparencia/licitacoes", secao: "Transparência", tipo: "pagina" },
    { titulo: "Contratos Administrativos", href: "/transparencia/contratos", secao: "Transparência", tipo: "pagina" },
    { titulo: "Convênios e Parcerias", href: "/transparencia/convenios", secao: "Transparência", tipo: "pagina" },
    { titulo: "Diárias e Passagens", href: "/transparencia/diarias", secao: "Transparência", tipo: "pagina" },
    { titulo: "Servidores e Folha de Pagamento", href: "/transparencia/servidores", secao: "Transparência", tipo: "pagina" },
    { titulo: "Relatórios Fiscais (RREO / RGF)", href: "/transparencia/lrf", secao: "Transparência", tipo: "pagina" },
    { titulo: "Planejamento Orçamentário (LOA / LDO / PPA)", href: "/transparencia/orcamento", secao: "Transparência", tipo: "pagina" },
    { titulo: "Legislação Municipal", href: "/transparencia/legislacao", secao: "Transparência", tipo: "pagina" },
    { titulo: "Dados Abertos (CSV / JSON)", href: "/transparencia/dados-abertos", secao: "Transparência", tipo: "pagina" },
    { titulo: "FAQ / Perguntas Frequentes", href: "/transparencia/faq", secao: "Atendimento", tipo: "pagina" },
    { titulo: "Glossário de Termos Públicos", href: "/transparencia/glossario", secao: "Atendimento", tipo: "pagina" },
    { titulo: "e-SIC – Pedido de Acesso à Informação", href: "/servicos/esic", secao: "Serviços", tipo: "pagina" },
    { titulo: "Ouvidoria Municipal", href: "/servicos/ouvidoria", secao: "Serviços", tipo: "pagina" },
    { titulo: "Unidades de Saúde e Medicamentos SUS", href: "/unidades-de-saude", secao: "Serviços", tipo: "pagina" },
    { titulo: "Unidades Escolares e Creches", href: "/unidades-escolares", secao: "Serviços", tipo: "pagina" },
    { titulo: "A Prefeitura", href: "/a-prefeitura", secao: "Institucional", tipo: "pagina" },
    { titulo: "Secretarias Municipais", href: "/secretarias", secao: "Institucional", tipo: "pagina" },
    { titulo: "Programa de Integridade", href: "/transparencia/integridade", secao: "Transparência", tipo: "pagina" },
    { titulo: "Acessibilidade Digital", href: "/transparencia/acessibilidade", secao: "Atendimento", tipo: "pagina" },
    { titulo: "Política de Privacidade (LGPD)", href: "/privacidade", secao: "Legal", tipo: "pagina" },
    { titulo: "Mapa do Site", href: "/mapa-do-site", secao: "Legal", tipo: "pagina" },
];

const quickSuggestions = [
    { label: "Licitações", href: "/transparencia/licitacoes" },
    { label: "Despesas", href: "/transparencia/despesas" },
    { label: "Servidores", href: "/transparencia/servidores" },
    { label: "e-SIC (LAI)", href: "/servicos/esic" },
    { label: "Ouvidoria", href: "/servicos/ouvidoria" },
    { label: "Secretarias", href: "/secretarias" },
];

export default function BuscaGlobal({ onClose }: { onClose?: () => void }) {
    const [query, setQuery] = useState("");
    const [resultados, setResultados] = useState<SearchResult[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (query.trim().length < 2) {
            setResultados([]);
            return;
        }

        const q = query.toLowerCase();
        const paginasFiltradas = paginasEstaticas.filter(
            (p) =>
                p.titulo.toLowerCase().includes(q) ||
                p.secao.toLowerCase().includes(q)
        );
        setResultados(paginasFiltradas.slice(0, 8));
    }, [query]);

    const handleSelect = (href: string) => {
        router.push(href);
        onClose?.();
    };

    const getSectionIcon = (secao: string) => {
        if (secao === "Transparência") return ShieldCheck;
        if (secao === "Institucional") return Building2;
        if (secao === "Notícias") return Newspaper;
        return FileText;
    };

    return (
        <div className="w-full bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
            <div className="h-1.5 w-full heraldic-stripe" />

            {/* Input Bar */}
            <div className="relative flex items-center px-6 py-4 border-b border-slate-100">
                <Search className="text-primary-600 shrink-0 mr-4" size={22} />
                <input
                    ref={inputRef}
                    id="busca"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="O que você procura? (Ex: licitações, folha, ouvidoria, leis...)"
                    className="w-full bg-transparent text-base font-medium text-slate-900 placeholder:text-slate-400 outline-none"
                    aria-label="Buscar no portal"
                    role="searchbox"
                    aria-autocomplete="list"
                    aria-expanded={resultados.length > 0}
                />
                {query && (
                    <button
                        onClick={() => setQuery("")}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        aria-label="Limpar busca"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Quick Suggestions when query is empty */}
            {query.trim().length < 2 && (
                <div className="p-6 bg-slate-50/60">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                        <Sparkles size={13} className="text-secondary-600" />
                        <span>Acessos mais buscados</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {quickSuggestions.map((item) => (
                            <button
                                key={item.href}
                                onClick={() => handleSelect(item.href)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 hover:border-primary-500 hover:text-primary-600 hover:shadow-civic-sm transition-all"
                            >
                                <span>{item.label}</span>
                                <ArrowRight size={12} className="opacity-60" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Results List */}
            {resultados.length > 0 && (
                <div className="max-h-[380px] overflow-y-auto p-3 divide-y divide-slate-50" role="listbox">
                    {resultados.map((r, idx) => {
                        const SecIcon = getSectionIcon(r.secao);
                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelect(r.href)}
                                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-primary-50/70 transition-all text-left rounded-2xl group"
                                role="option"
                            >
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-primary-600 text-slate-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                        <SecIcon size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 group-hover:text-primary-700 truncate transition-colors">
                                            {r.titulo}
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium">
                                            Seção: {r.secao}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-3">
                                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 group-hover:bg-white group-hover:text-primary-700">
                                        {r.secao}
                                    </span>
                                    <CornerDownLeft
                                        size={15}
                                        className="text-slate-300 group-hover:text-primary-600 transition-colors"
                                    />
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {query.trim().length >= 2 && resultados.length === 0 && (
                <div className="p-10 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                        <Search size={22} />
                    </div>
                    <p className="text-slate-700 text-sm font-bold">
                        Nenhum resultado encontrado para &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                        Tente termos como &ldquo;licitações&rdquo;, &ldquo;despesas&rdquo;, &ldquo;servidores&rdquo; ou acesse o Portal da Transparência.
                    </p>
                </div>
            )}

            {/* Footer Hints */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Navegação rápida do Portal de São Tomé</span>
                <span className="hidden sm:inline-flex items-center gap-1.5">
                    Pressione <kbd className="px-1.5 py-0.5 font-mono bg-white border border-slate-200 rounded text-[10px]">ESC</kbd> para fechar
                </span>
            </div>
        </div>
    );
}
