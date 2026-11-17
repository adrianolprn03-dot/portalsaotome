import Link from "next/link";
import {
    ShieldCheck,
    FileSearch,
    Headset,
    Building2,
    ArrowUpRight,
    ArrowRight,
    ExternalLink,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

const servicos = [
    {
        index: "01",
        label: "Portal da Transparência",
        desc: "Acompanhe receitas, despesas, licitações, contratos e atos oficiais em tempo real.",
        href: "/transparencia",
        icon: ShieldCheck,
        badge: "PNTP 2026",
        iconBg: "bg-[#01b0ef]/10 text-[#01b0ef] group-hover:bg-[#01b0ef] group-hover:text-white",
        badgeClass: "bg-[#fdb913] text-slate-900 border-[#fdb913]",
    },
    {
        index: "02",
        label: "e-SIC • Acesso à Informação",
        desc: "Solicite informações públicas eletronicamente com protocolo e acompanhamento pela LAI.",
        href: "/servicos/esic",
        icon: FileSearch,
        badge: "Lei 12.527/11",
        iconBg: "bg-[#01b0ef]/10 text-[#01b0ef] group-hover:bg-[#01b0ef] group-hover:text-white",
        badgeClass: "bg-[#01b0ef]/10 text-[#01b0ef] border-[#01b0ef]/25",
    },
    {
        index: "03",
        label: "Ouvidoria Municipal",
        desc: "Canal direto para sugestões, elogios, solicitações, reclamações e denúncias.",
        href: "/servicos/ouvidoria",
        icon: Headset,
        badge: "Lei 13.460/17",
        iconBg: "bg-[#fdb913]/20 text-slate-900 group-hover:bg-[#fdb913] group-hover:text-slate-900",
        badgeClass: "bg-[#fdb913]/25 text-slate-900 border-[#fdb913]/50",
    },
    {
        index: "04",
        label: "Secretarias e Órgãos",
        desc: "Consulte a estrutura administrativa, atribuições, gestores, endereços e horários.",
        href: "/secretarias",
        icon: Building2,
        badge: "Institucional",
        iconBg: "bg-[#01b0ef]/10 text-[#01b0ef] group-hover:bg-[#01b0ef] group-hover:text-white",
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    },
];

export default async function ServicosRapidos() {
    let linksExternos: any[] = [];
    try {
        linksExternos = await (prisma as any).linkExterno.findMany({
            where: { ativo: true, moduloAlvo: { startsWith: "home-" } },
        });
    } catch (e) {
        console.error("Erro ao carregar linksExternos em ServicosRapidos:", e);
    }

    return (
        <section
            className="py-12 md:py-16 bg-[#f4fbff] border-b border-[#01b0ef]/15 relative z-10"
            id="servicos"
            aria-labelledby="servicos-titulo"
        >
            <div className="max-w-[1240px] mx-auto px-6">
                <h2 id="servicos-titulo" className="sr-only">
                    Principais Canais de Atendimento e Transparência
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {servicos.map((s, idx) => {
                        const Icon = s.icon;
                        const identifier = s.href.includes("esic")
                            ? "home-esic"
                            : s.href.includes("ouvidoria")
                            ? "home-ouvidoria"
                            : s.href === "/transparencia"
                            ? "home-transparencia"
                            : s.href === "/secretarias"
                            ? "home-secretarias"
                            : "";

                        const override = linksExternos.find(
                            (l: any) =>
                                l.moduloAlvo?.toLowerCase() === identifier.toLowerCase()
                        );
                        const finalHref = override && override.url ? override.url : s.href;
                        const isExternal = !!override;

                        return (
                            <Link
                                key={idx}
                                href={finalHref}
                                target={isExternal ? "_blank" : undefined}
                                rel={isExternal ? "noopener noreferrer" : undefined}
                                className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-[#01b0ef] shadow-civic-sm hover:shadow-civic-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 right-0 h-1 bg-[#01b0ef]/20 group-hover:heraldic-stripe transition-all" />

                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <div
                                            className={`w-12 h-12 ${s.iconBg} rounded-xl flex items-center justify-center transition-all duration-300 shadow-xs relative`}
                                        >
                                            <Icon size={22} strokeWidth={1.8} />
                                            {isExternal && (
                                                <div className="absolute -top-1.5 -right-1.5 bg-[#01b0ef] text-white p-1 rounded-md shadow border border-white">
                                                    <ExternalLink size={9} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${s.badgeClass}`}
                                            >
                                                {s.badge}
                                            </span>
                                            <span className="font-mono text-xs font-bold text-slate-300 group-hover:text-[#01b0ef]">
                                                {s.index}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="font-heading font-bold text-slate-900 text-base group-hover:text-[#01b0ef] transition-colors leading-snug mb-2">
                                        {s.label}
                                    </h3>
                                    <p className="text-slate-600 text-xs leading-relaxed mb-6">
                                        {s.desc}
                                    </p>
                                </div>

                                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-600 group-hover:text-[#01b0ef] transition-colors">
                                        {isExternal ? "Acessar sistema" : "Acessar canal"}
                                    </span>
                                    <div className="w-7 h-7 rounded-full bg-[#01b0ef]/10 group-hover:bg-[#01b0ef] text-[#01b0ef] group-hover:text-white flex items-center justify-center transition-all group-hover:translate-x-0.5">
                                        {isExternal ? (
                                            <ArrowUpRight size={14} />
                                        ) : (
                                            <ArrowRight size={14} />
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
}
