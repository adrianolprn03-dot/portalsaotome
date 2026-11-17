import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import {
    UserCheck,
    Phone,
    Mail,
    MapPin,
    Clock,
    Newspaper,
    CheckCircle2,
    Headset,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSecretariaIcon } from "@/lib/icons";

export default async function SecretariaDetalhesPage({
    params,
}: {
    params: { slug: string };
}) {
    const secretaria = await prisma.secretaria.findUnique({
        where: { slug: params.slug },
        include: {
            noticias: {
                where: { publicada: true },
                orderBy: { publicadoEm: "desc" },
                take: 3,
            },
        },
    });

    if (!secretaria) {
        notFound();
    }

    let servicos: string[] = [];
    try {
        servicos = JSON.parse(secretaria.servicos || "[]");
    } catch (e) {
        console.error("Erro ao parsear serviços:", e);
    }

    const IconHeader = getSecretariaIcon(secretaria.nome);

    return (
        <div className="min-h-screen bg-[#F6F9FC]">
            <PageHeader
                title={secretaria.nome}
                subtitle="Competências legais, identificação do gestor, serviços públicos ofertados e canais de atendimento."
                variant="premium"
                icon={<IconHeader className="w-8 h-8" />}
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Secretarias", href: "/secretarias" },
                    { label: secretaria.nome },
                ]}
            />

            <div className="max-w-[1240px] mx-auto px-6 py-14 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Coluna da Esquerda: Info e Gestor (8 cols) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Sobre a Secretaria */}
                        <section className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-civic-sm">
                            <h2 className="font-heading text-xl font-extrabold text-[#071E3D] mb-4 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 border border-primary-100 flex items-center justify-center shrink-0">
                                    <IconHeader size={20} />
                                </span>
                                Atribuições e Competências
                            </h2>
                            <p className="text-slate-600 text-base leading-relaxed whitespace-pre-line">
                                {secretaria.descricao ||
                                    "Órgão responsável pelo planejamento, coordenação e execução das políticas públicas setoriais do Município de São Tomé."}
                            </p>
                        </section>

                        {/* Estrutura de Gestão */}
                        <section className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-civic-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 heraldic-stripe" />
                            <h2 className="font-heading text-lg font-bold text-slate-500 uppercase tracking-wider text-xs mb-6">
                                Identificação do Gestor da Pasta
                            </h2>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                <div className="w-20 h-20 bg-primary-50 border border-primary-100 rounded-2xl flex items-center justify-center text-primary-600 shrink-0">
                                    <UserCheck size={36} />
                                </div>
                                <div>
                                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-secondary-100 text-secondary-800 text-xs font-bold mb-1.5">
                                        Secretário(a) Municipal
                                    </span>
                                    <h3 className="font-heading text-2xl font-extrabold text-[#071E3D] mb-2">
                                        {secretaria.secretario || "Informação em atualização"}
                                    </h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        Responsável pela direção superior da pasta, ordenação de ações administrativas e atendimento às demandas da população de São Tomé.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Serviços Oferecidos */}
                        {servicos.length > 0 && (
                            <section className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-civic-sm">
                                <h2 className="font-heading text-xl font-extrabold text-[#071E3D] mb-6">
                                    Carta de Serviços da Pasta
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                    {servicos.map((s: string, i: number) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-3 p-4 bg-[#F6F9FC] border border-slate-200/70 rounded-2xl"
                                        >
                                            <CheckCircle2
                                                size={18}
                                                className="text-primary-600 shrink-0 mt-0.5"
                                            />
                                            <span className="text-sm font-semibold text-slate-800">
                                                {s}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Coluna da Direita: Sidebar de Contato (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[#071E3D] rounded-3xl p-8 text-white shadow-civic-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1.5 heraldic-stripe" />
                            <h3 className="font-heading text-xl font-extrabold mb-6">
                                Atendimento Presencial e Digital
                            </h3>

                            <div className="space-y-5">
                                <div className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center shrink-0 text-secondary-400">
                                        <Phone size={17} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Telefone de Contato
                                        </p>
                                        <p className="font-mono font-bold text-sm mt-0.5">
                                            {secretaria.telefone || "(84) 99211-5922"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center shrink-0 text-secondary-400">
                                        <Mail size={17} />
                                    </div>
                                    <div className="break-all">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            E-mail Institucional
                                        </p>
                                        <p className="font-semibold text-sm mt-0.5">
                                            {secretaria.email || "ouvidoria@saotome.rn.gov.br"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center shrink-0 text-secondary-400">
                                        <Clock size={17} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Horário de Atendimento
                                        </p>
                                        <p className="font-semibold text-sm mt-0.5">
                                            {secretaria.horarioFuncionamento ||
                                                "07h às 13h (Segunda a Sexta)"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center shrink-0 text-secondary-400">
                                        <MapPin size={17} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Endereço
                                        </p>
                                        <p className="text-sm font-semibold leading-snug mt-0.5">
                                            {secretaria.endereco ||
                                                "Praça Antônio Assunção, s/n, Centro – São Tomé/RN"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10">
                                <Link
                                    href="/servicos/ouvidoria"
                                    className="w-full inline-flex items-center justify-center gap-2 bg-secondary-500 hover:bg-secondary-400 text-[#071E3D] py-3.5 px-5 rounded-xl font-bold text-xs transition-colors shadow-sm"
                                >
                                    <Headset size={16} />
                                    <span>Registrar Manifestação na Ouvidoria</span>
                                </Link>
                            </div>
                        </div>

                        {secretaria.noticias && secretaria.noticias.length > 0 && (
                            <div className="p-7 bg-white rounded-3xl border border-slate-200/80 shadow-civic-sm">
                                <h4 className="font-heading text-base font-bold text-[#071E3D] mb-5 flex items-center gap-2">
                                    <Newspaper size={18} className="text-primary-600" />
                                    <span>Notícias Relacionadas</span>
                                </h4>
                                <div className="space-y-4 divide-y divide-slate-100">
                                    {secretaria.noticias.map((n: any) => (
                                        <Link
                                            key={n.id}
                                            href={`/noticias/${n.slug}`}
                                            className="block group pt-4 first:pt-0"
                                        >
                                            <p className="text-[11px] font-mono font-semibold text-primary-600 mb-1">
                                                {n.publicadoEm
                                                    ? new Date(n.publicadoEm).toLocaleDateString(
                                                          "pt-BR"
                                                      )
                                                    : "Recente"}
                                            </p>
                                            <h5 className="font-bold text-sm text-slate-800 group-hover:text-primary-600 leading-snug transition-colors line-clamp-2">
                                                {n.titulo}
                                            </h5>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
