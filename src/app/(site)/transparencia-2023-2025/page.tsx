"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
    Coins,
    Receipt,
    ListOrdered,
    Database,
    Globe2,
    FileSearch,
    Landmark,
    BarChart3,
    Gavel,
    FileSignature,
    FileStack,
    FileText,
    Handshake,
    Construction,
    Megaphone,
    Users,
    UserPlus,
    Briefcase,
    IdCard,
    Plane,
    GraduationCap,
    UserCheck,
    Files,
    ScrollText,
    FilePieChart,
    ClipboardList,
    Headset,
    ExternalLink,
    ArrowUpRight,
    ArrowRight,
    Search,
    X,
    History,
    Sparkles,
} from "lucide-react";
import SeletorPeriodos from "@/components/transparencia/SeletorPeriodos";
import {
    PORTAL_2023_2025_DEFAULT_URL,
    resolveModulo2023_2025,
    resolvePortalUrl,
    type LinkExternoResumo,
} from "@/config/portais-periodos";
import { MUNICIPIO } from "@/config/municipio";

interface ModuloPeriodo {
    id: string;
    titulo: string;
    desc: string;
    href: string;
    badge: string;
    icon: typeof Coins;
}

interface CategoriaPeriodo {
    tituloCategoria: string;
    desc: string;
    icon: typeof Coins;
    modulos: ModuloPeriodo[];
}

