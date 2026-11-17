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
        <div className="min-h-screen bg-[#f4fbff]">
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
                            <h2 className="font-heading text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-[#01b0ef]/10 text-[#01b0ef] border border-[#01b0ef]/25 flex items-center justify-center shrink-0">
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
                            <div className="absolute top-0 left-0 right-0 h-1.5 heraldic-stripe" />
                            <h2 className="font-heading font-bold text-slate-500 uppercase tracking-wider text-xs mb-6">
                                Identificação do Gestor da Pasta
                            </h2>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                <div className="w-20 h-20 bg-[#01b0ef]/10 border border-[#01b0ef]/25 rounded-2xl flex items-center justify-center text-[#01b0ef] shrink-0">
                                    <UserCheck size={36} />
                                </div>
                                <div>
                                    <span className="inline-block px-3 py-0.5 rounded-full bg-[#fdb913] text-slate-900 text-xs font-extrabold mb-2">
                                        Secretário(a) Municipal
                                    </span>
                                    <h3 className="font-heading text-2xl font-extrabold text-slate-900 mb-2">
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
                                <h2 className="font-heading text-xl font-extrabold text-slate-900 mb-6">
                                    Carta de Serviços da Pasta
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                    {servicos.map((s: string, i: number) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-3 p-4 bg-[#f4fbff] border border-[#01b0ef]/20 rounded-2xl"
                                        >
                                            <CheckCircle2
                                                size={18}
                                                className="text-[#01b0ef] shrink-0 mt-0.5"
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
                        <div className="bg-gradient-to-br from-[#01b0ef] to-[#0096ce] rounded-3xl p-8 text-white shadow-civic-xl relative overflow-hidden border-b-4 border-[#fdb913]">
                            <h3 className="font-heading text-xl font-extrabold mb-6">
                                Atendimento Presencial e Digital
                            </h3>

                            <div className="space-y-5">
                                <div className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 bg-[#fdb913] rounded-xl flex items-center justify-center shrink-0 text-slate-900">
                                        <Phone size={17} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                                            Telefone de Contato
                                        </p>
                                        <p className="font-mono font-bold text-sm mt-0.5">
                                            {secretaria.telefone || "(84) 99211-5922"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 bg-[#fdb913] rounded-xl flex items-center justify-center shrink-0 text-slate-900">
                                        <Mail size={17} />
                                    </div>
                                    <div className="break-all">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                                            E-mail Institucional
                                        </p>
                                        <p className="font-semibold text-sm mt-0.5">
                                            {secretaria.email || "ouvidoria@saotome.rn.gov.br"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 bg-[#fdb913] rounded-xl flex items-center justify-center shrink-0 text-slate-900">
                                        <Clock size={17} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                                            Horário de Atendimento
                                        </p>
                                        <p className="font-semibold text-sm mt-0.5">
                                            {secretaria.horarioFuncionamento ||
                                                "07h às 13h (Segunda a Sexta)"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 bg-[#fdb913] rounded-xl flex items-center justify-center shrink-0 text-slate-900">
                                        <MapPin size={17} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                                            Endereço
                                        </p>
                                        <p className="text-sm font-semibold leading-snug mt-0.5">
                                            {secretaria.endereco ||
                                                "Praça Antônio Assunção, s/n, Centro – São Tomé/RN"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/25">
                                <Link
                                    href="/servicos/ouvidoria"
                                    className="w-full inline-flex items-center justify-center gap-2 bg-[#fdb913] hover:brightness-105 text-slate-900 py-3.5 px-5 rounded-xl font-bold text-xs transition-all shadow-sm"
                                >
                                    <Headset size={16} />
                                    <span>Registrar Manifestação na Ouvidoria</span>
                                </Link>
                            </div>
                        </div>

                        {secretaria.noticias && secretaria.noticias.length > 0 && (
                            <div className="p-7 bg-white rounded-3xl border border-slate-200/80 shadow-civic-sm">
                                <h4 className="font-heading text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                                    <Newspaper size={18} className="text-[#01b0ef]" />
                                    <span>Notícias Relacionadas</span>
                                </h4>
                                <div className="space-y-4 divide-y divide-slate-100">
                                    {secretaria.noticias.map((n: any) => (
                                        <Link
                                            key={n.id}
                                            href={`/noticias/${n.slug}`}
                                            className="block group pt-4 first:pt-0"
                                        >
                                            <p className="text-[11px] font-mono font-bold text-[#01b0ef] mb-1">
                                                {n.publicadoEm
                                                    ? new Date(n.publicadoEm).toLocaleDateString(
                                                          "pt-BR"
                                                      )
                                                    : "Recente"}
                                            </p>
                                            <h5 className="font-bold text-sm text-slate-800 group-hover:text-[#01b0ef] leading-snug transition-colors line-clamp-2">
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
