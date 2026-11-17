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
        color: "text-primary-600",
        bg: "bg-primary-50 border-primary-100",
        hoverBg: "group-hover:bg-primary-600 group-hover:border-primary-600",
    },
    {
        label: "Unidades de Saúde",
        desc: "UBS, atendimento médico, escalas e farmácia",
        icon: HeartPulse,
        href: "/unidades-de-saude",
        color: "text-rose-600",
        bg: "bg-rose-50 border-rose-100",
        hoverBg: "group-hover:bg-rose-600 group-hover:border-rose-600",
    },
    {
        label: "Rede Socioassistencial",
        desc: "CRAS, CadÚnico, acolhimento e programas",
        icon: HandHeart,
        href: "/socioassistencial",
        color: "text-violet-600",
        bg: "bg-violet-50 border-violet-100",
        hoverBg: "group-hover:bg-violet-600 group-hover:border-violet-600",
    },
    {
        label: "Unidades Escolares",
        desc: "Escolas municipais, creches e ensino infantil",
        icon: GraduationCap,
        href: "/unidades-escolares",
        color: "text-amber-600",
        bg: "bg-amber-50 border-amber-100",
        hoverBg: "group-hover:bg-amber-500 group-hover:border-amber-500",
    },
    {
        label: "Cultura e Esporte",
        desc: "Equipamentos culturais, eventos e juventude",
        icon: Palette,
        href: "/servicos/cultura",
        color: "text-emerald-600",
        bg: "bg-emerald-50 border-emerald-100",
        hoverBg: "group-hover:bg-emerald-600 group-hover:border-emerald-600",
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
                        <MapPinned size={14} className="text-primary-600" />
                        <span>Rede Pública Municipal</span>
                    </div>
                    <h2 id="unidades-titulo" className="section-title mb-3">
                        Unidades de Atendimento ao Cidadão
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
                            className="group flex flex-col justify-between p-6 bg-[#F6F9FC] hover:bg-white rounded-2xl border border-slate-200/80 hover:border-primary-300 hover:shadow-civic-lg transition-all duration-300 hover:-translate-y-1"
                        >
                            <div>
                                <div
                                    className={`w-14 h-14 ${item.bg} ${item.color} ${item.hoverBg} group-hover:text-white border rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 shadow-xs`}
                                >
                                    <item.icon size={26} strokeWidth={1.8} />
                                </div>
                                <h3 className="font-heading font-bold text-[#071E3D] group-hover:text-primary-600 text-base leading-snug mb-1.5 transition-colors">
                                    {item.label}
                                </h3>
                                <p className="text-slate-500 text-xs leading-relaxed mb-5">
                                    {item.desc}
                                </p>
                            </div>

                            <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:text-primary-600">
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
