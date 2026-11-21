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
    FileText,
    ArrowRight,
    Scale,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSecretariaIcon } from "@/lib/icons";
import { getSecretariaShortSummary } from "@/lib/portal-links";

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

    let servicosJson: string[] = [];
    try {
        const parsed = JSON.parse(secretaria.servicos || "[]");
        if (Array.isArray(parsed)) {
            servicosJson = parsed.filter((s) => typeof s === "string" && s.trim().length > 0);
        }
    } catch (e) {
        console.error("Erro ao parsear serviços:", e);
    }

    const IconHeader = getSecretariaIcon(secretaria.nome);
    const resumoCurto = getSecretariaShortSummary(secretaria);

    const telefoneExibicao = secretaria.telefone?.trim() || "(84) 99211-5922";
    const enderecoExibicao =
        secretaria.endereco?.trim() || "Praça Antônio Assunção, s/n, Centro – São Tomé/RN";
    const horarioExibicao =
        secretaria.horarioFuncionamento?.trim() || "07h às 13h (Segunda a Sexta-feira)";
    const emailExibicao = secretaria.email?.trim() || "ouvidoria@saotome.rn.gov.br";
    const responsavelExibicao = secretaria.secretario?.trim() || "Titular em atualização";

    return (
        <div className="min-h-screen bg-[#f4fbff]">
            <PageHeader
                title={secretaria.nome}
                subtitle={resumoCurto}
                variant="premium"
                icon={<IconHeader className="w-8 h-8" />}
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Secretarias", href: "/secretarias" },
                    { label: secretaria.nome },
                ]}
            />

            <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10 md:py-14 pb-24 space-y-10">
                {/* 1. PRIMEIRO BLOCO: Telefone, Endereço, Horário e Responsável */}
                <section
                    aria-labelledby="atendimento-responsavel-heading"
                    className="bg-white rounded-3xl border border-slate-200 shadow-civic-md overflow-hidden"
                >
                    <div className="h-1.5 w-full heraldic-stripe" aria-hidden="true" />
                    <div className="p-6 sm:p-8 space-y-7">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
                            <div>
                                <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-[#00557d] mb-1">
                                    Atendimento ao Cidadão
                                </span>
                                <h2
                                    id="atendimento-responsavel-heading"
                                    className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900"
                                >
                                    Canais, Endereço, Horário e Responsável
                                </h2>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                                <Link
                                    href="/servicos/ouvidoria"
                                    className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-xl bg-[#fdb913] hover:bg-[#e5a60d] text-slate-950 font-bold text-xs shadow-2xs transition-colors"
                                >
                                    <Headset size={15} aria-hidden="true" />
                                    <span>Registrar manifestação</span>
                                </Link>
                                <Link
                                    href="/servicos/esic"
                                    className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-xl bg-[#f4fbff] hover:bg-[#e8f6fd] text-[#00557d] border border-slate-300 font-bold text-xs transition-colors"
                                >
                                    <FileText size={15} aria-hidden="true" />
                                    <span>Solicitar informação (e-SIC)</span>
                                </Link>
                            </div>
                        </div>

                        {/* Grade prioritária: Telefone, Endereço, Horário, E-mail e Responsável */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {/* Telefone */}
                            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#f8fafc] border border-slate-200/90">
                                <div className="w-11 h-11 rounded-xl bg-[#e8f6fd] text-[#00557d] flex items-center justify-center shrink-0">
                                    <Phone size={20} aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Telefone
                                    </p>
                                    <p className="font-mono font-bold text-base text-slate-900 mt-0.5">
                                        {telefoneExibicao}
                                    </p>
                                </div>
                            </div>

                            {/* Endereço */}
                            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#f8fafc] border border-slate-200/90">
                                <div className="w-11 h-11 rounded-xl bg-[#e8f6fd] text-[#00557d] flex items-center justify-center shrink-0">
                                    <MapPin size={20} aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Endereço de Atendimento
                                    </p>
                                    <p className="font-semibold text-sm text-slate-900 leading-snug mt-0.5">
                                        {enderecoExibicao}
                                    </p>
                                </div>
                            </div>

                            {/* Horário */}
                            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#fffdf5] border border-[#fdb913]/60">
                                <div className="w-11 h-11 rounded-xl bg-[#fdb913] text-slate-950 flex items-center justify-center shrink-0">
                                    <Clock size={20} aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                                        Horário de Funcionamento
                                    </p>
                                    <p className="font-bold text-sm text-slate-900 mt-0.5">
                                        {horarioExibicao}
                                    </p>
                                </div>
                            </div>

                            {/* Responsável */}
                            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#f8fafc] border border-slate-200/90 sm:col-span-2 lg:col-span-2">
                                <div className="w-11 h-11 rounded-xl bg-[#e8f6fd] text-[#00557d] flex items-center justify-center shrink-0">
                                    <UserCheck size={20} aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Responsável pela Pasta (Secretário/a)
                                    </p>
                                    <p className="font-heading font-extrabold text-base text-slate-900 mt-0.5">
                                        {responsavelExibicao}
                                    </p>
                                </div>
                            </div>

                            {/* E-mail */}
                            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#f8fafc] border border-slate-200/90">
                                <div className="w-11 h-11 rounded-xl bg-[#e8f6fd] text-[#00557d] flex items-center justify-center shrink-0">
                                    <Mail size={20} aria-hidden="true" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        E-mail Oficial
                                    </p>
                                    <p className="font-semibold text-sm text-slate-900 break-all mt-0.5">
                                        {emailExibicao}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. SEGUNDO BLOCO: Serviços da Secretaria */}
                <section
                    aria-labelledby="servicos-secretaria-heading"
                    className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-civic-sm"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                        <div>
                            <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-[#00557d] mb-1">
                                Carta de Serviços ao Cidadão
                            </span>
                            <h2
                                id="servicos-secretaria-heading"
                                className="font-heading text-xl font-extrabold text-slate-900"
                            >
                                Serviços e Atendimentos da Pasta
                            </h2>
                        </div>
                        <Link
                            href="/transparencia/carta-servicos"
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#00557d] hover:underline"
                        >
                            <span>Ver Carta de Serviços completa</span>
                            <ArrowRight size={15} aria-hidden="true" />
                        </Link>
                    </div>

                    {servicosJson.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {servicosJson.map((s, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-3 p-4 bg-[#f8fafc] border border-slate-200 rounded-2xl"
                                >
                                    <CheckCircle2
                                        size={18}
                                        className="text-[#006494] shrink-0 mt-0.5"
                                        aria-hidden="true"
                                    />
                                    <span className="text-sm font-semibold text-slate-800">
                                        {s}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-200 text-sm text-slate-700">
                            O atendimento desta secretaria é realizado presencialmente na sede da pasta ({enderecoExibicao}) no horário de {horarioExibicao}, ou pelos canais digitais da Carta de Serviços do Município.
                        </div>
                    )}
                </section>

                {/* 3. SEÇÃO PRÓPRIA: Competências Administrativas Completas */}
                <section
                    aria-labelledby="competencias-secretaria-heading"
                    className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-civic-sm"
                >
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                        <span className="w-10 h-10 rounded-xl bg-[#e8f6fd] text-[#00557d] flex items-center justify-center shrink-0">
                            <Scale size={20} aria-hidden="true" />
                        </span>
                        <div>
                            <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
                                Estrutura Organizacional e Legal
                            </span>
                            <h2
                                id="competencias-secretaria-heading"
                                className="font-heading text-xl font-extrabold text-slate-900"
                            >
                                Competências Administrativas Completas
                            </h2>
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none text-slate-700 text-base leading-relaxed whitespace-pre-line">
                        {secretaria.descricao ||
                            "Órgão responsável pelo planejamento, coordenação e execução das políticas públicas setoriais do Município de São Tomé."}
                    </div>
                </section>

                {/* 4. Notícias Relacionadas (quando existirem) */}
                {secretaria.noticias && secretaria.noticias.length > 0 && (
                    <section
                        aria-labelledby="noticias-secretaria-heading"
                        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-civic-sm"
                    >
                        <h2
                            id="noticias-secretaria-heading"
                            className="font-heading text-lg font-extrabold text-slate-900 mb-5 flex items-center gap-2"
                        >
                            <Newspaper size={18} className="text-[#006494]" aria-hidden="true" />
                            <span>Publicações Relacionadas à Pasta</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {secretaria.noticias.map((n) => (
                                <Link
                                    key={n.id}
                                    href={`/noticias/${n.slug}`}
                                    className="group p-4 rounded-2xl bg-[#f8fafc] hover:bg-[#e8f6fd]/60 border border-slate-200 hover:border-[#006494] transition-colors"
                                >
                                    <p className="text-xs font-mono font-bold text-[#00557d] mb-1">
                                        {n.publicadoEm
                                            ? new Date(n.publicadoEm).toLocaleDateString("pt-BR")
                                            : "Publicação recente"}
                                    </p>
                                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#00557d] leading-snug line-clamp-2">
                                        {n.titulo}
                                    </h3>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
