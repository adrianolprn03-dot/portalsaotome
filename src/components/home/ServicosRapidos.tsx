import Link from "next/link";
import { HiOutlineMagnifyingGlassCircle, HiOutlineClipboardDocumentCheck, HiOutlineReceiptPercent, HiOutlineIdentification } from "react-icons/hi2";
import { prisma } from "@/lib/prisma";
import { FaExternalLinkAlt } from "react-icons/fa";

const servicos = [
    {
        label: "Portal da Transparência",
        desc: "Acompanhe as contas públicas e atos oficiais.",
        href: "/transparencia",
        icon: HiOutlineClipboardDocumentCheck,
        color: "text-primary-500",
        bgColor: "bg-primary-50",
        accentColor: "border-t-primary-500",
        hoverGlow: "hover:shadow-primary-200/60",
    },
    {
        label: "E-SIC",
        desc: "Solicite informações públicas eletronicamente.",
        href: "/servicos/esic",
        icon: HiOutlineMagnifyingGlassCircle,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        accentColor: "border-t-emerald-500",
        hoverGlow: "hover:shadow-emerald-200/60",
    },
    {
        label: "Ouvidoria",
        desc: "Envie sugestões, reclamações ou elogios.",
        href: "/servicos/ouvidoria",
        icon: HiOutlineIdentification,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        accentColor: "border-t-amber-500",
        hoverGlow: "hover:shadow-amber-200/60",
    },
    {
        label: "Secretarias",
        desc: "Conheça os órgãos e gestores municipais.",
        href: "/secretarias",
        icon: HiOutlineReceiptPercent,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
        accentColor: "border-t-indigo-500",
        hoverGlow: "hover:shadow-indigo-200/60",
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
        <section className="py-12 bg-white border-b border-gray-100 relative z-10" id="servicos" aria-labelledby="servicos-titulo">
            <div className="max-w-[1240px] mx-auto px-6">

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {servicos.map((s, idx) => {
                        const Icon = s.icon;
                        const identifier =
                            s.href.includes("esic") ? "home-esic" :
                            s.href.includes("ouvidoria") ? "home-ouvidoria" :
                            s.href === "/transparencia" ? "home-transparencia" :
                            s.href === "/secretarias" ? "home-secretarias" : "";

                        const override = linksExternos.find((l: any) =>
                            l.moduloAlvo?.toLowerCase() === identifier.toLowerCase()
                        );
                        const finalHref = (override && override.url) ? override.url : s.href;
                        const isExternal = !!override;

                        return (
                            <Link
                                key={idx}
                                href={finalHref}
                                target={isExternal ? "_blank" : undefined}
                                rel={isExternal ? "noopener noreferrer" : undefined}
                                className={`group flex flex-col p-6 rounded-2xl bg-white border border-gray-100 border-t-4 ${s.accentColor} shadow-md ${s.hoverGlow} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                            >
                                <div className={`w-11 h-11 ${s.bgColor} ${s.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 relative`}>
                                    <Icon size={22} strokeWidth={1.5} />
                                    {isExternal && (
                                        <div className="absolute -top-2 -right-2 bg-primary-500 text-white p-1 rounded-md shadow-lg border-2 border-white">
                                            <FaExternalLinkAlt size={9} />
                                        </div>
                                    )}
                                </div>

                                <h3 className="font-black text-[#002241] text-sm uppercase tracking-tight mb-1.5 group-hover:text-primary-600 transition-colors leading-tight">
                                    {s.label}
                                </h3>
                                <p className="text-gray-500 font-medium text-xs leading-relaxed mb-4 flex-1">
                                    {s.desc}
                                </p>
                                <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${s.color} py-1.5 px-3 bg-gray-50 group-hover:bg-primary-500 group-hover:text-white rounded-full w-fit transition-all duration-300`}>
                                    {isExternal ? "Portal Externo" : "Acessar"} <span className="text-sm">→</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}
