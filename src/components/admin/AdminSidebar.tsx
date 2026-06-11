"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Newspaper,
    Calendar,
    Image,
    Construction,
    HelpCircle,
    BookOpen,
    Scale,
    FileSignature,
    Handshake,
    Plane,
    Users,
    GraduationCap,
    Briefcase,
    Coins,
    BarChart3,
    UserCheck,
    FileText,
    Building2,
    Megaphone,
    Mail,
    ExternalLink,
    Shield,
    Upload,
    Flag,
    FileSpreadsheet,
    LogOut,
    ChevronDown,
    ChevronRight,
    Menu,
    ChevronLeft,
    Activity,
    Truck,
    Vote,
    Settings
} from "lucide-react";

interface MenuItem {
    label: string;
    href: string;
    icon: any;
    exact?: boolean;
    roles: string[];
}

interface MenuCategory {
    title: string;
    icon: any;
    items: MenuItem[];
}

const categories: MenuCategory[] = [
    {
        title: "Geral",
        icon: LayoutDashboard,
        items: [
            { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true, roles: ["admin", "editor", "comunicacao"] },
        ]
    },
    {
        title: "Conteúdo e Mídia",
        icon: Newspaper,
        items: [
            { label: "Notícias", href: "/admin/noticias", icon: Newspaper, roles: ["admin", "editor", "comunicacao"] },
            { label: "Agenda", href: "/admin/agenda", icon: Calendar, roles: ["admin", "editor", "comunicacao"] },
            { label: "Galeria", href: "/admin/galeria", icon: Image, roles: ["admin", "editor", "comunicacao"] },
            { label: "Obras", href: "/admin/obras", icon: Construction, roles: ["admin", "editor"] },
            { label: "FAQ", href: "/admin/faq", icon: HelpCircle, roles: ["admin", "editor"] },
            { label: "Glossário", href: "/admin/glossario", icon: BookOpen, roles: ["admin", "editor"] },
            { label: "Saúde / REMUME", href: "/admin/saude", icon: Activity, roles: ["admin", "editor"] },
        ]
    },
    {
        title: "Portal Transparência",
        icon: Scale,
        items: [
            { label: "Licitações", href: "/admin/licitacoes", icon: Scale, roles: ["admin", "editor"] },
            { label: "Contratos", href: "/admin/contratos", icon: FileSignature, roles: ["admin", "editor"] },
            { label: "Convênios", href: "/admin/convenios", icon: Handshake, roles: ["admin", "editor"] },
            { label: "Diárias", href: "/admin/diarias", icon: Plane, roles: ["admin", "editor"] },
            { label: "Receitas", href: "/admin/receitas", icon: Coins, roles: ["admin", "editor"] },
            { label: "Despesas", href: "/admin/despesas", icon: BarChart3, roles: ["admin", "editor"] },
            { label: "Servidores", href: "/admin/servidores", icon: Users, roles: ["admin", "editor"] },
            { label: "Estagiários", href: "/admin/estagiarios", icon: GraduationCap, roles: ["admin", "editor"] },
            { label: "Terceirizados", href: "/admin/terceirizados", icon: Briefcase, roles: ["admin", "editor"] },
            { label: "Emendas Parl.", href: "/admin/emendas", icon: Coins, roles: ["admin", "editor"] },
            { label: "Emendas PIX", href: "/admin/emendas-pix", icon: Vote, roles: ["admin", "editor"] },
            { label: "Relatórios e Contas", href: "/admin/relatorios-fiscais", icon: FileSpreadsheet, roles: ["admin", "editor"] },
            { label: "Legislação", href: "/admin/legislacao", icon: Scale, roles: ["admin", "editor"] },
            { label: "Documentos", href: "/admin/documentos", icon: FileText, roles: ["admin", "editor"] },
            { label: "Concursos", href: "/admin/concursos", icon: Users, roles: ["admin", "editor"] },
            { label: "Editais", href: "/admin/editais", icon: Megaphone, roles: ["admin", "editor"] },
        ]
    },
    {
        title: "Ouvidoria e Serviços",
        icon: Megaphone,
        items: [
            { label: "Ouvidoria", href: "/admin/ouvidoria", icon: Megaphone, roles: ["admin", "editor"] },
            { label: "e-SIC", href: "/admin/esic", icon: FileText, roles: ["admin", "editor"] },
            { label: "Fale Conosco", href: "/admin/contatos", icon: Mail, roles: ["admin", "editor"] },
            { label: "Pesquisas (PNTP)", href: "/admin/pesquisa-satisfacao", icon: BarChart3, roles: ["admin", "editor"] },
            { label: "Carta de Serviços", href: "/admin/carta-servicos", icon: FileText, roles: ["admin", "editor"] },
        ]
    },
    {
        title: "Administrativo",
        icon: Building2,
        items: [
            { label: "Secretarias", href: "/admin/secretarias", icon: Building2, roles: ["admin", "editor"] },
            { label: "Unidades At.", href: "/admin/unidades", icon: Building2, roles: ["admin", "editor"] },
            { label: "Conselhos", href: "/admin/conselhos", icon: UserCheck, roles: ["admin", "editor"] },
            { label: "Frota Municipal", href: "/admin/frota", icon: Truck, roles: ["admin", "editor"] },
            { label: "Links Externos", href: "/admin/links-externos", icon: ExternalLink, roles: ["admin", "editor"] },
        ]
    },
    {
        title: "Configurações",
        icon: Settings,
        items: [
            { label: "Configurações", href: "/admin/configuracoes", icon: Settings, roles: ["admin"] },
            { label: "Usuários", href: "/admin/usuarios", icon: Shield, roles: ["admin"] },
            { label: "Símbolos Oficiais", href: "/admin/configuracoes/simbolos", icon: Flag, roles: ["admin"] },
            { label: "Importar CSV", href: "/admin/importacao", icon: Upload, roles: ["admin"] },
        ]
    }
];

