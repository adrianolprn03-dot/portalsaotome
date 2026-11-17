import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { getSecretariaIcon } from "@/lib/icons";
import {
    Building2,
    Download,
    Maximize2,
    ArrowRight,
    UserCheck,
    Network,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Estrutura Administrativa (Organograma) | São Tomé – RN",
    description:
        "Conheça o organograma e a estrutura de governança da Prefeitura Municipal de São Tomé/RN.",
};

export default async function EstruturaPage() {
    const secretarias = await prisma.secretaria.findMany({
        orderBy: { nome: "asc" },
    });

    return (
        <div className="min-h-screen bg-[#F6F9FC]">
            <PageHeader
                title="Estrutura Administrativa"
                subtitle="Organograma hierárquico e distribuição das pastas que compõem a gestão do município."
                variant="premium"
                icon={<Network className="w-8 h-8" />}
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "O Município", href: "/a-prefeitura" },
                    { label: "Estrutura Administrativa" },
                ]}
            />

            <div className="max-w-[1240px] mx-auto px-6 py-14 pb-24 relative z-10 w-full space-y-16">
                {/* Organograma Visual */}
                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-civic-sm border border-slate-200/80 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 heraldic-stripe" />
                    <div className="flex flex-col items-center mb-8">
                        <span className="section-eyebrow mb-3">
                            <Network size={14} />
                            <span>Esquema Hierárquico Oficial</span>
                        </span>
                        <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-[#071E3D] tracking-tight">
                            Organograma da Prefeitura Municipal
                        </h2>
                        <p className="text-slate-600 text-sm mt-2 max-w-xl">
                            Representação gráfica da divisão hierárquica e das relações de coordenação entre os órgãos do Poder Executivo de São Tomé/RN.
                        </p>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 bg-[#F6F9FC] p-3 md:p-6 group/image">
                        <img
                            src="/organograma.png"
                            alt="Organograma Oficial da Prefeitura de São Tomé/RN"
                            className="w-full h-auto object-contain rounded-xl shadow-xs transition-transform duration-500 group-hover/image:scale-[1.01]"
                        />
                    </div>

                    <div className="flex flex-wrap justify-center gap-3.5 mt-8">
                        <a
                            href="/organograma.png"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary"
                        >
                            <Maximize2 size={16} />
                            <span>Ampliar Organograma</span>
                        </a>
                        <a
                            href="/organograma.png"
                            download="organograma-prefeitura-sao-tome.png"
                            className="btn-outline"
                        >
                            <Download size={16} />
                            <span>Baixar Imagem (PNG)</span>
                        </a>
                    </div>
                </div>

                {/* Secretarias e Setores Detalhados */}
                <div>
                    <div className="flex flex-col items-center mb-10 text-center">
                        <span className="section-eyebrow mb-3">
                            <Building2 size={14} />
                            <span>Administração Direta</span>
                        </span>
                        <h3 className="font-heading font-extrabold text-2xl md:text-3xl text-[#071E3D]">
                            Órgãos e Secretarias Municipais
                        </h3>
                        <p className="text-slate-600 text-sm mt-2 max-w-xl">
                            Selecione uma pasta para consultar suas competências legais, equipe gestora, endereço e horários de funcionamento.
                        </p>
                    </div>

                    {secretarias.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <p className="text-slate-500 font-medium">
                                Nenhuma secretaria cadastrada no momento.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {secretarias.map((sec: any) => {
                                const IconCard = getSecretariaIcon(sec.nome);

                                return (
                                    <Link
                                        key={sec.id}
                                        href={`/secretarias/${sec.slug}`}
                                        className="group bg-white rounded-2xl border border-slate-200/80 shadow-civic-sm p-6 hover:-translate-y-1 hover:border-primary-400 hover:shadow-civic-lg transition-all duration-300 flex items-start gap-4"
                                    >
                                        <div className="w-11 h-11 bg-primary-50 border border-primary-100 text-primary-600 rounded-xl group-hover:bg-primary-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                                            <IconCard size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-heading font-bold text-[#071E3D] text-sm leading-snug group-hover:text-primary-600 transition-colors">
                                                {sec.nome}
                                            </h4>
                                            {sec.secretario && (
                                                <p className="text-xs text-slate-500 font-medium mt-1.5 flex items-center gap-1.5 truncate">
                                                    <UserCheck size={13} className="text-primary-600 shrink-0" />
                                                    <span className="truncate">{sec.secretario}</span>
                                                </p>
                                            )}
                                        </div>
                                        <ArrowRight
                                            size={15}
                                            className="text-slate-300 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-1"
                                        />
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
