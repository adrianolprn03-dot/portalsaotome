import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
    Building2,
    UserCheck,
    Phone,
    Mail,
    Clock,
    MapPin,
    ArrowRight,
} from "lucide-react";
import { getSecretariaIcon } from "@/lib/icons";
import {
    getSecretariaLinkLabel,
    getSecretariaShortSummary,
} from "@/lib/portal-links";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Secretarias Municipais | Prefeitura de São Tomé",
    description:
        "Conheça as secretarias da Prefeitura de São Tomé, seus gestores, contatos, horários e serviços ofertados ao cidadão.",
};

export default async function SecretariasPage() {
    const secretarias = await prisma.secretaria.findMany({
        where: { ativa: true },
        orderBy: { nome: "asc" },
    });

    return (
        <div className="min-h-screen bg-[#f4fbff]">
            <PageHeader
                title="Secretarias Municipais"
                subtitle="Estrutura organizacional, gestores, endereços, horários e serviços dedicados à população de São Tomé."
                variant="premium"
                icon={<Building2 className="w-8 h-8" />}
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Secretarias" },
                ]}
            />

            <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-12 pb-24 relative z-10 w-full">
                {secretarias.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                        <p className="text-slate-600 font-medium">
                            Nenhuma secretaria cadastrada no momento.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {secretarias.map((s) => {
                            const IconCard = getSecretariaIcon(s.nome);
                            const resumoCurto = getSecretariaShortSummary(s);
                            const linkLabel = getSecretariaLinkLabel(s.nome);

                            return (
                                <article
                                    key={s.id}
                                    className="bg-white rounded-3xl overflow-hidden shadow-civic-sm hover:shadow-civic-md transition-all border border-slate-200 hover:border-[#006494] flex flex-col h-full"
                                >
                                    {/* Cabeçalho Institucional do Card */}
                                    <div className="bg-gradient-to-r from-[#00557d] via-[#006494] to-[#0077b0] p-6 sm:p-7 text-white relative overflow-hidden border-b-4 border-[#fdb913]">
                                        <div className="flex items-start gap-4 relative z-10">
                                            <div className="w-13 h-13 bg-[#fdb913] rounded-2xl flex items-center justify-center shrink-0 text-slate-950 shadow-sm">
                                                <IconCard size={24} aria-hidden="true" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h2 className="font-heading text-lg md:text-xl font-extrabold tracking-tight leading-snug text-white">
                                                    {s.nome}
                                                </h2>
                                                {s.secretario && (
                                                    <div className="inline-flex items-center gap-2 bg-white text-slate-900 px-3 py-1 rounded-lg text-xs font-bold mt-2 shadow-2xs">
                                                        <UserCheck
                                                            size={14}
                                                            className="text-[#006494] shrink-0"
                                                            aria-hidden="true"
                                                        />
                                                        <span className="truncate">
                                                            Responsável: {s.secretario}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Corpo do Card */}
                                    <div className="p-6 sm:p-7 space-y-5 flex-grow bg-white">
                                        <p className="text-slate-700 text-base leading-relaxed">
                                            {resumoCurto}
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                                            {s.telefone && (
                                                <div className="flex items-start gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-[#e8f6fd] text-[#00557d] flex items-center justify-center shrink-0">
                                                        <Phone size={15} aria-hidden="true" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                            Telefone
                                                        </span>
                                                        <span className="block text-slate-900 font-semibold font-mono text-xs truncate">
                                                            {s.telefone}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {s.horarioFuncionamento && (
                                                <div className="flex items-start gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-[#fff8e1] text-slate-900 flex items-center justify-center shrink-0 border border-[#fdb913]/50">
                                                        <Clock size={15} aria-hidden="true" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                            Horário
                                                        </span>
                                                        <span className="block text-slate-900 font-semibold text-xs">
                                                            {s.horarioFuncionamento}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {s.endereco && (
                                                <div className="flex items-start gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-[#e8f6fd] text-[#00557d] flex items-center justify-center shrink-0">
                                                        <MapPin size={15} aria-hidden="true" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                            Endereço
                                                        </span>
                                                        <span className="block text-slate-900 font-semibold text-xs leading-snug line-clamp-2">
                                                            {s.endereco}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {s.email && (
                                                <div className="flex items-start gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-[#e8f6fd] text-[#00557d] flex items-center justify-center shrink-0">
                                                        <Mail size={15} aria-hidden="true" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                            E-mail Oficial
                                                        </span>
                                                        <span className="block text-slate-900 font-semibold text-xs truncate">
                                                            {s.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Rodapé com Link de Nome Acessível Curto */}
                                    <div className="px-6 sm:px-7 py-4 bg-[#f8fafc] border-t border-slate-200/80 flex items-center justify-between">
                                        <Link
                                            href={`/secretarias/${s.slug}`}
                                            className="inline-flex items-center gap-2 text-sm font-bold text-[#00557d] hover:text-[#003d5b] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00557d] rounded"
                                        >
                                            <span>{linkLabel}</span>
                                            <ArrowRight size={15} aria-hidden="true" />
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