const CATEGORIAS_2023_2025: CategoriaPeriodo[] = [
    {
        tituloCategoria: "Finanças, Receitas e Despesas (TopSolutions 2023–2025)",
        desc: "Consultas financeiras e execução orçamentária do exercício 2023 a 2025 no sistema TopSolutions.",
        icon: Coins,
        modulos: [
            {
                id: "receitas",
                titulo: "Receitas Públicas",
                desc: "Arrecadação municipal e transferências no portal TopSolutions.",
                href: "/transparencia/receitas",
                badge: "RECEITAS",
                icon: Coins,
            },
            {
                id: "despesas",
                titulo: "Despesas Públicas",
                desc: "Empenhos, liquidações e pagamentos realizados no período.",
                href: "/transparencia/despesas",
                badge: "DESPESAS",
                icon: Receipt,
            },
            {
                id: "ordem-cronologica",
                titulo: "Ordem Cronológica",
                desc: "Fila cronológica de pagamentos a fornecedores e credores.",
                href: "/transparencia/ordem-cronologica",
                badge: "TESOURARIA",
                icon: ListOrdered,
            },
            {
                id: "transferencias",
                titulo: "Repasses e Transferências",
                desc: "Transferências recebidas e convênios estaduais e federais.",
                href: "/transparencia/transferencias",
                badge: "RECURSOS",
                icon: Database,
            },
            {
                id: "emendas",
                titulo: "Emendas Parlamentares",
                desc: "Emendas parlamentares destinadas ao município no período.",
                href: "/transparencia/emendas",
                badge: "EMENDAS",
                icon: Globe2,
            },
            {
                id: "renuncias-fiscais",
                titulo: "Renúncias Fiscais",
                desc: "Relatórios de isenções e renúncias tributárias registradas.",
                href: "/transparencia/renuncias-fiscais",
                badge: "FISCAL",
                icon: FileSearch,
            },
            {
                id: "orcamento",
                titulo: "Planejamento Orçamentário",
                desc: "Leis orçamentárias (LOA, LDO e PPA) migradas para o acervo.",
                href: "/transparencia/orcamento",
                badge: "ORÇAMENTO",
                icon: Landmark,
            },
            {
                id: "lrf",
                titulo: "Relatórios LRF (RREO e RGF)",
                desc: "Demonstrativos fiscais RREO e RGF do período 2023–2025.",
                href: "/transparencia/lrf",
                badge: "LRF",
                icon: BarChart3,
            },
        ],
    },
    {
        tituloCategoria: "Licitações, Contratos e Obras (TopSolutions 2023–2025)",
        desc: "Certames licitatórios, contratos, atas SRP, convênios e acompanhamento de obras de 2023 a 2025.",
        icon: Gavel,
        modulos: [
            {
                id: "licitacoes",
                titulo: "Licitações",
                desc: "Certames e avisos de licitações registrados no TopSolutions.",
                href: "/transparencia/licitacoes",
                badge: "CERTAMES",
                icon: Gavel,
            },
            {
                id: "contratos",
                titulo: "Contratos Administrativos",
                desc: "Contratos celebrados, aditivos e vigências no período.",
                href: "/transparencia/contratos",
                badge: "CONTRATOS",
                icon: FileSignature,
            },
            {
                id: "atas-registro",
                titulo: "Atas de Registro de Preços",
                desc: "Atas SRP vigentes e registradas no portal TopSolutions.",
                href: "/transparencia/atas-registro",
                badge: "SRP",
                icon: FileStack,
            },
            {
                id: "plano-contratacao",
                titulo: "Plano de Contratação Anual",
                desc: "Arquivo e detalhamento do PCA municipal no TopSolutions.",
                href: "/transparencia/plano-contratacao",
                badge: "PCA",
                icon: FileText,
            },
            {
                id: "convenios",
                titulo: "Convênios Celebrados",
                desc: "Convênios, termos e parcerias no TopSolutions.",
                href: "/transparencia/convenios",
                badge: "PARCERIAS",
                icon: Handshake,
            },
            {
                id: "acordos-firmados",
                titulo: "Acordos Firmados",
                desc: "Acordos e ajustes celebrados sem repasse financeiro.",
                href: "/transparencia/acordos-firmados",
                badge: "ACORDOS",
                icon: Handshake,
            },
            {
                id: "obras",
                titulo: "Obras Públicas",
                desc: "Acompanhamento de obras públicas e contratos no acervo.",
                href: "/transparencia/obras",
                badge: "OBRAS",
                icon: Construction,
            },
            {
                id: "editais",
                titulo: "Editais Diversos",
                desc: "Chamamentos públicos e avisos migrados do portal anterior.",
                href: "/transparencia/editais",
                badge: "EDITAIS",
                icon: Megaphone,
            },
        ],
    },
    {
        tituloCategoria: "Servidores, Pessoal e Diárias (TopSolutions 2023–2025)",
        desc: "Quadro funcional, folha, terceirizados, estagiários, contracheque e seleções de 2023 a 2025.",
        icon: Users,
        modulos: [
            {
                id: "servidores",
                titulo: "Servidores Públicos",
                desc: "Quadro funcional e remunerações no sistema TopSolutions.",
                href: "/transparencia/servidores",
                badge: "PESSOAL",
                icon: Users,
            },
            {
                id: "terceirizados",
                titulo: "Pessoal Terceirizado",
                desc: "Relação de trabalhadores terceirizados no TopSolutions.",
                href: "/transparencia/terceirizados",
                badge: "TERCEIROS",
                icon: UserPlus,
            },
            {
                id: "estagiarios",
                titulo: "Estagiários",
                desc: "Relação de estagiários ativos no portal TopSolutions.",
                href: "/transparencia/estagiarios",
                badge: "ESTÁGIO",
                icon: Briefcase,
            },
            {
                id: "contracheque",
                titulo: "Contracheque Online",
                desc: "Acesso ao portal do servidor e contracheques TopSolutions.",
                href: "https://app.topsolutionsrn.com.br/ContraCheque/pmsaotome/",
                badge: "SERVIDOR",
                icon: IdCard,
            },
            {
                id: "diarias",
                titulo: "Diárias de Viagem",
                desc: "Concessões de diárias e passagens migradas para o acervo.",
                href: "/transparencia/diarias",
                badge: "DIÁRIAS",
                icon: Plane,
            },
            {
                id: "concursos",
                titulo: "Concursos Públicos",
                desc: "Editais e convocações de concursos públicos no acervo.",
                href: "/transparencia/concursos",
                badge: "CONCURSO",
                icon: GraduationCap,
            },
            {
                id: "processo-seletivo",
                titulo: "Processos Seletivos",
                desc: "Processos seletivos simplificados migrados para o portal.",
                href: "/transparencia/processo-seletivo",
                badge: "PSS",
                icon: UserCheck,
            },
        ],
    },
    {
        tituloCategoria: "Legislação, Atos Oficiais e Cidadão (Acervo Histórico Migrado)",
        desc: "Atos normativos, prestação de contas e canais ao cidadão sincronizados no novo portal.",
        icon: Files,
        modulos: [
            {
                id: "leis",
                titulo: "Leis Municipais",
                desc: "Acervo de leis ordinárias e complementares de 2023–2025.",
                href: "/transparencia/leis",
                badge: "LEIS",
                icon: Files,
            },
            {
                id: "decretos",
                titulo: "Decretos Municipais",
                desc: "Decretos executivos municipais sincronizados no acervo.",
                href: "/transparencia/decretos",
                badge: "DECRETOS",
                icon: FileText,
            },
            {
                id: "portarias",
                titulo: "Portarias Executivas",
                desc: "Portarias administrativas migradas para consulta rápida.",
                href: "/transparencia/portarias",
                badge: "PORTARIAS",
                icon: ScrollText,
            },
            {
                id: "prestacao-contas",
                titulo: "Prestação de Contas",
                desc: "Balanços anuais, PCG, PCS e pareceres de contas.",
                href: "/transparencia/prestacao-contas",
                badge: "CONTAS",
                icon: FilePieChart,
            },
            {
                id: "esic",
                titulo: "e-SIC (LAI)",
                desc: "Serviço eletrônico de informação ao cidadão e acompanhamento.",
                href: "/servicos/esic",
                badge: "LAI",
                icon: ClipboardList,
            },
            {
                id: "ouvidoria",
                titulo: "Ouvidoria Municipal",
                desc: "Canal oficial de manifestações, elogios e denúncias.",
                href: "/servicos/ouvidoria",
                badge: "OUVIDORIA",
                icon: Headset,
            },
        ],
    },
];

