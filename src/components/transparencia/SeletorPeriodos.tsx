"use client";

import Link from "next/link";
import { History, Sparkles, CheckCircle2, ExternalLink, ArrowRight } from "lucide-react";
import {
    PORTAL_2018_2022_DEFAULT_URL,
    resolvePortalUrl,
    type LinkExternoResumo,
} from "@/config/portais-periodos";

interface SeletorPeriodosProps {
    periodoAtivo: "2018-2022" | "2023-2025" | "atual" | "2026";
    linksExternos?: LinkExternoResumo[];
}

export default function SeletorPeriodos({
    periodoAtivo,
    linksExternos,
}: SeletorPeriodosProps) {
    const ativoNormalizado = periodoAtivo === "2026" ? "atual" : periodoAtivo;
    const url2018 = resolvePortalUrl(
        linksExternos,
        "portal-2018-2022",
        PORTAL_2018_2022_DEFAULT_URL
    );

    const periodos = [
        {
            id: "2018-2022" as const,
            label: "2018 a 2022",
            sublabel: "Governo Transparente (Externo)",
            href: url2018,
            isExternal: true,
            badge: "Histórico",
            icon: History,
            activeStyle:
                "bg-[#fdb913] text-slate-900 border-transparent shadow-lg shadow-[#fdb913]/25",
            activeIconBg: "bg-slate-900 text-[#fdb913]",
            activeSubtext: "text-slate-900/80",
            activeBadge: "bg-slate-900 text-[#fdb913] border-transparent",
        },
        {
            id: "2023-2025" as const,
            label: "2023 a 2025",
            sublabel: "Portal Anterior • TopSolutions",
            href: "/transparencia-2023-2025",
            isExternal: false,
            badge: "Histórico",
            icon: History,
            activeStyle:
                "bg-gradient-to-r from-[#01b0ef] to-[#0098d4] text-white border-transparent shadow-lg shadow-[#01b0ef]/25",
            activeIconBg: "bg-white/20 text-white",
            activeSubtext: "text-sky-100",
            activeBadge: "bg-[#fdb913] text-slate-900 border-transparent",
        },
        {
            id: "atual" as const,
            label: "2026 em diante",
            sublabel: "Portal Atual • PNTP 2026",
            href: "/transparencia",
            isExternal: false,
            badge: "Atual",
            icon: Sparkles,
            activeStyle:
                "bg-gradient-to-r from-[#01b0ef] to-[#0098d4] text-white border-transparent shadow-lg shadow-[#01b0ef]/25",
            activeIconBg: "bg-[#fdb913] text-slate-900",
            activeSubtext: "text-sky-100",
            activeBadge: "bg-[#fdb913] text-slate-900 border-transparent",
        },
    ];

    return (
        <section
            aria-label="Seleção de períodos do Portal da Transparência"
            className="bg-white rounded-[24px] p-4 sm:p-5 border border-sky-100 shadow-gov"
        >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="shrink-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#01b0ef]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#01b0ef]">
                            Portais por Período de Gestão
                        </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-black font-heading text-slate-900 tracking-tight leading-tight">
                        Selecione o período que deseja consultar
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full lg:max-w-3xl">
                    {periodos.map((p) => {
                        const isActive = ativoNormalizado === p.id;
                        const Icone = p.icon;

                        const cardClasses = `group relative flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 ${
                            isActive
                                ? p.activeStyle
                                : "bg-[#f4fbff] hover:bg-white border-sky-100 hover:border-[#01b0ef]/40 text-slate-900 hover:shadow-md"
                        }`;

                        const cardContent = (
                            <>
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${
                                        isActive
                                            ? p.activeIconBg
                                            : "bg-[#e6f8ff] text-[#01b0ef] group-hover:bg-[#01b0ef] group-hover:text-white"
                                    }`}
                                >
                                    <Icone size={18} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-xs font-black tracking-tight">
                                            {p.label}
                                        </span>
                                        <span
                                            className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                                isActive
                                                    ? p.activeBadge
                                                    : p.id === "atual"
                                                      ? "bg-[#fff4d4] text-slate-900 border-[#fdb913]/40"
                                                      : "bg-white text-[#01b0ef] border-[#01b0ef]/25"
                                            }`}
                                        >
                                            {p.badge}
                                        </span>
                                    </div>
                                    <span
                                        className={`text-[10px] font-semibold mt-0.5 block truncate ${
                                            isActive ? p.activeSubtext : "text-slate-600"
                                        }`}
                                    >
                                        {p.sublabel}
                                    </span>
                                </div>

                                <div className="shrink-0">
                                    {isActive ? (
                                        <CheckCircle2 size={15} className="opacity-90" />
                                    ) : p.isExternal ? (
                                        <ExternalLink
                                            size={14}
                                            className="text-slate-400 group-hover:text-[#01b0ef] transition-colors"
                                        />
                                    ) : (
                                        <ArrowRight
                                            size={14}
                                            className="text-slate-400 group-hover:text-[#01b0ef] transition-colors"
                                        />
                                    )}
                                </div>
                            </>
                        );

                        if (p.isExternal) {
                            return (
                                <a
                                    key={p.id}
                                    href={p.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cardClasses}
                                >
                                    {cardContent}
                                </a>
                            );
                        }

                        return (
                            <Link key={p.id} href={p.href} className={cardClasses}>
                                {cardContent}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
