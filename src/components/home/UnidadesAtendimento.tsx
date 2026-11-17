"use client";
import Link from "next/link";
import {
    Building2,
    HeartPulse,
    HandHeart,
    GraduationCap,
    Palette,
    ArrowRight,
    MapPinned,
} from "lucide-react";

const unidades = [
    {
        label: "Secretarias Municipais",
        desc: "Pastas administrativas, gestores e atendimento",
        icon: Building2,
        href: "/secretarias",
        color: "text-[#01b0ef]",
        bg: "bg-[#01b0ef]/10 border-[#01b0ef]/25",
        hoverBg: "group-hover:bg-[#01b0ef] group-hover:border-[#01b0ef] group-hover:text-white",
    },
    {
        label: "Unidades de Saúde",
        desc: "UBS, atendimento médico, escalas e farmácia",
        icon: HeartPulse,
        href: "/unidades-de-saude",
        color: "text-slate-900",
        bg: "bg-[#fdb913]/20 border-[#fdb913]/50",
        hoverBg: "group-hover:bg-[#fdb913] group-hover:border-[#fdb913] group-hover:text-slate-900",
    },
    {
        label: "Rede Socioassistencial",
        desc: "CRAS, CadÚnico, acolhimento e programas",
        icon: HandHeart,
        href: "/socioassistencial",
        color: "text-[#01b0ef]",
        bg: "bg-[#01b0ef]/10 border-[#01b0ef]/25",
        hoverBg: "group-hover:bg-[#01b0ef] group-hover:border-[#01b0ef] group-hover:text-white",
    },
    {
        label: "Unidades Escolares",
        desc: "Escolas municipais, creches e ensino infantil",
        icon: GraduationCap,
        href: "/unidades-escolares",
        color: "text-slate-900",
        bg: "bg-[#fdb913]/20 border-[#fdb913]/50",
        hoverBg: "group-hover:bg-[#fdb913] group-hover:border-[#fdb913] group-hover:text-slate-900",
    },
    {
        label: "Cultura e Esporte",
        desc: "Equipamentos culturais, eventos e juventude",
        icon: Palette,
        href: "/servicos/cultura",
        color: "text-[#01b0ef]",
        bg: "bg-[#01b0ef]/10 border-[#01b0ef]/25",
        hoverBg: "group-hover:bg-[#01b0ef] group-hover:border-[#01b0ef] group-hover:text-white",
    },
];

export default function UnidadesAtendimento() {
    return (
        <section
            className="bg-white py-20 border-b border-slate-200/80"
            aria-labelledby="unidades-titulo"
        >
            <div className="max-w-[1240px] mx-auto px-6">
                <div className="flex flex-col items-center mb-14 text-center max-w-2xl mx-auto">
                    <div className="section-eyebrow mb-3">
                        <MapPinned size={14} className="text-[#01b0ef]" />
                        <span>Rede Pública Municipal</span>
                    </div>
                    <h2 id="unidades-titulo" className="section-title mb-3">
                        Unidades de <span className="text-[#01b0ef]">Atendimento</span> ao Cidadão
                    </h2>
                    <p className="section-subtitle text-sm sm:text-base">
                        Consulte endereços, horários de funcionamento, profissionais e serviços ofertados em cada equipamento público de São Tomé.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                    {unidades.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className="group flex flex-col justify-between p-6 bg-[#f4fbff] hover:bg-white rounded-2xl border border-[#01b0ef]/20 hover:border-[#01b0ef] hover:shadow-civic-lg transition-all duration-300 hover:-translate-y-1"
                        >
                            <div>
                                <div
                                    className={`w-14 h-14 ${item.bg} ${item.color} ${item.hoverBg} border rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 shadow-xs`}
                                >
                                    <item.icon size={26} strokeWidth={1.8} />
                                </div>
                                <h3 className="font-heading font-bold text-slate-900 group-hover:text-[#01b0ef] text-base leading-snug mb-1.5 transition-colors">
                                    {item.label}
                                </h3>
                                <p className="text-slate-600 text-xs leading-relaxed mb-5">
                                    {item.desc}
                                </p>
                            </div>

                            <div className="pt-3 border-t border-[#01b0ef]/15 flex items-center justify-between text-xs font-bold text-[#01b0ef]">
                                <span>Consultar</span>
                                <ArrowRight
                                    size={14}
                                    className="group-hover:translate-x-1 transition-transform"
                                />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
