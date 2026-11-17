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
        accent: "text-[#01b0ef] bg-[#01b0ef]/10 border-[#01b0ef]/20 group-hover:bg-[#01b0ef] group-hover:text-white",
    },
    {
        label: "Portal do Contribuinte",
        desc: "Emissão de DAM, certidões negativas, alvarás e nota fiscal eletrônica.",
        icon: Landmark,
        href: "/transparencia/receitas",
        id: "home-contribuinte",
        accent: "text-slate-900 bg-[#fdb913]/25 border-[#fdb913]/50 group-hover:bg-[#fdb913] group-hover:text-slate-900",
    },
    {
        label: "Diário Oficial",
        desc: "Publicações legais, decretos, portarias e atos administrativos oficiais.",
        icon: BookOpenCheck,
        href: "/transparencia/legislacao",
        id: "home-diario",
        accent: "text-[#01b0ef] bg-[#01b0ef]/10 border-[#01b0ef]/20 group-hover:bg-[#01b0ef] group-hover:text-white",
    },
    {
        label: "Webmail Institucional",
        desc: "Acesso seguro ao correio eletrônico oficial dos órgãos municipais.",
        icon: Mail,
        href: "/contato",
        id: "home-webmail",
        accent: "text-slate-900 bg-[#fdb913]/25 border-[#fdb913]/50 group-hover:bg-[#fdb913] group-hover:text-slate-900",
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
            className="bg-gradient-to-br from-[#01b0ef] via-[#1dc0fa] to-[#0098d4] py-20 relative overflow-hidden border-y-4 border-[#fdb913]"
            aria-labelledby="acesso-rapido-titulo"
        >
            <div className="absolute inset-0 civic-grid-light opacity-60 pointer-events-none" />
            <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-white/15 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#fdb913]/20 blur-3xl pointer-events-none" />

            <div className="max-w-[1240px] mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fdb913] text-slate-900 text-xs font-extrabold shadow-xs">
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
                    <p className="text-white/95 text-sm max-w-md font-medium">
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
                                className="group flex flex-col justify-between p-6 bg-white rounded-2xl border-2 border-white hover:border-[#fdb913] shadow-civic-lg hover:-translate-y-1.5 transition-all duration-300"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <div
                                            className={`w-12 h-12 ${item.accent} border rounded-xl flex items-center justify-center transition-all duration-300 relative`}
                                        >
                                            <item.icon size={22} strokeWidth={1.8} />
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-[#01b0ef]/10 text-[#01b0ef] group-hover:bg-[#01b0ef] group-hover:text-white flex items-center justify-center transition-all">
                                            {isExternal ? (
                                                <ExternalLink size={13} />
                                            ) : (
                                                <ArrowUpRight size={15} />
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="font-heading font-bold text-slate-900 text-base mb-1.5 group-hover:text-[#01b0ef] transition-colors">
                                        {item.label}
                                    </h3>
                                    <p className="text-slate-600 text-xs leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>

                                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#01b0ef]">
                                    <span>{isExternal ? "Portal Integrado" : "Acessar módulo"}</span>
                                    <span className="font-mono text-[#fdb913] text-sm">→</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
