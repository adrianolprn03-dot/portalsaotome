"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Search,
    Menu,
    X,
    ChevronDown,
    ShieldCheck,
    Building2,
    Newspaper,
    HeartPulse,
    MessageSquarePlus,
    Phone,
    Lock,
    ArrowUpRight,
} from "lucide-react";
import BuscaGlobal from "./BuscaGlobal";
import AccessibilityToolbar from "./AccessibilityToolbar";

const navItems = [
    { label: "Início", href: "/", hasDropdown: false },
    {
        label: "O Município",
        href: "/a-prefeitura",
        hasDropdown: true,
        icon: Building2,
        children: [
            { label: "A Prefeitura", desc: "Sede, missão e dados oficiais", href: "/a-prefeitura" },
            { label: "Prefeito e Vice", desc: "Gestão executiva municipal", href: "/a-prefeitura/prefeito" },
            { label: "Secretarias Municipais", desc: "Órgãos, gestores e contatos", href: "/secretarias" },
            { label: "Estrutura Administrativa", desc: "Organograma oficial e pastas", href: "/a-prefeitura/estrutura" },
            { label: "História de São Tomé", desc: "Origens, cultura e patrimônio", href: "/a-prefeitura/historia" },
        ],
    },
    {
        label: "Transparência",
        href: "/transparencia",
        hasDropdown: true,
        icon: ShieldCheck,
        children: [
            { label: "Portal da Transparência", desc: "Central completa PNTP 2026", href: "/transparencia" },
            { label: "Receitas e Despesas", desc: "Execução financeira em tempo real", href: "/transparencia/despesas" },
            { label: "Licitações e Editais", desc: "Certames, pregões e dispensas", href: "/transparencia/licitacoes" },
            { label: "Contratos e Atas SRP", desc: "Instrumentos celebrados e aditivos", href: "/transparencia/contratos" },
            { label: "Obras Públicas", desc: "Acompanhamento físico e financeiro", href: "/transparencia/obras" },
            { label: "Servidores e Folha", desc: "Quadro funcional e remunerações", href: "/transparencia/servidores" },
            { label: "Legislação Municipal", desc: "Leis, decretos e portarias", href: "/transparencia/legislacao" },
            { label: "Dados Abertos", desc: "Catálogo em CSV, JSON e API", href: "/transparencia/dados-abertos" },
            { label: "Radar PNTP 2026", desc: "Índice de transparência ATRICON", href: "/transparencia/radar" },
        ],
    },
    {
        label: "Informativos",
        href: "/noticias",
        hasDropdown: true,
        icon: Newspaper,
        children: [
            { label: "Notícias Municipais", desc: "Ações e comunicados oficiais", href: "/noticias" },
            { label: "Agenda do Executivo", desc: "Compromissos oficiais da gestão", href: "/a-prefeitura/agenda" },
            { label: "Galeria de Fotos", desc: "Registros de obras e eventos", href: "/galeria" },
        ],
    },
    {
        label: "Serviços",
        href: "/unidades-de-saude",
        hasDropdown: true,
        icon: HeartPulse,
        children: [
            { label: "Saúde e Unidades UBS", desc: "Postos, médicos e medicamentos SUS", href: "/unidades-de-saude" },
            { label: "Educação e Escolas", desc: "Rede municipal de ensino e vagas", href: "/unidades-escolares" },
            { label: "Assistência Social", desc: "CRAS, programas e benefícios", href: "/socioassistencial" },
            { label: "Cultura e Esporte", desc: "Projetos culturais e espaços", href: "/servicos/cultura" },
            { label: "Carta de Serviços", desc: "Catálogo completo ao cidadão", href: "/transparencia/carta-servicos" },
        ],
    },
    {
        label: "Cidadão",
        href: "/servicos/ouvidoria",
        hasDropdown: true,
        icon: MessageSquarePlus,
        children: [
            { label: "Ouvidoria Municipal", desc: "Denúncias, sugestões e elogios", href: "/servicos/ouvidoria" },
            { label: "e-SIC (Acesso à Informação)", desc: "Solicite informações pela LAI", href: "/servicos/esic" },
            { label: "Consultar Protocolo", desc: "Acompanhe sua manifestação", href: "/servicos/consulta-protocolo" },
            { label: "Perguntas Frequentes (FAQ)", desc: "Dúvidas comuns respondidas", href: "/transparencia/faq" },
            { label: "Glossário e LGPD", desc: "Termos técnicos e privacidade", href: "/privacidade" },
        ],
    },
];

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const pathname = usePathname();
    const [logo, setLogo] = useState("/logo_oficial.png");
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const res = await fetch("/api/admin/configuracoes?public=1");
                if (res.ok) {
                    const data = await res.json();
                    const brasao = data.find((c: any) => c.chave === "simbolo_brasao")?.valor;
                    if (brasao) setLogo(brasao);
                }
            } catch (error) {
                console.error("Erro ao carregar logos:", error);
            }
        };
        fetchLogo();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 16);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setIsSearchOpen((prev) => !prev);
            }
            if (e.key === "Escape") {
                setIsSearchOpen(false);
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
                className={`w-full transition-all duration-300 flex items-center justify-between gap-4 px-4 md:px-8 lg:px-12 relative ${
                    scrolled
                        ? "h-[72px] bg-white/95 backdrop-blur-xl border-b-2 border-[#01b0ef]/20 shadow-civic"
                        : "h-[80px] bg-white/95 backdrop-blur-lg border-b border-[#01b0ef]/15"
                }`}
            >
                {/* Brand Lockup */}
                <div className="flex items-center gap-3 shrink-0">
                    <Link href="/" className="flex items-center gap-3.5 group">
                        <img
                            src={logo}
                            alt="Prefeitura Municipal de São Tomé"
                            className="object-contain h-10 w-auto md:h-12 group-hover:scale-105 transition-transform duration-300 shrink-0"
                        />
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-1" aria-label="Navegação Principal">
                    {navItems.map((item, index) => {
                        const isActive = pathname
                            ? pathname === item.href ||
                            (item.href !== "/" && pathname.startsWith(item.href))
                            : false;
                        const isDropdownOpen = openDropdown === index;

                        return (
                            <div
                                key={index}
                                className="relative py-3"
                                onMouseEnter={() => setOpenDropdown(index)}
                                onMouseLeave={() => setOpenDropdown(null)}
                            >
                                <Link
                                    href={item.href}
                                    className={`h-10 px-3.5 xl:px-4 flex items-center gap-1.5 text-[13px] font-semibold rounded-xl transition-all duration-200 ${
                                        isActive
                                            ? "text-[#01b0ef] bg-[#01b0ef]/10 font-bold"
                                            : "text-slate-700 hover:text-[#01b0ef] hover:bg-[#01b0ef]/5"
                                    }`}
                                >
                                    <span>{item.label}</span>
                                    {item.children && (
                                        <ChevronDown
                                            size={14}
                                            className={`transition-transform duration-200 opacity-70 ${
                                                isDropdownOpen ? "rotate-180 text-[#01b0ef]" : ""
                                            }`}
                                        />
                                    )}
                                </Link>

                                {/* Mega Dropdown Menu */}
                                {item.children && isDropdownOpen && (
                                    <div className="absolute top-full left-0 pt-1.5 w-80 animate-dropdown-fade z-50">
                                        <div className="bg-white rounded-2xl p-2.5 shadow-civic-xl border border-[#01b0ef]/20 overflow-hidden">
                                            <div className="h-1 w-full heraldic-stripe rounded-full mb-2" />
                                            <div className="space-y-0.5">
                                                {item.children.map((sub, sIndex) => (
                                                    <Link
                                                        key={sIndex}
                                                        href={sub.href}
                                                        className="flex items-start justify-between gap-3 px-3.5 py-2.5 rounded-xl hover:bg-[#01b0ef]/10 transition-all group/sub"
                                                    >
                                                        <div>
                                                            <div className="text-[13px] font-bold text-slate-800 group-hover/sub:text-[#01b0ef] transition-colors">
                                                                {sub.label}
                                                            </div>
                                                            <div className="text-[11px] text-slate-500 font-normal leading-snug mt-0.5">
                                                                {sub.desc}
                                                            </div>
                                                        </div>
                                                        <ArrowUpRight
                                                            size={14}
                                                            className="text-slate-300 group-hover/sub:text-[#fdb913] group-hover/sub:translate-x-0.5 group-hover/sub:-translate-y-0.5 transition-all shrink-0 mt-1"
                                                        />
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <Link
                        href="/contato"
                        className={`h-10 px-3.5 xl:px-4 flex items-center gap-1.5 text-[13px] font-semibold rounded-xl transition-all ${
                            pathname === "/contato"
                                ? "text-[#01b0ef] bg-[#01b0ef]/10 font-bold"
                                : "text-slate-700 hover:text-[#01b0ef] hover:bg-[#01b0ef]/5"
                        }`}
                    >
                        Contato
                    </Link>
                </nav>

                {/* Right Action Cluster */}
                <div className="flex items-center gap-2.5">
                    {/* Command Search Button */}
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="h-10 px-3.5 rounded-xl bg-[#01b0ef]/10 hover:bg-[#01b0ef]/15 text-slate-700 hover:text-slate-900 border border-[#01b0ef]/20 flex items-center gap-2.5 transition-all text-xs font-medium"
                        title="Buscar no portal (Ctrl + K)"
                        aria-label="Abrir busca no portal"
                    >
                        <Search size={16} className="text-[#01b0ef]" />
                        <span className="hidden xl:inline text-slate-600">Buscar...</span>
                        <kbd className="hidden xl:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold text-[#007bb0] bg-white rounded border border-[#01b0ef]/25">
                            Ctrl K
                        </kbd>
                    </button>

                    {/* Quick CTA: Transparência */}
                    <Link
                        href="/transparencia"
                        className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#01b0ef] hover:bg-[#0098d4] text-white text-xs font-bold tracking-wide transition-all shadow-civic-sm"
                    >
                        <ShieldCheck size={15} className="text-[#fdb913]" />
                        <span>Transparência</span>
                    </Link>

                    {/* Admin Link */}
                    <Link
                        href="/admin"
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#fdb913]/15 text-slate-700 hover:bg-[#fdb913] hover:text-slate-900 transition-all border border-[#fdb913]/40"
                        title="Painel Administrativo"
                        aria-label="Painel Administrativo"
                    >
                        <Lock size={16} />
                    </Link>

                    {/* Mobile Menu Trigger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-[#01b0ef] text-white hover:bg-[#0098d4] transition-all shadow-sm"
                        aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 top-[108px] bg-white/98 backdrop-blur-xl z-40 overflow-y-auto animate-fade-in px-5 py-6 border-t border-[#01b0ef]/20">
                    <div className="max-w-lg mx-auto flex flex-col gap-6 pb-12">
                        {navItems.map((item, index) => (
                            <div key={index} className="flex flex-col gap-2">
                                <div className="text-xs font-bold uppercase tracking-wider text-[#01b0ef] px-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#fdb913]" />
                                    {item.label}
                                </div>
                                <div className="grid grid-cols-1 gap-1.5">
                                    {(
                                        item.children || [{ label: item.label, desc: "Página inicial", href: item.href }]
                                    ).map((sub, sIdx) => (
                                        <Link
                                            key={sIdx}
                                            href={sub.href}
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center justify-between px-4 py-3 text-slate-800 font-semibold text-sm bg-[#eefaff]/60 hover:bg-[#01b0ef]/10 border border-[#01b0ef]/15 rounded-xl transition-all"
                                        >
                                            <span>{sub.label}</span>
                                            <ArrowUpRight size={15} className="text-[#01b0ef]" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <Link
                            href="/contato"
                            onClick={() => setMobileOpen(false)}
                            className="btn-primary w-full py-4 text-center"
                        >
                            <Phone size={16} />
                            <span>Falar com a Prefeitura</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* Search Command Modal */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 md:pt-28">
                    <div
                        className="absolute inset-0 bg-[#01b0ef]/25 backdrop-blur-md animate-fade-in"
                        onClick={() => setIsSearchOpen(false)}
                    />
                    <div className="relative w-full max-w-2xl animate-fade-in-up">
                        <BuscaGlobal onClose={() => setIsSearchOpen(false)} />
                    </div>
                </div>
            )}
        </header>
    );
}
