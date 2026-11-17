import Link from "next/link";
import {
    Wallet,
    Landmark,
    BookOpenCheck,
    Mail,
    ExternalLink,
    ArrowUpRight,
    Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

const acessosBase = [
    {
        label: "Contracheque Online",
        desc: "Consulta de holerites e comprovantes de rendimentos dos servidores.",
        icon: Wallet,
        href: "/transparencia/servidores",
        id: "home-contracheque",
        accent: "text-primary-400 bg-primary-500/15 border-primary-400/20 group-hover:bg-primary-500 group-hover:text-white",
    },
    {
        label: "Portal do Contribuinte",
        desc: "Emissão de DAM, certidões negativas, alvarás e nota fiscal eletrônica.",
        icon: Landmark,
        href: "/transparencia/receitas",
        id: "home-contribuinte",
        accent: "text-secondary-400 bg-secondary-500/15 border-secondary-400/20 group-hover:bg-secondary-500 group-hover:text-[#071E3D]",
    },
    {
        label: "Diário Oficial",
        desc: "Publicações legais, decretos, portarias e atos administrativos oficiais.",
        icon: BookOpenCheck,
        href: "/transparencia/legislacao",
        id: "home-diario",
        accent: "text-emerald-400 bg-emerald-500/15 border-emerald-400/20 group-hover:bg-emerald-500 group-hover:text-white",
    },
    {
        label: "Webmail Institucional",
        desc: "Acesso seguro ao correio eletrônico oficial dos órgãos municipais.",
        icon: Mail,
        href: "/contato",
        id: "home-webmail",
        accent: "text-sky-300 bg-sky-500/15 border-sky-400/20 group-hover:bg-sky-500 group-hover:text-white",
    },
];

export default async function AcessoRapido() {
    let linksExternos: any[] = [];
    try {
        linksExternos = await (prisma as any).linkExterno.findMany({
            where: { ativo: true, moduloAlvo: { startsWith: "home-" } },
        });
    } catch (e) {
        console.error("Erro ao carregar linksExternos em AcessoRapido:", e);
    }

    return (
        <section
            className="bg-[#071E3D] py-20 relative overflow-hidden border-y border-white/10"
            aria-labelledby="acesso-rapido-titulo"
        >
            <div className="absolute inset-0 civic-grid-dark opacity-60 pointer-events-none" />
            <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-primary-500/15 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-secondary-500/10 blur-3xl pointer-events-none" />

            <div className="max-w-[1240px] mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-secondary-400 text-xs font-bold">
                            <Sparkles size={13} />
                            <span>Autoatendimento Digital</span>
                        </div>
                        <h2
                            id="acesso-rapido-titulo"
                            className="font-heading text-3xl md:text-4xl font-extrabold text-white tracking-tight"
                        >
                            Sistemas e Acesso Rápido
                        </h2>
                    </div>
                    <p className="text-slate-300 text-sm max-w-md">
                        Acesso direto às plataformas eletrônicas de serviços para servidores, contribuintes e cidadãos.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {acessosBase.map((item, index) => {
                        const override = linksExternos.find(
                            (l: any) =>
                                l.moduloAlvo?.toLowerCase() === item.id.toLowerCase()
                        );
                        const finalHref = override && override.url ? override.url : item.href;
                        const isExternal = !!override;

                        return (
                            <Link
                                key={index}
                                href={finalHref}
                                target={isExternal ? "_blank" : undefined}
                                rel={isExternal ? "noopener noreferrer" : undefined}
                                className="group flex flex-col justify-between p-6 bg-white/[0.06] hover:bg-white/[0.11] rounded-2xl border border-white/10 hover:border-white/25 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-md"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <div
                                            className={`w-12 h-12 ${item.accent} border rounded-xl flex items-center justify-center transition-all duration-300 relative`}
                                        >
                                            <item.icon size={22} strokeWidth={1.8} />
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:text-[#071E3D] transition-all">
                                            {isExternal ? (
                                                <ExternalLink size={13} />
                                            ) : (
                                                <ArrowUpRight size={15} />
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="font-heading font-bold text-white text-base mb-1.5 group-hover:text-secondary-400 transition-colors">
                                        {item.label}
                                    </h3>
                                    <p className="text-slate-300/80 text-xs leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>

                                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-slate-300 group-hover:text-white">
                                    <span>{isExternal ? "Portal Integrado" : "Acessar módulo"}</span>
                                    <span className="font-mono text-secondary-400">→</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
