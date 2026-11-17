import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { MUNICIPIO } from "@/config/municipio";
import {
    BookOpen,
    Users,
    Landmark,
    CalendarDays,
    MapPin,
    Phone,
    Mail,
    Clock,
    ArrowRight,
    Building2,
} from "lucide-react";

export const metadata: Metadata = {
    title: "A Prefeitura | Prefeitura Municipal de São Tomé – RN",
};

const cardsInstitucionais = [
    {
        icon: BookOpen,
        badge: "Patrimônio & Memória",
        titulo: "História da Cidade",
        desc: "Conheça a história, as origens culturais e a formação política de São Tomé no Rio Grande do Norte.",
        href: "/a-prefeitura/historia",
    },
    {
        icon: Users,
        badge: "Poder Executivo",
        titulo: "Prefeito e Vice-Prefeito",
        desc: "Conheça o chefe do poder executivo e o vice-prefeito municipal, suas atribuições e compromissos de gestão.",
        href: "/a-prefeitura/prefeito",
    },
    {
        icon: Landmark,
        badge: "Governança",
        titulo: "Estrutura Administrativa",
        desc: "Consulte o organograma oficial, secretarias, setores e competências legais de cada órgão municipal.",
        href: "/a-prefeitura/estrutura",
    },
    {
        icon: CalendarDays,
        badge: "Compromissos Públicos",
        titulo: "Agenda do Executivo",
        desc: "Acompanhe os compromissos oficiais, audiências públicas e agenda institucional da gestão municipal.",
        href: "/a-prefeitura/agenda",
    },
];

export default function APrefeituraPage() {
    return (
        <div className="min-h-screen bg-[#F6F9FC]">
            <PageHeader
                title="A Prefeitura Municipal"
                subtitle="Identificação institucional, estrutura de governança e história do Município de São Tomé – RN."
                variant="premium"
                icon={<Building2 className="w-8 h-8" />}
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "A Prefeitura" },
                ]}
            />

            <div className="max-w-[1240px] mx-auto px-6 py-14 pb-24 space-y-12">
                {/* Card de Dados Institucionais da Sede */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-civic-sm overflow-hidden">
                    <div className="h-1.5 w-full heraldic-stripe" />
                    <div className="p-8 md:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="flex items-start sm:items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-[#071E3D] text-secondary-400 flex items-center justify-center shrink-0 shadow-sm">
                                <Landmark size={30} />
                            </div>
                            <div>
                                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-primary-50 text-primary-700 text-xs font-mono font-bold mb-1.5">
                                    CNPJ: {MUNICIPIO.cnpj} • IBGE: {MUNICIPIO.ibge}
                                </div>
                                <h2 className="font-heading text-2xl font-extrabold text-[#071E3D]">
                                    {MUNICIPIO.nomeCompleto}
                                </h2>
                                <p className="text-slate-500 text-sm mt-0.5">
                                    Sede do Poder Executivo Municipal de {MUNICIPIO.nome}/{MUNICIPIO.uf}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:border-l lg:border-slate-200 lg:pl-8 text-xs">
                            <div className="flex items-start gap-2.5 text-slate-600">
                                <MapPin size={16} className="text-primary-600 shrink-0 mt-0.5" />
                                <div>
                                    <span className="block font-bold text-slate-800">Endereço da Sede</span>
                                    <span>{MUNICIPIO.endereco} – CEP {MUNICIPIO.cep}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-2.5 text-slate-600">
                                <Clock size={16} className="text-primary-600 shrink-0 mt-0.5" />
                                <div>
                                    <span className="block font-bold text-slate-800">Horário de Expediente</span>
                                    <span>Segunda a Sexta, {MUNICIPIO.horario}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-2.5 text-slate-600">
                                <Phone size={16} className="text-primary-600 shrink-0 mt-0.5" />
                                <div>
                                    <span className="block font-bold text-slate-800">Telefone Oficial</span>
                                    <span className="font-mono">{MUNICIPIO.telefone}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-2.5 text-slate-600">
                                <Mail size={16} className="text-primary-600 shrink-0 mt-0.5" />
                                <div>
                                    <span className="block font-bold text-slate-800">E-mail Institucional</span>
                                    <span>{MUNICIPIO.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cards de Navegação Institucional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cardsInstitucionais.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="group bg-white rounded-3xl p-7 border border-slate-200/80 hover:border-primary-400 shadow-civic-sm hover:shadow-civic-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="w-12 h-12 rounded-2xl bg-primary-50 border border-primary-100 text-primary-600 group-hover:bg-primary-600 group-hover:text-white flex items-center justify-center transition-colors">
                                            <Icon size={24} />
                                        </div>
                                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                                            {item.badge}
                                        </span>
                                    </div>
                                    <h3 className="font-heading text-xl font-bold text-[#071E3D] group-hover:text-primary-600 transition-colors mb-2">
                                        {item.titulo}
                                    </h3>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                        {item.desc}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-primary-600">
                                    <span>Acessar seção institucional</span>
                                    <ArrowRight
                                        size={15}
                                        className="group-hover:translate-x-1 transition-transform"
                                    />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
