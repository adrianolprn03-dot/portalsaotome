"use client";

import Link from "next/link";
import { 
    History, Sparkles, ArrowRight, ShieldCheck, 
    Calendar, Landmark, FileText, Scale, Info
} from "lucide-react";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import { MUNICIPIO } from "@/config/municipio";

export default function TransparenciaLandingPage() {
    const periodos = [
        {
            id: "2018-2022",
            titulo: "Gestão 2018 a 2022",
            subtitulo: "Legado & Arquivo Histórico",
            desc: "Consulta a dados consolidados, licitações antigas, contratos encerrados, relatórios de despesas e prestação de contas dos anos de 2018 a 2022.",
            href: "/transparencia-2018-2022",
            badge: "Histórico",
            corBadge: "bg-amber-100 text-amber-800 border-amber-200",
            corHover: "hover:border-amber-300 hover:shadow-amber-100",
            corGradient: "from-amber-600 to-amber-900",
            corHoverShadow: "group-hover:shadow-amber-600/15",
            corTextoAccent: "text-amber-650",
            corTextoHover: "group-hover:text-amber-650",
            icone: History,
            destaque: false,
        },
        {
            id: "2023-2025",
            titulo: "Gestão 2023 a 2025",
            subtitulo: "Legado & Transparência Consolidada",
            desc: "Acesso a relatórios orçamentários, folha de pagamento, diárias, convênios de repasse e atos oficiais referentes aos anos de 2023 a 2025.",
            href: "/transparencia-2023-2025",
            badge: "Histórico",
            corBadge: "bg-blue-100 text-blue-800 border-blue-200",
            corHover: "hover:border-blue-300 hover:shadow-blue-100",
            corGradient: "from-blue-600 to-blue-900",
            corHoverShadow: "group-hover:shadow-blue-600/15",
            corTextoAccent: "text-blue-600",
            corTextoHover: "group-hover:text-blue-600",
            icone: History,
            destaque: false,
        },
        {
            id: "2026",
            titulo: "Gestão 2026 em diante",
            subtitulo: "Portal de Transparência Ativa",
            desc: "Consulta a dados em tempo real, receitas, despesas correntes, licitações em andamento, quadro de pessoal e auditoria do PNTP.",
            href: "/transparencia-2026",
            badge: "Atual",
            corBadge: "bg-[#fff112]/20 text-[#8c6f00] border-[#cca300]/25",
            corHover: "hover:border-[#cca300]/30 hover:shadow-yellow-100",
            corGradient: "from-[#cca300] to-[#665200]",
            corHoverShadow: "group-hover:shadow-[#cca300]/15",
            corTextoAccent: "text-[#cca300]",
            corTextoHover: "group-hover:text-[#cca300]",
            icone: Sparkles,
            destaque: true,
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 80, damping: 18 } }
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen font-['Montserrat',sans-serif] text-slate-800">
            <PageHeader
                title="Portal da Transparência"
                subtitle={`Selecione o período de prestação de contas e gestão administrativa que deseja consultar em ${MUNICIPIO.nome}/${MUNICIPIO.uf}.`}
                variant="premium"
                icon={<Landmark className="text-white" size={32} />}
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Transparência" }
                ]}
            />

            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-40 pb-32">
                {/* Intro compliance panel */}
                <motion.div 
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100 mb-16"
                >
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="max-w-3xl">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-650 block mb-2">Controle Social Ativo</span>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none mb-6">
                                Transparência Pública <span className="text-slate-400 italic">Unificada</span>
                            </h2>
                            <p className="text-slate-500 font-semibold text-sm leading-relaxed">
                                Para assegurar a clareza e conformidade legal (Lei de Acesso à Informação nº 12.527/2011), as informações governamentais de {MUNICIPIO.nome} estão organizadas de acordo com o período do mandato administrativo. Escolha a gestão abaixo para ter acesso aos módulos de receitas, despesas, pessoal, licitações e contratos.
                            </p>
                        </div>
                        <div className="flex items-center gap-4 px-6 py-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 shrink-0 max-w-sm">
                            <ShieldCheck className="text-indigo-650 shrink-0" size={32} />
                            <p className="text-[10px] font-bold text-indigo-950 uppercase tracking-widest leading-relaxed">
                                Em conformidade com as metas do Programa Nacional de Transparência Pública (PNTP).
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* 3 Period Cards Grid */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {periodos.map((p) => {
                        const Icone = p.icone;
                        return (
                            <motion.div
                                key={p.id}
                                variants={itemVariants}
                                whileHover={{ y: -12, transition: { duration: 0.4 } }}
                                className="h-full"
                            >
                                <Link 
                                    href={p.href}
                                    className={`group flex flex-col h-full bg-white rounded-[3.5rem] border border-slate-100 shadow-[0_12px_45px_-15px_rgba(0,0,0,0.04)] hover:shadow-[0_35px_65px_-15px_rgba(30,41,59,0.12)] transition-all duration-500 relative overflow-hidden ${p.corHover}`}
                                >
                                    {/* Card Header visual gradient background */}
                                    <div className={`h-32 bg-gradient-to-br ${p.corGradient} relative p-8 flex items-start justify-between`}>
                                        <div className="absolute inset-0 bg-slate-950/10 backdrop-blur-[2px]" />
                                        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 group-hover:scale-150 transition-all duration-1000">
                                            <Icone size={120} strokeWidth={1} />
                                        </div>
                                        <span className={`relative z-10 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-inner backdrop-blur-md ${
                                            p.destaque 
                                                ? "bg-emerald-500/25 border-emerald-400/30 text-emerald-100" 
                                                : "bg-white/20 border-white/20 text-white"
                                        }`}>
                                            {p.badge}
                                        </span>
                                        {p.destaque && (
                                            <span className="relative z-10 px-4 py-1.5 bg-indigo-500/30 backdrop-blur-md rounded-xl text-[9px] font-black uppercase tracking-widest text-indigo-100 border border-indigo-400/20 shadow-sm animate-pulse">
                                                GESTÃO VIGENTE
                                            </span>
                                        )}
                                    </div>

                                    {/* Icon badge floating */}
                                    <div className="absolute top-20 left-8 transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-105">
                                        <div className={`w-16 h-16 bg-white rounded-2xl shadow-xl shadow-slate-200/50 flex items-center justify-center border border-slate-50 ${p.corHoverShadow} transition-all`}>
                                            <Icone className={`text-slate-900 ${p.corTextoHover} transition-colors`} size={28} />
                                        </div>
                                    </div>

                                    {/* Card content */}
                                    <div className="px-8 pt-10 pb-8 flex flex-col flex-grow bg-white">
                                        <h3 className={`text-2xl font-black text-slate-900 ${p.corTextoHover} transition-colors tracking-tighter leading-none mb-2 mt-4 uppercase`}>
                                            {p.titulo}
                                        </h3>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 leading-relaxed">
                                            {p.subtitulo}
                                        </h4>
                                        <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-12 grow">
                                            {p.desc}
                                        </p>

                                        {/* Action link */}
                                        <div className="pt-6 border-t border-slate-50 mt-auto flex items-center justify-between">
                                            <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${p.corTextoAccent} opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500`}>
                                                ACESSAR PORTAL
                                            </span>
                                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-950 transition-all duration-500 group-hover:rotate-[360deg] shadow-inner">
                                                <ArrowRight size={18} className="text-slate-400 group-hover:text-white transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Additional Info / Compliance footer */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-16 bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col md:flex-row items-center gap-4 text-center md:text-left"
                >
                    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
                        <Info size={20} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                        Algumas páginas institucionais locais e canais de contato (como Fale Conosco, Ouvidoria e E-SIC) permanecem integrados localmente e acessíveis em todos os períodos selecionados.
                    </p>
                </motion.div>
            </div>

            {/* Hub Footer - Ultra Premium */}
            <div className="relative py-24 overflow-hidden bg-slate-950 border-t border-slate-900">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-650/10 rounded-full blur-[120px]" />
                </div>
                
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <Landmark className="text-white" size={40} />
                                <div className="h-8 w-px bg-white/15" />
                                <div className="text-left">
                                    <div className="text-white font-black text-md uppercase tracking-[0.25em] leading-none mb-1">Portal da Transparência</div>
                                    <div className="text-white/30 text-[9px] uppercase font-bold tracking-[0.2em]">{MUNICIPIO.nome} - {MUNICIPIO.uf}</div>
                                </div>
                            </div>
                            <h4 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase mb-6 leading-tight italic">
                                Transparência Ativa e <br/> <span className="text-cyan-400">Controle Social do Cidadão.</span>
                            </h4>
                            <p className="text-white/40 text-[10px] font-semibold uppercase tracking-[0.2em] leading-relaxed max-w-lg mb-8 italic border-l border-white/10 pl-6">
                                Em cumprimento à Lei Federal nº 12.527/2011 (Lei de Acesso à Informação) e ao Programa Nacional de Transparência Pública, garantimos a integridade e atualização dos atos oficiais municipais.
                            </p>
                        </div>

                        <div className="bg-white/5 rounded-[2.5rem] p-10 border border-white/5 backdrop-blur-md relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                                <ShieldCheck size={140} className="text-white" />
                            </div>
                            <h5 className="text-[10px] font-black text-white uppercase tracking-[0.25em] mb-8 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Certificações de Acesso
                            </h5>
                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { label: "ACERVO DIGITAL", val: MUNICIPIO.email.split("@")[1] },
                                    { label: "RADAR PNTP", val: "SELO DIAMANTE" },
                                    { label: "AUDITOR", val: "TCE/RN" },
                                    { label: "TIPO DADOS", val: "DADOS ABERTOS" },
                                ].map((stat) => (
                                    <div key={stat.label} className="border-l border-white/10 pl-5 group/stat cursor-default">
                                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-0.5 group-hover/stat:text-cyan-400 transition-colors">{stat.label}</p>
                                        <p className="text-[11px] font-black text-white/50 group-hover/stat:text-white transition-colors uppercase tracking-widest">{stat.val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-white/20 text-[9px] font-bold uppercase tracking-[0.25em]">
                            © {new Date().getFullYear()} PREFEITURA DE {MUNICIPIO.nome.toUpperCase()}/{MUNICIPIO.uf} • CNPJ: {MUNICIPIO.cnpj}
                        </p>
                        <div className="flex gap-8">
                            {["Privacidade", "Termos", "Ouvidoria"].map(l => (
                                <Link key={l} href="#" className="text-white/20 hover:text-white transition-colors text-[8px] font-black uppercase tracking-widest">{l}</Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
