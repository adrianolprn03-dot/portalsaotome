"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    BarChart,
    Bar,
    Cell
} from "recharts";
import {
    Newspaper,
    Construction,
    Building2,
    Scale,
    FileSignature,
    Users,
    Plus,
    ArrowRight,
    HelpCircle,
    Activity,
    TrendingUp,
    MessageSquare,
    BookOpen,
    Eye,
    Calendar,
    ArrowUpRight
} from "lucide-react";

interface DashboardClientProps {
    session: any;
    role: string;
    counts: {
        noticia: number;
        licitacao: number;
        contrato: number;
        convenio: number;
        diaria: number;
        servidor: number;
        ouvidoria: number;
        contato: number;
        obra: number;
        faq: number;
        glossario: number;
        legislacao: number;
        unidades: number;
    };
    ultimasNoticias: any[];
    ultimasObras: any[];
    ultimasFAQs: any[];
}

export default function DashboardClient({
    session,
    role,
    counts,
    ultimasNoticias,
    ultimasObras,
    ultimasFAQs
}: DashboardClientProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const userFirstName = session?.user?.name?.split(' ')[0] || 'Gestor';

    // Mock data para gráfico de acessos nos últimos 7 dias
    const accessData = [
        { name: "Seg", acessos: 320, publicacoes: 4 },
        { name: "Ter", acessos: 450, publicacoes: 6 },
        { name: "Qua", acessos: 390, publicacoes: 2 },
        { name: "Qui", acessos: 520, publicacoes: 8 },
        { name: "Sex", acessos: 610, publicacoes: 5 },
        { name: "Sáb", acessos: 280, publicacoes: 1 },
        { name: "Dom", acessos: 190, publicacoes: 3 },
    ];

    // Dados reais de distribuição baseados nos contadores
    const distributionData = [
        { name: "Notícias", valor: counts.noticia, color: "#3b82f6" },
        { name: "Licitações", valor: counts.licitacao, color: "#f59e0b" },
        { name: "Contratos", valor: counts.contrato, color: "#ec4899" },
        { name: "Obras", valor: counts.obra, color: "#f97316" },
        { name: "Servidores", valor: counts.servidor, color: "#06b6d4" },
        { name: "Documentos", valor: counts.documentos || counts.contrato + counts.convenio, color: "#10b981" },
    ];

    // Configuração dos Cards de Métricas
    const cards = [
        { 
            icon: Newspaper, 
            gradient: "from-blue-500 to-indigo-600", 
            bgLight: "bg-blue-50/50", 
            textColor: "text-blue-600", 
            href: "/admin/noticias", 
            label: "Notícias", 
            value: counts.noticia, 
            roles: ["admin", "editor", "comunicacao"] 
        },
        { 
            icon: Construction, 
            gradient: "from-orange-500 to-red-600", 
            bgLight: "bg-orange-50/50", 
            textColor: "text-orange-600", 
            href: "/admin/obras", 
            label: "Obras", 
            value: counts.obra, 
            roles: ["admin", "editor"] 
        },
        { 
            icon: Building2, 
            gradient: "from-emerald-400 to-teal-600", 
            bgLight: "bg-emerald-50/50", 
            textColor: "text-emerald-600", 
            href: "/admin/unidades", 
            label: "Unidades", 
            value: counts.unidades, 
            roles: ["admin", "editor"] 
        },
        { 
            icon: Scale, 
            gradient: "from-amber-400 to-amber-600", 
            bgLight: "bg-amber-50/50", 
            textColor: "text-amber-600", 
            href: "/admin/licitacoes", 
            label: "Licitações", 
            value: counts.licitacao, 
            roles: ["admin", "editor"] 
        },
        { 
            icon: FileSignature, 
            gradient: "from-rose-400 to-pink-600", 
            bgLight: "bg-pink-50/50", 
            textColor: "text-pink-600", 
            href: "/admin/contratos", 
            label: "Contratos", 
            value: counts.contrato, 
            roles: ["admin", "editor"] 
        },
        { 
            icon: Users, 
            gradient: "from-cyan-400 to-blue-500", 
            bgLight: "bg-cyan-50/50", 
            textColor: "text-cyan-600", 
            href: "/admin/servidores", 
            label: "Servidores", 
            value: counts.servidor, 
            roles: ["admin", "editor"] 
        },
    ].filter(c => c.roles.includes(role));

    // Variantes para animações do framer-motion
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8 pb-12"
        >
            {/* HERO WELCOME AREA */}
            <motion.div 
                variants={itemVariants}
                className="relative overflow-hidden rounded-[2rem] bg-white p-6 sm:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.015)]"
            >
                {/* Decorativos de Background modernistas */}
                <div className="absolute top-0 right-0 w-[45%] h-full bg-gradient-to-br from-primary-500/5 to-blue-500/5 rounded-bl-[10rem] pointer-events-none" />
                <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-primary-100/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50/60 border border-primary-100/30 text-primary-600 text-[10px] font-black uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></span>
                            Portal Ativo
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                            Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-blue-600">{userFirstName}</span>
                        </h1>
                        <p className="text-slate-400 text-sm max-w-xl font-medium">
                            Aqui está o resumo administrativo de hoje. Existem <span className="text-slate-700 font-bold">{counts.contato} contatos não respondidos</span> e <span className="text-slate-700 font-bold">{counts.ouvidoria} manifestações ativas</span> na Ouvidoria.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 shrink-0">
                        <Link 
                            href="/admin/noticias/nova" 
                            className="group px-4 py-2.5 bg-gradient-to-r from-primary-500 to-blue-600 hover:from-primary-600 hover:to-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                        >
                            <Plus size={14} /> Nova Notícia
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* METRICS GRID */}
            <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <h2 className="text-xs uppercase font-black text-slate-400 tracking-wider">Indicadores Rápidos</h2>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="text-[10px] text-slate-400 font-medium">Total Geral</span>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {cards.map((c) => {
                        const CardIcon = c.icon;
                        return (
                            <motion.div
                                key={c.href}
                                whileHover={{ y: -4, shadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}
                                className="group relative bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 overflow-hidden isolate"
                            >
                                <Link href={c.href} className="flex flex-col justify-between h-full gap-5">
                                    <div className="flex items-center justify-between">
                                        <div className={`w-10 h-10 rounded-xl ${c.bgLight} ${c.textColor} flex items-center justify-center shrink-0`}>
                                            <CardIcon size={18} />
                                        </div>
                                        <ArrowUpRight size={14} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                    </div>
                                    
                                    <div>
                                        <div className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
                                            {c.value.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.label}</div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* CHART PANEL */}
            {isMounted && (
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Gráfico de Tendência (Área) */}
                    <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                                    <Activity size={16} className="text-primary-500" />
                                    Acessos & Publicações Semanais
                                </h3>
                                <p className="text-[10px] text-slate-400 font-medium">Monitoramento de engajamento do portal municipal</p>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-bold">
                                <span className="flex items-center gap-1 text-primary-500">
                                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                                    Acessos
                                </span>
                                <span className="flex items-center gap-1 text-slate-400">
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                                    Novos Posts
                                </span>
                            </div>
                        </div>

                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={accessData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAcessos" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#01b0ef" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#01b0ef" stopOpacity={0.0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #f1f5f9", fontSize: "11px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}
                                    />
                                    <Area type="monotone" dataKey="acessos" stroke="#01b0ef" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAcessos)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Gráfico de Distribuição (Barras) */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                                <TrendingUp size={16} className="text-primary-500" />
                                Distribuição de Registros
                            </h3>
                            <p className="text-[10px] text-slate-400 font-medium">Volume de registros por categorias no banco</p>
                        </div>

                        <div className="h-56 w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #f1f5f9", fontSize: "11px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}
                                    />
                                    <Bar dataKey="valor" radius={[4, 4, 0, 0]} barSize={24}>
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* SPLIT LAYOUT (LISTS & ACTIONS) */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna de Atividade Recente (Notícias e Obras) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Notícias Recentes */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                                    <Newspaper size={16} className="text-primary-500" />
                                    Últimas Notícias Publicadas
                                </h3>
                                <p className="text-[10px] text-slate-400 font-medium">Conteúdos jornalísticos recentes no portal</p>
                            </div>
                            <Link href="/admin/noticias" className="text-xs font-bold text-primary-500 hover:text-primary-600 hover:underline flex items-center gap-0.5">
                                Ver tudo <ArrowRight size={12} />
                            </Link>
                        </div>

                        <div className="divide-y divide-slate-50">
                            {ultimasNoticias.length === 0 ? (
                                <p className="text-xs text-slate-400 italic py-6 text-center">Nenhuma notícia registrada recentemente.</p>
                            ) : (
                                ultimasNoticias.map((n) => (
                                    <Link 
                                        key={n.id} 
                                        href={`/admin/noticias/editar/${n.id}`} 
                                        className="group flex flex-col sm:flex-row sm:items-center justify-between py-3.5 hover:bg-slate-50/50 rounded-xl px-2.5 transition-colors -mx-2.5 gap-2"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                n.publicada ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                                            }`}>
                                                <Newspaper size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-700 line-clamp-1 group-hover:text-primary-600 transition-colors">
                                                    {n.titulo}
                                                </p>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                                    <span className={n.publicada ? "text-green-600 font-semibold" : "text-orange-500 font-semibold"}>
                                                        {n.publicada ? "Publicado" : "Rascunho"}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{new Date(n.criadoEm).toLocaleDateString("pt-BR")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Obras Recentes */}
                    {["admin", "editor"].includes(role) && (
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                                        <Construction size={16} className="text-primary-500" />
                                        Últimas Obras Registradas
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-medium">Acompanhamento de infraestrutura urbana</p>
                                </div>
                                <Link href="/admin/obras" className="text-xs font-bold text-primary-500 hover:text-primary-600 hover:underline flex items-center gap-0.5">
                                    Ver tudo <ArrowRight size={12} />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {ultimasObras.length === 0 ? (
                                    <p className="col-span-2 text-xs text-slate-400 italic py-6 text-center">Nenhuma obra cadastrada.</p>
                                ) : (
                                    ultimasObras.map((o) => {
                                        const statusColors: Record<string, string> = {
                                            concluida: "bg-green-100 text-green-700",
                                            paralisada: "bg-red-100 text-red-700",
                                            em_andamento: "bg-orange-100 text-orange-700",
                                            planejada: "bg-blue-100 text-blue-700",
                                        };
                                        const statusLabels: Record<string, string> = {
                                            concluida: "Concluída",
                                            paralisada: "Paralisada",
                                            em_andamento: "Em Andamento",
                                            planejada: "Planejada",
                                        };

                                        return (
                                            <Link 
                                                key={o.id} 
                                                href={`/admin/obras/editar/${o.id}`} 
                                                className="group flex gap-3.5 p-3.5 bg-slate-50/40 rounded-xl hover:bg-slate-50 hover:shadow-sm transition-all border border-transparent hover:border-slate-100"
                                            >
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                                    o.status === "concluida" ? "bg-green-500 text-white" : 
                                                    o.status === "paralisada" ? "bg-red-500 text-white" : 
                                                    "bg-primary-500 text-white"
                                                }`}>
                                                    <Construction size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-700 line-clamp-1 group-hover:text-primary-600 transition-colors">
                                                        {o.titulo}
                                                    </p>
                                                    <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md mt-1.5 ${statusColors[o.status] || "bg-slate-100 text-slate-600"}`}>
                                                        {statusLabels[o.status] || o.status}
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Coluna Direta (Atalhos e FAQ) */}
                <div className="space-y-6">
                    {/* Acesso Rápido */}
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden isolate">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 blur-3xl opacity-60 rounded-full" />
                        
                        <div className="mb-5">
                            <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                                <Compass size={16} className="text-primary-400" />
                                Acesso Rápido
                            </h3>
                            <p className="text-[10px] text-slate-400 font-medium">Cadastros e mensagens rápidas</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            {[
                                { label: "Nova Obra", href: "/admin/obras/nova", icon: "🏗️", roles: ["admin", "editor"] },
                                { label: "Nova Pergunta", href: "/admin/faq/novo", icon: "💡", roles: ["admin", "editor"] },
                                { label: "Novo Glossário", href: "/admin/glossario/novo", icon: "📖", roles: ["admin", "editor"] },
                                { label: "Fale Conosco", href: "/admin/contatos", icon: "📨", roles: ["admin", "editor"] },
                            ].filter(a => a.roles.includes(role)).map((a) => (
                                <Link 
                                    key={a.href} 
                                    href={a.href} 
                                    className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1.5 transition-all hover:scale-[1.02]"
                                >
                                    <span className="text-lg">{a.icon}</span>
                                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-300">{a.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* FAQ Mini */}
                    {["admin", "editor"].includes(role) && (
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                                        <HelpCircle size={16} className="text-primary-500" />
                                        Dúvidas Frequentes (FAQ)
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-medium">Lista de FAQs mais acessados</p>
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                {ultimasFAQs.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic py-4 text-center">Nenhum FAQ registrado.</p>
                                ) : (
                                    ultimasFAQs.map(f => (
                                        <Link 
                                            key={f.id} 
                                            href={`/admin/faq/editar/${f.id}`} 
                                            className="block p-3 rounded-xl bg-slate-50/60 hover:bg-primary-50/40 border border-transparent hover:border-primary-100/35 transition-colors"
                                        >
                                            <p className="text-xs font-bold text-slate-700 line-clamp-2">{f.pergunta}</p>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
