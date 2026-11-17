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
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Secretarias Municipais | Prefeitura de São Tomé",
    description:
        "Conheça as secretarias da Prefeitura de São Tomé, seus gestores, contatos e serviços ofertados ao cidadão.",
};

export default async function SecretariasPage() {
    const secretarias = await prisma.secretaria.findMany({
        orderBy: { nome: "asc" },
    });

    return (
        <div className="min-h-screen bg-[#F6F9FC]">
            <PageHeader
                title="Secretarias Municipais"
                subtitle="Estrutura organizacional, gestores, contatos e serviços dedicados à população de São Tomé."
                variant="premium"
                icon={<Building2 className="w-8 h-8" />}
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Secretarias" },
                ]}
            />

            <div className="max-w-[1240px] mx-auto px-6 py-14 pb-24 relative z-10 w-full">
                {secretarias.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <p className="text-slate-500 font-medium">
                            Nenhuma secretaria cadastrada no momento.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {secretarias.map((s: any) => {
                            const IconCard = getSecretariaIcon(s.nome);

                            return (
                                <Link
                                    key={s.id}
                                    href={`/secretarias/${s.slug}`}
                                    className="group bg-white rounded-3xl overflow-hidden shadow-civic-sm hover:shadow-civic-xl transition-all duration-300 border border-slate-200/80 hover:border-primary-400 flex flex-col h-full hover:-translate-y-0.5"
                                >
                                    {/* Header Institucional do Card */}
                                    <div className="bg-gradient-to-r from-[#071E3D] via-[#093158] to-primary-800 p-7 text-white relative overflow-hidden border-b-2 border-secondary-500">
                                        <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                                            <IconCard size={110} />
                                        </div>

                                        <div className="flex items-start gap-5 relative z-10">
                                            <div className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shrink-0 text-secondary-400">
                                                <IconCard size={26} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h2 className="font-heading text-lg md:text-xl font-extrabold tracking-tight leading-snug text-white">
                                                    {s.nome}
                                                </h2>
                                                {s.secretario && (
                                                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/15 text-slate-100 text-xs font-semibold mt-2.5">
                                                        <UserCheck
                                                            size={14}
                                                            className="text-secondary-400 shrink-0"
                                                        />
                                                        <span className="truncate">
                                                            Titular: {s.secretario}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Corpo do Card */}
                                    <div className="p-7 space-y-6 flex-grow bg-white">
                                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                                            {s.descricao ||
                                                "Órgão integrante da administração direta municipal responsável pela execução de políticas públicas setoriais."}
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                                            {s.telefone && (
                                                <div className="flex items-start gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-50 text-primary-600 flex items-center justify-center shrink-0 border border-slate-200/70">
                                                        <Phone size={15} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                            Telefone
                                                        </span>
                                                        <span className="block text-slate-800 font-semibold font-mono text-xs truncate">
                                                            {s.telefone}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {s.email && (
                                                <div className="flex items-start gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-50 text-primary-600 flex items-center justify-center shrink-0 border border-slate-200/70">
                                                        <Mail size={15} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                            E-mail Oficial
                                                        </span>
                                                        <span className="block text-slate-800 font-semibold text-xs truncate">
                                                            {s.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {s.horarioFuncionamento && (
                                                <div className="flex items-start gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-50 text-primary-600 flex items-center justify-center shrink-0 border border-slate-200/70">
                                                        <Clock size={15} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                            Expediente
                                                        </span>
                                                        <span className="block text-slate-800 font-semibold text-xs">
                                                            {s.horarioFuncionamento}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {s.endereco && (
                                                <div className="flex items-start gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-50 text-primary-600 flex items-center justify-center shrink-0 border border-slate-200/70">
                                                        <MapPin size={15} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                            Localização
                                                        </span>
                                                        <span className="block text-slate-800 font-semibold text-xs leading-snug line-clamp-2">
                                                            {s.endereco}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer do Card */}
                                    <div className="px-7 py-4 bg-[#F6F9FC] border-t border-slate-200/70 flex items-center justify-between">
                                        <span className="text-xs font-bold text-primary-700 group-hover:text-primary-600">
                                            Ver atribuições, equipe e serviços
                                        </span>
                                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 group-hover:bg-primary-600 group-hover:border-primary-600 group-hover:text-white transition-all group-hover:translate-x-0.5">
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
