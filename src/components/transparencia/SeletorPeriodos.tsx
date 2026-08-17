"use client";

import Link from "next/link";
import { History, Sparkles, CheckCircle2 } from "lucide-react";

interface SeletorPeriodosProps {
    periodoAtivo: "2018-2022" | "2023-2025" | "2026";
}

export default function SeletorPeriodos({ periodoAtivo }: SeletorPeriodosProps) {
    const periodos = [
        {
            id: "2018-2022",
            label: "2018 a 2022",
            sublabel: "Gestão Anterior",
            href: "/transparencia-2018-2022",
            badge: "Histórico",
            corBadge: "bg-amber-100 text-amber-800 border-amber-200",
            activeColor: "bg-gradient-to-r from-amber-600 to-amber-700 text-white border-transparent shadow-xl shadow-amber-600/20",
            hoverBorder: "hover:border-amber-100",
            hoverIconBgText: "group-hover:bg-amber-50 group-hover:text-amber-650",
            icon: History,
        },
        {
            id: "2023-2025",
            label: "2023 a 2025",
            sublabel: "Gestão Anterior",
            href: "/transparencia-2023-2025",
            badge: "Histórico",
            corBadge: "bg-blue-100 text-blue-800 border-blue-200",
            activeColor: "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-transparent shadow-xl shadow-blue-600/20",
            hoverBorder: "hover:border-blue-100",
            hoverIconBgText: "group-hover:bg-blue-50 group-hover:text-blue-600",
            icon: History,
        },
        {
            id: "2026",
            label: "2026 em diante",
            sublabel: "Gestão Atual",
            href: "/transparencia-2026", // O portal geral mapeia 2026+
            badge: "Atual",
            corBadge: "bg-[#fff112]/20 text-[#8c6f00] border-[#cca300]/25",
            activeColor: "bg-gradient-to-r from-[#cca300] to-[#997a00] text-white border-transparent shadow-xl shadow-[#cca300]/25",
            hoverBorder: "hover:border-[#cca300]/30",
            hoverIconBgText: "group-hover:bg-[#fff112]/10 group-hover:text-[#cca300]",
            icon: Sparkles,
        },
    ];

    return (
        <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl shadow-slate-200/40 border border-slate-100/80 mb-12 max-w-7xl mx-auto relative z-40">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
                <div className="text-left shrink-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-650 animate-pulse" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-650">Linha do Tempo de Gestão</h4>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
                        Períodos de <span className="text-slate-400 italic">Transparência</span>
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 leading-relaxed">
                        Selecione o período de prestação de contas que deseja consultar
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:max-w-4xl">
                    {periodos.map((p) => {
                        const isActive = periodoAtivo === p.id;
                        const Icone = p.icon;

                        return (
                            <Link
                                key={p.id}
                                href={p.href}
                                className={`group relative flex items-center gap-4 p-4 rounded-[1.8rem] border transition-all duration-500 hover:-translate-y-1 ${
                                    isActive
                                        ? `${p.activeColor}`
                                        : `bg-slate-50/60 hover:bg-white border-slate-200/50 text-slate-700 hover:shadow-xl hover:shadow-slate-100 ${p.hoverBorder}`
                                }`}
                            >
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-105 ${
                                        isActive ? "bg-white/20 text-white" : `bg-slate-200/50 text-slate-500 ${p.hoverIconBgText}`
                                    }`}
                                >
                                    <Icone size={18} />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-black uppercase tracking-tight block">
                                            {p.label}
                                        </span>
                                        <span
                                            className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                                isActive
                                                    ? "bg-white/25 text-white border border-white/20"
                                                    : p.corBadge + " border"
                                            }`}
                                        >
                                            {p.badge}
                                        </span>
                                    </div>
                                    <span
                                        className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 block ${
                                            isActive ? "text-white/70" : "text-slate-400"
                                        }`}
                                    >
                                        {p.sublabel}
                                    </span>
                                </div>

                                {isActive && (
                                    <div className="absolute top-3.5 right-3.5 text-white">
                                        <CheckCircle2 size={12} className="opacity-80" />
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
