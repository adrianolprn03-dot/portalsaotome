"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Search,
    Menu,
    X,
    ChevronDown,
    ShieldCheck,
    Phone,
    ArrowUpRight,
    ExternalLink,
} from "lucide-react";
import BuscaGlobal from "./BuscaGlobal";
import AccessibilityToolbar from "./AccessibilityToolbar";

export interface HeaderExternalLinks {
    contribuinteUrl: string;
    diarioUrl: string;
}

interface SubMenuItem {
    label: string;
    desc: string;
    href: string;
    external?: boolean;
}

interface NavItem {
    label: string;
    href: string;
    highlight?: boolean;
    children?: SubMenuItem[];
}

export default function Header({
    externalLinks,
}: {
    externalLinks?: HeaderExternalLinks;
}) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const pathname = usePathname();
    const navRef = useRef<HTMLElement>(null);

    const contribuinteHref =
        externalLinks?.contribuinteUrl ||
        "https://www.tinus.com.br/csp/SAOTOME/portal/index.csp?398ePKh0101MOVZE78365xmEw9088og=xbCN41Noq203lgm19139rlZlh569ZevDU2955S1071625bJbX145";

    const navItems: NavItem[] = [
        {
            label: "Prefeitura",
            href: "/a-prefeitura",
            children: [
                {
                    label: "A Prefeitura",
                    desc: "Sede administrativa, missão e identificação oficial",
                    href: "/a-prefeitura",
                },
                {
                    label: "Gestão Municipal (Prefeito e Vice)",
                    desc: "Gabinete do Prefeito e Vice-Prefeito",
                    href: "/a-prefeitura/prefeito",
                },
                {
                    label: "Estrutura Administrativa",
                    desc: "Organograma oficial e competências",
                    href: "/a-prefeitura/estrutura",
                },
                {
                    label: "Secretarias Municipais",
                    desc: "Diretório de secretarias, horários, endereços e titulares",
                    href: "/secretarias",
                },
                {
                    label: "Agenda do Executivo",
                    desc: "Compromissos oficiais da gestão municipal",
                    href: "/a-prefeitura/agenda",
                },
            ],
        },
        {
            label: "Município",
            href: "/a-prefeitura/historia",
            children: [
                {
                    label: "História de São Tomé",
                    desc: "Origens históricas, formação e dados do município",
                    href: "/a-prefeitura/historia",
                },
                {
                    label: "Símbolos Oficiais",
                    desc: "Brasão, bandeira e hino municipal",
                    href: "/municipio/simbolos",
                },
                {
                    label: "Cultura, Esporte e Lazer",
                    desc: "Equipamentos culturais, tradição e eventos locais",
                    href: "/servicos/cultura",
                },
                {
                    label: "Galeria de Fotos",
                    desc: "Registros fotográficos do município e ações públicas",
                    href: "/galeria",
                },
            ],
        },
        {
            label: "Serviços",
            href: "/transparencia/carta-servicos",
            children: [
                {
                    label: "Carta de Serviços ao Cidadão",
                    desc: "Catálogo geral de serviços, prazos e requisitos",
                    href: "/transparencia/carta-servicos",
                },
                {
                    label: "Saúde (Unidades UBS e SUS)",
                    desc: "Unidades básicas de saúde, horários, médicos e farmácia",
                    href: "/unidades-de-saude",
                },
                {
                    label: "Educação (Escolas e Creches)",
                    desc: "Rede municipal de ensino, creches e lista de espera",
                    href: "/unidades-escolares",
                },
                {
                    label: "Assistência Social (CRAS)",
                    desc: "Atendimento socioassistencial, CadÚnico e programas",
                    href: "/socioassistencial",
                },
                {
                    label: "Tributos (Portal do Contribuinte)",
                    desc: "Emissão de guias de IPTU, certidões, alvarás e nota fiscal",
                    href: contribuinteHref,
                    external: contribuinteHref.startsWith("http"),
                },
                {
                    label: "Registrar manifestação (Ouvidoria)",
                    desc: "Sugestões, elogios, solicitações, reclamações e denúncias",
                    href: "/servicos/ouvidoria",
                },
                {
                    label: "Solicitar informação pública (e-SIC)",
                    desc: "Pedido de acesso à informação pela Lei nº 12.527/2011",
                    href: "/servicos/esic",
                },
                {
                    label: "Consultar protocolo",
                    desc: "Acompanhe manifestações da Ouvidoria e pedidos do e-SIC",
                    href: "/servicos/consulta-protocolo",
                },
            ],
        },
        {
            label: "Notícias",
            href: "/noticias",
        },
        {
            label: "Transparência",
            href: "/transparencia",
            highlight: true,
            children: [
                {
                    label: "Portal da Transparência",
                    desc: "Acesso completo aos módulos de transparência ativa e passiva",
                    href: "/transparencia",
                },
                {
                    label: "Despesas Públicas",
                    desc: "Empenhos, liquidações e pagamentos municipais",
                    href: "/transparencia/despesas",
                },
                {
                    label: "Receitas Públicas",
                    desc: "Arrecadação municipal e transferências constitucionais",
                    href: "/transparencia/receitas",
                },
                {
                    label: "Licitações e Editais",
                    desc: "Processos licitatórios, pregões e dispensas",
                    href: "/transparencia/licitacoes",
                },
                {
                    label: "Contratos Administrativos",
                    desc: "Contratos celebrados, vigências, fiscais e aditivos",
                    href: "/transparencia/contratos",
                },
                {
                    label: "Obras Públicas",
                    desc: "Acompanhamento físico e financeiro de obras municipais",
                    href: "/transparencia/obras",
                },
                {
                    label: "Legislação Municipal",
                    desc: "Leis ordinárias, complementares, decretos e portarias",
                    href: "/transparencia/legislacao",
                },
                {
                    label: "Servidores e Folha",
                    desc: "Quadro funcional, remunerações, estagiários e diárias",
                    href: "/transparencia/servidores",
                },
                {
                    label: "Radar e Matriz PNTP",
                    desc: "Matriz de critérios e avaliação da transparência pública",
                    href: "/transparencia/radar",
                },
            ],
        },
        {
            label: "Contato",
            href: "/contato",
        },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 12);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
        setOpenDropdown(null);
    }, [pathname]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setIsSearchOpen((prev) => !prev);
            }
            if (e.key === "Escape") {
                setIsSearchOpen(false);
                setOpenDropdown(null);
                setMobileOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <header className="w-full z-50 fixed top-0 left-0 right-0">
            <AccessibilityToolbar />

            {/* MAIN NAVBAR */}
            <div
                id="menu-principal"
                className={`w-full transition-all duration-200 bg-white/95 backdrop-blur-lg border-b ${
                    scrolled
                        ? "h-[68px] border-slate-300 shadow-civic"
                        : "h-[74px] border-slate-200"
                }`}
            >
                <div className="max-w-[1320px] h-full mx-auto px-3 sm:px-6 lg:px-5 xl:px-8 flex items-center justify-between gap-2 sm:gap-3">
                    {/* Brasão e Nome da Prefeitura -> Home */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 sm:gap-2.5 group shrink-0 py-1 rounded-xl min-w-0"
                        aria-label="Prefeitura de São Tomé — Ir para a página inicial"
                    >
                        <img
                            src="/brasao_oficial.png"
                            alt="Brasão Oficial do Município de São Tomé"
                            width={44}
                            height={41}
                            className="h-9 w-auto sm:h-11 object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
                        />
                        <div className="flex flex-col min-w-0">
                            <span className="font-heading text-sm sm:text-base lg:text-[15px] xl:text-[17px] font-extrabold text-slate-900 group-hover:text-[#00557d] tracking-tight leading-tight whitespace-nowrap">
                                Prefeitura de São Tomé
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-bold text-[#00557d] tracking-wide uppercase leading-tight whitespace-nowrap">
                                Rio Grande do Norte
                            </span>
                        </div>
                    </Link>

                    {/* Navegação Principal Desktop (sem quebra de linha) */}
                    <nav
                        ref={navRef}
                        className="hidden lg:flex items-center gap-0.5 xl:gap-1.5"
                        aria-label="Navegação Principal"
                    >
                        {navItems.map((item, index) => {
                            const isActive = pathname
                                ? pathname === item.href ||
                                  (item.href !== "/" && pathname.startsWith(item.href))
                                : false;
                            const isDropdownOpen = openDropdown === index;

                            return (
                                <div
                                    key={item.label}
                                    className="relative py-2"
                                    onMouseEnter={() => item.children && setOpenDropdown(index)}
                                    onMouseLeave={() => item.children && setOpenDropdown(null)}
                                    onBlur={(e) => {
                                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                            if (openDropdown === index) setOpenDropdown(null);
                                        }
                                    }}
                                >
                                    <div className="flex items-center">
                                        <Link
                                            href={item.href}
                                            className={`h-10 px-2 xl:px-3.5 flex items-center gap-1 xl:gap-1.5 text-[13px] xl:text-sm font-bold whitespace-nowrap shrink-0 transition-colors ${
                                                item.children ? "rounded-l-xl pr-1" : "rounded-xl"
                                            } ${
                                                item.highlight
                                                    ? "bg-[#006494] hover:bg-[#004f75] text-white shadow-xs"
                                                    : isActive
                                                    ? "text-[#00557d] bg-[#edf8ff]"
                                                    : "text-slate-800 hover:text-[#00557d] hover:bg-[#f4fbff]"
                                            }`}
                                        >
                                            {item.highlight && (
                                                <ShieldCheck
                                                    size={14}
                                                    className="text-[#fdb913] shrink-0"
                                                    aria-hidden="true"
                                                />
                                            )}
                                            <span>{item.label}</span>
                                        </Link>

                                        {item.children && (
                                            <button
                                                type="button"
                                                aria-expanded={isDropdownOpen}
                                                aria-haspopup="true"
                                                aria-label={`Submenu de ${item.label}`}
                                                onClick={() =>
                                                    setOpenDropdown((prev) =>
                                                        prev === index ? null : index
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "ArrowDown") {
                                                        e.preventDefault();
                                                        setOpenDropdown(index);
                                                    }
                                                }}
                                                className={`h-10 px-1 xl:px-1.5 flex items-center justify-center rounded-r-xl transition-colors cursor-pointer ${
                                                    item.highlight
                                                        ? "bg-[#006494] hover:bg-[#004f75] text-white border-l border-white/20"
                                                        : isActive
                                                        ? "text-[#00557d] bg-[#edf8ff]"
                                                        : "text-slate-700 hover:text-[#00557d] hover:bg-[#f4fbff]"
                                                }`}
                                            >
                                                <ChevronDown
                                                    size={13}
                                                    className={`transition-transform duration-200 ${
                                                        isDropdownOpen ? "rotate-180" : ""
                                                    }`}
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        )}
                                    </div>

                                    {/* Submenu Dropdown */}
                                    {item.children && isDropdownOpen && (
                                        <div
                                            className={`absolute top-full pt-1.5 w-80 animate-dropdown-fade z-50 ${
                                                index >= 4 ? "right-0" : "left-0"
                                            }`}
                                        >
                                            <div className="bg-white rounded-2xl p-2 shadow-civic-xl border border-slate-200 overflow-hidden">
                                                <div className="h-1 w-full heraldic-stripe rounded-full mb-1.5" />
                                                <ul className="space-y-0.5" role="list">
                                                    {item.children.map((sub) => (
                                                        <li key={sub.label}>
                                                            {sub.external ? (
                                                                <a
                                                                    href={sub.href}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    onClick={() => setOpenDropdown(null)}
                                                                    className="flex items-start justify-between gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#f4fbff] transition-colors group/sub"
                                                                >
                                                                    <div>
                                                                        <div className="text-[13px] font-bold text-slate-900 group-hover/sub:text-[#00557d]">
                                                                            {sub.label}
                                                                        </div>
                                                                        <div className="text-xs text-slate-600 leading-snug mt-0.5">
                                                                            {sub.desc}
                                                                        </div>
                                                                    </div>
                                                                    <ExternalLink
                                                                        size={13}
                                                                        className="text-slate-500 group-hover/sub:text-[#00557d] shrink-0 mt-1"
                                                                        aria-hidden="true"
                                                                    />
                                                                </a>
                                                            ) : (
                                                                <Link
                                                                    href={sub.href}
                                                                    onClick={() => setOpenDropdown(null)}
                                                                    className="flex items-start justify-between gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#f4fbff] transition-colors group/sub"
                                                                >
                                                                    <div>
                                                                        <div className="text-[13px] font-bold text-slate-900 group-hover/sub:text-[#00557d]">
                                                                            {sub.label}
                                                                        </div>
                                                                        <div className="text-xs text-slate-600 leading-snug mt-0.5">
                                                                            {sub.desc}
                                                                        </div>
                                                                    </div>
                                                                    <ArrowUpRight
                                                                        size={14}
                                                                        className="text-slate-500 group-hover/sub:text-[#00557d] shrink-0 mt-1"
                                                                        aria-hidden="true"
                                                                    />
                                                                </Link>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* Ações à Direita: Busca Geral e Menu Mobile */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsSearchOpen(true)}
                            className="h-10 px-2.5 sm:px-3.5 lg:px-2.5 xl:px-3.5 rounded-xl bg-[#f4fbff] hover:bg-[#edf8ff] text-slate-900 border border-slate-300 hover:border-[#006494] flex items-center gap-1.5 sm:gap-2 transition-colors text-xs lg:text-[13px] xl:text-sm font-bold whitespace-nowrap cursor-pointer"
                            title="Buscar no portal (Ctrl + K)"
                            aria-label="Buscar no portal"
                        >
                            <Search size={15} className="text-[#006494] shrink-0" aria-hidden="true" />
                            <span className="sm:hidden">Buscar</span>
                            <span className="hidden sm:inline">Buscar no portal</span>
                        </button>

                        {/* Botão Menu Mobile */}
                        <button
                            type="button"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-expanded={mobileOpen}
                            aria-controls="menu-gaveta-mobile"
                            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-[#006494] text-white hover:bg-[#004f75] transition-colors shadow-xs cursor-pointer"
                            aria-label={mobileOpen ? "Fechar menu principal" : "Abrir menu principal"}
                        >
                            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Gaveta de Menu Mobile */}
            {mobileOpen && (
                <div
                    id="menu-gaveta-mobile"
                    className="lg:hidden fixed inset-0 top-[104px] bg-white z-40 overflow-y-auto animate-fade-in px-4 sm:px-6 py-5 border-t border-slate-200"
                >
                    <nav
                        aria-label="Menu Principal Mobile"
                        className="max-w-lg mx-auto flex flex-col gap-5 pb-16"
                    >
                        {navItems.map((item) => (
                            <div key={item.label} className="flex flex-col gap-2">
                                <Link
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="text-sm font-extrabold uppercase tracking-wider text-[#00557d] px-2 flex items-center justify-between"
                                >
                                    <span className="flex items-center gap-2">
                                        <span
                                            className="w-2 h-2 rounded-full bg-[#fdb913]"
                                            aria-hidden="true"
                                        />
                                        <span>{item.label}</span>
                                    </span>
                                    <ArrowUpRight size={15} aria-hidden="true" />
                                </Link>

                                {item.children && (
                                    <div className="grid grid-cols-1 gap-1.5 pl-2">
                                        {item.children.map((sub) =>
                                            sub.external ? (
                                                <a
                                                    key={sub.label}
                                                    href={sub.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={() => setMobileOpen(false)}
                                                    className="flex items-center justify-between px-3.5 py-2.5 text-slate-900 font-semibold text-sm bg-[#f4fbff] hover:bg-[#edf8ff] border border-slate-200 rounded-xl transition-colors"
                                                >
                                                    <span>{sub.label}</span>
                                                    <ExternalLink
                                                        size={14}
                                                        className="text-[#00557d] shrink-0"
                                                        aria-hidden="true"
                                                    />
                                                </a>
                                            ) : (
                                                <Link
                                                    key={sub.label}
                                                    href={sub.href}
                                                    onClick={() => setMobileOpen(false)}
                                                    className="flex items-center justify-between px-3.5 py-2.5 text-slate-900 font-semibold text-sm bg-[#f4fbff] hover:bg-[#edf8ff] border border-slate-200 rounded-xl transition-colors"
                                                >
                                                    <span>{sub.label}</span>
                                                    <ArrowUpRight
                                                        size={15}
                                                        className="text-[#00557d] shrink-0"
                                                        aria-hidden="true"
                                                    />
                                                </Link>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        <Link
                            href="/contato"
                            onClick={() => setMobileOpen(false)}
                            className="btn-primary w-full py-3.5 text-center"
                        >
                            <Phone size={16} aria-hidden="true" />
                            <span>Falar com a Prefeitura</span>
                        </Link>
                    </nav>
                </div>
            )}

            {/* Modal de Busca Geral */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 px-4 md:pt-24">
                    <div
                        className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs animate-fade-in"
                        onClick={() => setIsSearchOpen(false)}
                        aria-hidden="true"
                    />
                    <div className="relative w-full max-w-2xl animate-fade-in-up">
                        <BuscaGlobal onClose={() => setIsSearchOpen(false)} />
                    </div>
                </div>
            )}
        </header>
    );
}
