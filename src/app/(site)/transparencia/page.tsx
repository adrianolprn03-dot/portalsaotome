"use client";

import Link from "next/link";
import { Landmark, Calendar, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";

export default function TransparenciaSelectionPage() {
    const portais = [
        {
            titulo: "Portal da Transparência",
            ano: "2018 a 2022",
            desc: "Acesse os dados, contratos, receitas e despesas referentes à gestão de 2018 a 2022.",
            href: "/transparencia-2018-2022",
            cor: "from-blue-600 to-indigo-800",
            iconeCor: "text-blue-500",
            badge: "HISTÓRICO"
        },
        {
            titulo: "Portal da Transparência",
            ano: "2023 a 2025",
            desc: "Acesse os dados, contratos, receitas e despesas referentes à gestão de 2023 a 2025.",
            href: "/transparencia-2023-2025",
            cor: "from-emerald-600 to-teal-800",
            iconeCor: "text-emerald-500",
            badge: "HISTÓRICO RECENTE"
        },
        {
            titulo: "Portal da Transparência",
            ano: "2026",
            desc: "Acesse os dados atualizados em tempo real do exercício atual.",
            href: "/transparencia-2026",
            cor: "from-orange-600 to-red-800",
            iconeCor: "text-orange-500",
            badge: "ATUAL"
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    const itemVariants = {
        hidden: { y: 40, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen font-['Montserrat',sans-serif]">
            <PageHeader
                title="Selecione o Exercício"
                subtitle="Escolha o período do Portal da Transparência que você deseja consultar."
                variant="premium"
                icon={<Landmark className="text-white" size={32} />}
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Transparência" }
                ]}
            />

            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-40 pb-32">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {portais.map((portal) => (
                        <motion.div key={portal.ano} variants={itemVariants}>
                            <Link
                                href={portal.href}
                                className="group relative flex flex-col h-full bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-15px_rgba(51,65,85,0.15)] transition-all duration-700 overflow-hidden"
                            >
                                {/* Header Visual */}
                                <div className={`h-32 bg-gradient-to-br ${portal.cor} relative p-8 flex flex-col items-start justify-center overflow-hidden`}>
                                    <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]" />
                                    <div className="absolute top-1/2 -translate-y-1/2 right-0 p-6 opacity-0 group-hover:opacity-10 group-hover:scale-150 transition-all duration-1000">
                                        <Landmark size={140} strokeWidth={1} className="text-white" />
                                    </div>
                                    <span className="relative z-10 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-white border border-white/20 shadow-sm mb-2">
                                        {portal.badge}
                                    </span>
                                    <h2 className="relative z-10 text-white font-black text-3xl tracking-tighter">
                                        {portal.ano}
                                    </h2>
                                </div>

                                <div className="px-8 pt-8 pb-8 flex flex-col flex-1">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tighter leading-none mb-4 uppercase">
                                        {portal.titulo}
                                    </h3>
                                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-relaxed mb-10 opacity-80 grow">
                                        {portal.desc}
                                    </p>

                                    <div className="pt-6 border-t border-slate-50 mt-auto flex items-center justify-between">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${portal.iconeCor} opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500`}>
                                            ACESSAR PORTAL
                                        </span>
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 transition-all duration-500 group-hover:rotate-[360deg] shadow-inner group-hover:shadow-xl group-hover:shadow-slate-900/30">
                                            <ArrowRight size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Footer Message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6 justify-center text-center md:text-left"
                >
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                        <ShieldCheck className="text-emerald-600" size={32} />
                    </div>
                    <div>
                        <h4 className="text-slate-900 font-black uppercase tracking-widest text-sm mb-2">Transparência Garantida</h4>
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">
                            Todos os portais seguem rigorosamente as normas do Tribunal de Contas e a Lei de Acesso à Informação.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