export default function AdminSidebar({ userRole = "admin" }: { userRole?: string }) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

    // Expandir por padrão a categoria que contém o link ativo
    useEffect(() => {
        if (!pathname) return;
        const activeCategory = categories.find(cat =>
            cat.items.some(item =>
                item.exact ? pathname === item.href : pathname.startsWith(item.href)
            )
        );
        if (activeCategory) {
            setExpandedCategories(prev => ({
                ...prev,
                [activeCategory.title]: true
            }));
        }
    }, [pathname]);

    const isActive = (href: string, exact?: boolean) => {
        if (!pathname) return false;
        return exact ? pathname === href : pathname.startsWith(href);
    };

    const toggleCategory = (title: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    return (
        <aside
            className={`bg-white border-r border-slate-100 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${collapsed ? "w-20" : "w-64"} min-h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.01)] z-40 rounded-tr-[1.5rem] rounded-br-[1.5rem] m-0`}
            aria-label="Menu administrativo"
        >
            {/* Logo & Toggle */}
            <div className={`p-5 flex items-center ${collapsed ? 'justify-center' : 'justify-between'} border-b border-slate-50 mb-4`}>
                {!collapsed && (
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-lg shadow-primary-500/20 shrink-0">
                            <span className="text-white text-xs">🏛️</span>
                        </div>
                        <div className="whitespace-nowrap">
                            <div className="text-xs font-black text-slate-800 tracking-tight leading-none mb-1">Painel Admin</div>
                            <div className="text-[9px] uppercase font-bold text-slate-400 tracking-widest leading-none">São Tomé</div>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary-600 hover:bg-slate-50 transition-all shrink-0"
                    aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
                >
                    {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            {/* Menu List */}
            <div className="flex-1 overflow-y-auto overflow-x-visible px-3 pb-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <nav className="space-y-4" aria-label="Navegação Principal">
                    {categories.map((category) => {
                        // Filtrar itens pelo papel do usuário
                        const visibleItems = category.items.filter(item => item.roles.includes(userRole));
                        if (visibleItems.length === 0) return null;

                        const isExpanded = expandedCategories[category.title];
                        const hasActiveChild = visibleItems.some(item => isActive(item.href, item.exact));
                        const CategoryIcon = category.icon;

                        // Se colapsado, renderizar ícone de categoria com popover flutuante no hover
                        if (collapsed) {
                            const isPopoverActive = hoveredCategory === category.title;
                            return (
                                <div
                                    key={category.title}
                                    className="relative flex justify-center"
                                    onMouseEnter={() => setHoveredCategory(category.title)}
                                    onMouseLeave={() => setHoveredCategory(null)}
                                >
                                    <button
                                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                                            hasActiveChild
                                                ? "bg-primary-50 text-primary-600 shadow-sm"
                                                : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                                        }`}
                                    >
                                        <CategoryIcon size={18} />
                                    </button>

                                    {/* Submenu Popover Flutuante */}
                                    {isPopoverActive && (
                                        <div className="absolute left-full top-0 ml-2 w-56 bg-white rounded-2xl border border-slate-100 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-left-2 duration-200">
                                            <div className="px-3 py-1.5 border-b border-slate-50 mb-1">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                                    {category.title}
                                                </span>
                                            </div>
                                            <div className="space-y-0.5 max-h-[300px] overflow-y-auto">
                                                {visibleItems.map((item) => {
                                                    const active = isActive(item.href, item.exact);
                                                    const ItemIcon = item.icon;
                                                    return (
                                                        <Link
                                                            key={item.href}
                                                            href={item.href}
                                                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                                                                active
                                                                    ? "text-primary-700 font-bold bg-primary-50/50"
                                                                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50 font-medium"
                                                            }`}
                                                        >
                                                            <ItemIcon size={14} className={active ? "text-primary-600" : "text-slate-400"} />
                                                            <span className="truncate">{item.label}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        // Se expandido, renderizar grupo padrão com cabeçalho colapsável
                        return (
                            <div key={category.title} className="space-y-1">
                                {/* Cabeçalho da Categoria */}
                                <button
                                    onClick={() => toggleCategory(category.title)}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-[10px] uppercase font-bold tracking-wider rounded-xl transition-colors ${
                                        hasActiveChild 
                                            ? "text-primary-600 bg-primary-50/10" 
                                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <CategoryIcon size={12} className={hasActiveChild ? "text-primary-500" : "text-slate-400"} />
                                        <span>{category.title}</span>
                                    </div>
                                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                </button>

                                {/* Lista de Itens da Categoria */}
                                {isExpanded && (
                                    <div className="space-y-0.5 pl-2 border-l border-slate-100 ml-4 py-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                        {visibleItems.map((item) => {
                                            const active = isActive(item.href, item.exact);
                                            const ItemIcon = item.icon;
                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 relative overflow-hidden ${
                                                        active
                                                            ? "text-primary-700 font-bold bg-primary-50/80 shadow-[inset_0_1px_1px_rgba(255,255,255,1)]"
                                                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50 font-medium"
                                                    }`}
                                                >
                                                    {/* Indicador Ativo */}
                                                    {active && (
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary-500 rounded-r-full" />
                                                    )}
                                                    
                                                    <div className={`flex items-center justify-center shrink-0 ${active ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                                        <ItemIcon size={14} />
                                                    </div>

                                                    <span className="text-[11px] tracking-wide whitespace-nowrap">{item.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Footer / User Actions */}
            <div className="p-3 border-t border-slate-50 mt-auto bg-slate-50/20">
                <div className={`space-y-1.5 ${collapsed ? '' : 'px-1'}`}>
                    <Link
                        href="/"
                        target="_blank"
                        title={collapsed ? "Ver site" : undefined}
                        className={`group flex items-center gap-2.5 py-2 rounded-xl text-slate-500 hover:text-slate-800 transition-colors ${collapsed ? 'justify-center' : 'px-2'}`}
                    >
                        <ExternalLink className="text-slate-400 group-hover:text-slate-600 shrink-0" size={14} />
                        {!collapsed && <span className="text-xs font-bold tracking-wide text-slate-600">Portal Livre</span>}
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/admin/login" })}
                        title={collapsed ? "Sair" : undefined}
                        className={`w-full group flex items-center gap-2.5 py-2 rounded-xl text-red-500/80 hover:text-red-600 hover:bg-red-50/50 transition-all ${collapsed ? 'justify-center' : 'px-2'}`}
                    >
                        <LogOut className="group-hover:-translate-x-0.5 transition-transform shrink-0" size={14} />
                        {!collapsed && <span className="text-xs font-bold tracking-wide">Sair</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
}