export default function Transparencia2023_2025Page() {
    const [linksExternos, setLinksExternos] = useState<LinkExternoResumo[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        async function loadExternalLinks() {
            try {
                const res = await fetch("/api/links-externos");
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setLinksExternos(data);
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar links de 2023-2025:", error);
            }
        }
        loadExternalLinks();
    }, []);

    const portalCopyUrl = resolvePortalUrl(
        linksExternos,
        "portal-2023-2025",
        PORTAL_2023_2025_DEFAULT_URL
    );

    const { categoriasResolvidas, extraLinks } = useMemo(() => {
        const usedIds = new Set<string>();
        const cleanSearch = searchTerm.trim().toLowerCase();

        const resolved = CATEGORIAS_2023_2025.map((cat) => {
            const modulos = cat.modulos
                .map((m) => {
                    const res = resolveModulo2023_2025(linksExternos, m.id, m.href);
                    if (res.matchedId) usedIds.add(res.matchedId);
                    return {
                        ...m,
                        finalHref: res.href,
                        isExternal: res.isExternal,
                        origem: res.origem,
                    };
                })
                .filter(
                    (m) =>
                        !cleanSearch ||
                        m.titulo.toLowerCase().includes(cleanSearch) ||
                        m.desc.toLowerCase().includes(cleanSearch) ||
                        m.badge.toLowerCase().includes(cleanSearch) ||
                        m.origem.toLowerCase().includes(cleanSearch)
                );

            return {
                ...cat,
                modulos,
            };
        }).filter((cat) => cat.modulos.length > 0);

        const extras = linksExternos.filter((l) => {
            const alvo = l?.moduloAlvo?.toLowerCase() || "";
            if (!alvo || alvo === "portal-2023-2025") return false;
            if (!alvo.endsWith("-2023-2025") && !alvo.endsWith("-2023")) return false;
            if (l.id && usedIds.has(l.id)) return false;
            if (!cleanSearch) return true;
            return (
                (l.titulo || "").toLowerCase().includes(cleanSearch) ||
                (l.descricao || "").toLowerCase().includes(cleanSearch)
            );
        });

        return { categoriasResolvidas: resolved, extraLinks: extras };
    }, [linksExternos, searchTerm]);

    const totalResultados =
        categoriasResolvidas.reduce((acc, c) => acc + c.modulos.length, 0) + extraLinks.length;

    return (
        <div className="bg-[#f4fbff] min-h-screen text-slate-900 pt-5 sm:pt-7 pb-24">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-7">
                <SeletorPeriodos periodoAtivo="2023-2025" linksExternos={linksExternos} />

                {/* Banner 2023-2025 */}
                <section className="rounded-[26px] bg-gradient-to-br from-[#01b0ef] via-[#1dc0fa] to-[#0098d4] p-6 sm:p-8 lg:p-9 text-white shadow-xl shadow-[#01b0ef]/20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#fdb913]" />

                    <div className="space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 border border-[#fdb913] text-xs font-extrabold text-slate-900 w-fit shadow-xs">
                                <History size={13} className="text-[#01b0ef]" />
                                <span>Acervo Histórico 2023–2025 • {MUNICIPIO.nome}/{MUNICIPIO.uf}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <a
                                    href={portalCopyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fdb913] hover:bg-[#e5a60d] text-slate-900 text-xs font-extrabold transition-colors shadow-sm"
                                >
                                    <span>Acessar Portal Legado 2023–2025 (saotome.rn.gov.br)</span>
                                    <ExternalLink size={13} />
                                </a>
                                <Link
                                    href="/transparencia"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs font-bold transition-colors"
                                >
                                    <Sparkles size={13} />
                                    <span>Ir para o Portal Atual (2026)</span>
                                </Link>
                            </div>
                        </div>

                        <div className="max-w-3xl space-y-1.5">
                            <h1 className="text-2xl sm:text-4xl font-black font-heading tracking-tight text-white">
                                Portal da Transparência — Período 2023 a 2025
                            </h1>
                            <p className="text-xs sm:text-sm text-sky-100/95">
                                Consulte diretamente os módulos financeiros, licitações e pessoal do sistema{" "}
                                <strong>TopSolutions</strong> utilizados entre 2023 e 2025 ou acesse a página
                                legada no portal anterior.
                            </p>
                        </div>

                        {/* Busca nos módulos de 2023-2025 */}
                        <div className="relative group max-w-2xl">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#01b0ef] transition-colors pointer-events-none">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Filtrar módulo de 2023 a 2025 (ex: 'receitas', 'licitações', 'servidores')..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white text-slate-900 rounded-2xl pl-11 pr-10 py-3 text-sm font-semibold placeholder:text-slate-400 outline-none ring-2 ring-transparent focus:ring-[#fdb913] shadow-lg transition-all"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm("")}
                                    aria-label="Limpar busca"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* Grupos de Módulos 2023-2025 */}
                {totalResultados > 0 ? (
                    <div className="space-y-8">
                        {categoriasResolvidas.map((cat) => {
                            const CatIcon = cat.icon;
                            return (
                                <section
                                    key={cat.tituloCategoria}
                                    className="bg-white rounded-[24px] border border-[#e2e8f0] shadow-gov overflow-hidden"
                                >
                                    <div className="bg-gradient-to-r from-[#01b0ef] via-[#1dc0fa] to-[#0098d4] px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-4 border-[#fdb913]">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-xl bg-[#fdb913] flex items-center justify-center text-slate-900 shrink-0">
                                                <CatIcon size={20} />
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="text-base sm:text-lg font-black font-heading tracking-tight text-white">
                                                        {cat.tituloCategoria}
                                                    </h2>
                                                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#fdb913] text-slate-900">
                                                        {cat.modulos.length}{" "}
                                                        {cat.modulos.length === 1 ? "módulo" : "módulos"}
                                                    </span>
                                                </div>
                                                <p className="text-sky-100/90 text-xs mt-0.5">{cat.desc}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {cat.modulos.map((m) => {
                                                const ModIcon = m.icon;
                                                return (
                                                    <Link
                                                        key={m.id}
                                                        href={m.finalHref}
                                                        target={m.isExternal ? "_blank" : undefined}
                                                        rel={m.isExternal ? "noopener noreferrer" : undefined}
                                                        className="group flex flex-col justify-between h-full bg-white hover:bg-[#f4fbff] rounded-2xl border border-sky-100 border-t-4 border-t-[#01b0ef] hover:border-t-[#fdb913] shadow-sm hover:shadow-md p-5 transition-all duration-300 hover:-translate-y-0.5"
                                                    >
                                                        <div>
                                                            <div className="flex items-center justify-between mb-3.5">
                                                                <div className="w-10 h-10 rounded-xl bg-[#e6f8ff] border border-[#01b0ef]/20 text-[#01b0ef] group-hover:bg-[#01b0ef] group-hover:text-white flex items-center justify-center transition-all">
                                                                    <ModIcon size={18} />
                                                                </div>
                                                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#f4fbff] border border-[#e2e8f0] text-slate-600">
                                                                    {m.badge}
                                                                </span>
                                                            </div>

                                                            <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#01b0ef] transition-colors leading-snug mb-1.5">
                                                                {m.titulo}
                                                            </h3>
                                                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                                                                {m.desc}
                                                            </p>
                                                        </div>

                                                        <div className="mt-4 pt-3 border-t border-[#e2e8f0] flex items-center justify-between">
                                                            {m.isExternal ? (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#01b0ef] bg-[#e6f8ff] px-2 py-0.5 rounded border border-[#01b0ef]/20">
                                                                    <ExternalLink size={10} /> {m.origem}
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-[#fff4d4] px-2 py-0.5 rounded border border-[#fdb913]/40">
                                                                    {m.origem}
                                                                </span>
                                                            )}
                                                            <div className="w-7 h-7 rounded-full bg-[#f4fbff] border border-sky-100 group-hover:bg-[#01b0ef] group-hover:border-[#01b0ef] text-slate-600 group-hover:text-white flex items-center justify-center transition-all">
                                                                {m.isExternal ? (
                                                                    <ArrowUpRight size={13} />
                                                                ) : (
                                                                    <ArrowRight size={13} />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </section>
                            );
                        })}

                        {extraLinks.length > 0 && (
                            <section className="bg-white rounded-[24px] border border-[#e2e8f0] shadow-gov overflow-hidden">
                                <div className="bg-gradient-to-r from-[#01b0ef] via-[#1dc0fa] to-[#0098d4] px-6 py-4 text-white flex items-center justify-between border-b-4 border-[#fdb913]">
                                    <div>
                                        <h2 className="text-base sm:text-lg font-black font-heading tracking-tight text-white">
                                            Outros Links de 2023–2025
                                        </h2>
                                        <p className="text-sky-100/90 text-xs mt-0.5">
                                            Atalhos adicionais configurados no painel administrativo para este período.
                                        </p>
                                    </div>
                                </div>
                                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {extraLinks.map((l) => (
                                        <a
                                            key={l.id || l.url}
                                            href={l.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex flex-col justify-between h-full bg-white hover:bg-[#f4fbff] rounded-2xl border border-sky-100 border-t-4 border-t-[#01b0ef] hover:border-t-[#fdb913] shadow-sm hover:shadow-md p-5 transition-all"
                                        >
                                            <div>
                                                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#01b0ef] mb-1.5">
                                                    {l.titulo || l.moduloAlvo}
                                                </h3>
                                                <p className="text-xs text-slate-600 line-clamp-2">
                                                    {l.descricao || "Acesso externo ao portal de 2023 a 2025."}
                                                </p>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-[#e2e8f0] flex items-center justify-between">
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#01b0ef] bg-[#e6f8ff] px-2 py-0.5 rounded border border-[#01b0ef]/20">
                                                    <ExternalLink size={10} /> Portal Externo
                                                </span>
                                                <ArrowUpRight size={14} className="text-slate-500 group-hover:text-[#01b0ef]" />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-[#e2e8f0]">
                        <h3 className="text-lg font-extrabold text-slate-900 mb-1">
                            Nenhum módulo encontrado para &quot;{searchTerm}&quot;
                        </h3>
                        <p className="text-slate-600 text-xs mb-5">
                            Limpe o filtro abaixo para exibir todos os módulos do período 2023–2025.
                        </p>
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className="bg-[#01b0ef] hover:bg-[#0098d4] text-white px-5 py-2.5 rounded-full font-extrabold text-xs transition-all cursor-pointer"
                        >
                            Limpar Filtro
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
