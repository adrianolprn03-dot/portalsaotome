import Link from "next/link";
import {
    Building2,
    HeartPulse,
    GraduationCap,
    HandHeart,
    Palette,
    ArrowRight,
    MapPinned,
    Clock,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
    getSecretariaAreaGroup,
    getSecretariaLinkLabel,
    getSecretariaShortSummary,
} from "@/lib/portal-links";

const REDE_UNIDADES = [
    {
        titulo: "Unidades de Saúde (UBS)",
        resumo: "Horários de atendimento, endereços, equipes médicas, vacinação e farmácia básica.",
        href: "/unidades-de-saude",
        acaoLabel: "Consultar unidades de saúde",
        icon: HeartPulse,
        destaque: true,
    },
    {
        titulo: "Escolas e Creches Municipais",
        resumo: "Unidades escolares da zona urbana e rural, etapas de ensino e matrículas.",
        href: "/unidades-escolares",
        acaoLabel: "Consultar unidades escolares",
        icon: GraduationCap,
        destaque: false,
    },
    {
        titulo: "Rede Socioassistencial (CRAS)",
        resumo: "CRAS, Cadastro Único, Serviço de Convivência e programas de assistência social.",
        href: "/socioassistencial",
        acaoLabel: "Consultar rede socioassistencial",
        icon: HandHeart,
        destaque: false,
    },
    {
        titulo: "Cultura, Esporte e Juventude",
        resumo: "Equipamentos culturais, ações esportivas, editais e eventos tradicionais.",
        href: "/servicos/cultura",
        acaoLabel: "Consultar cultura e esporte",
        icon: Palette,
        destaque: false,
    },
];

const AREA_ORDER = [
    "Atendimento ao Cidadão: Saúde, Educação e Assistência Social",
    "Serviços Urbanos, Desenvolvimento Rural e Tributos",
    "Gestão, Atendimento Institucional e Controle",
];

export default async function SecretariasUnidadesSection() {
    let secretarias: {
        id: string;
        nome: string;
        slug: string;
        resumoAtendimento: string | null;
        descricao: string | null;
        horarioFuncionamento: string | null;
        telefone: string | null;
    }[] = [];

    try {
        secretarias = await prisma.secretaria.findMany({
            where: { ativa: true },
            orderBy: { nome: "asc" },
            select: {
                id: true,
                nome: true,
                slug: true,
                resumoAtendimento: true,
                descricao: true,
                horarioFuncionamento: true,
                telefone: true,
            },
        });
    } catch (error) {
        console.error("Erro ao carregar secretarias na página inicial:", error);
    }

    // Deduplica por slug para evitar qualquer repetição
    const seenSlugs = new Set<string>();
    const uniqueSecretarias = secretarias.filter((sec) => {
        if (!sec.slug || seenSlugs.has(sec.slug)) return false;
        seenSlugs.add(sec.slug);
        return true;
    });

    const grouped = AREA_ORDER.map((area) => ({
        area,
        items: uniqueSecretarias.filter((sec) => getSecretariaAreaGroup(sec) === area),
    })).filter((g) => g.items.length > 0);

    return (
        <section
            className="bg-white py-12 md:py-16 border-b border-slate-200/80"
            aria-labelledby="secretarias-unidades-heading"
        >
            <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-10">
                {/* Cabeçalho da seção */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="max-w-2xl">
                        <div className="section-eyebrow">
                            <MapPinned size={14} className="text-[#006494]" aria-hidden="true" />
                            <span>Atendimento Presencial e Estrutura Municipal</span>
                        </div>
                        <h2 id="secretarias-unidades-heading" className="section-title">
                            Secretarias e Unidades de Atendimento
                        </h2>
                        <p className="text-slate-700 text-base mt-1.5 leading-relaxed">
                            Localize postos de saúde, escolas, CRAS e secretarias municipais com endereços, horários e canais de atendimento.
                        </p>
                    </div>

                    <Link
                        href="/secretarias"
                        className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#f4fbff] hover:bg-[#e8f6fd] text-[#00557d] border border-slate-300 hover:border-[#006494] font-bold text-sm transition-colors self-start md:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00557d] focus-visible:ring-offset-2"
                    >
                        <Building2 size={16} aria-hidden="true" />
                        <span>Ver todas as secretarias</span>
                        <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                </div>

                {/* Bloco 1: Rede de Unidades de Atendimento Direto */}
                <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 mb-3.5">
                        Equipamentos e Unidades de Atendimento ao Público
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {REDE_UNIDADES.map((unidade) => {
                            const Icon = unidade.icon;
                            return (
                                <article
                                    key={unidade.href}
                                    className={`flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                                        unidade.destaque
                                            ? "bg-[#fffdf5] border-[#fdb913] shadow-civic-sm"
                                            : "bg-[#f8fafc] border-slate-200/90 hover:border-[#006494]"
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                    unidade.destaque
                                                        ? "bg-[#fdb913] text-slate-950"
                                                        : "bg-[#e8f6fd] text-[#00557d]"
                                                }`}
                                            >
                                                <Icon size={20} aria-hidden="true" />
                                            </div>
                                            <h4 className="font-heading font-bold text-slate-900 text-base leading-snug">
                                                {unidade.titulo}
                                            </h4>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                            {unidade.resumo}
                                        </p>
                                    </div>

                                    <div className="pt-3 border-t border-slate-200/70">
                                        <Link
                                            href={unidade.href}
                                            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#00557d] hover:text-[#003d5b] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00557d] rounded"
                                        >
                                            <span>{unidade.acaoLabel}</span>
                                            <ArrowRight size={15} aria-hidden="true" />
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>

                {/* Bloco 2: Diretório Compacto de Secretarias por Área */}
                {grouped.length > 0 && (
                    <div className="space-y-8">
                        {grouped.map((group) => (
                            <div key={group.area} className="space-y-3.5">
                                <div className="flex items-center gap-3 border-b border-slate-200 pb-2.5">
                                    <span
                                        className="w-2 h-2 rounded-full bg-[#006494] shrink-0"
                                        aria-hidden="true"
                                    />
                                    <h3 className="font-heading text-base md:text-lg font-extrabold text-slate-900">
                                        {group.area}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {group.items.map((sec) => {
                                        const resumoCurto = getSecretariaShortSummary(sec);
                                        const linkLabel = getSecretariaLinkLabel(sec.nome);
                                        return (
                                            <article
                                                key={sec.id}
                                                className="flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#006494] shadow-xs transition-colors"
                                            >
                                                <div>
                                                    <h4 className="font-heading font-bold text-slate-900 text-base leading-snug">
                                                        {sec.nome}
                                                    </h4>
                                                    <p className="text-slate-600 text-sm leading-relaxed mt-1.5">
                                                        {resumoCurto}
                                                    </p>
                                                </div>

                                                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                                                    {sec.horarioFuncionamento && (
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                            <Clock
                                                                size={13}
                                                                className="text-[#006494] shrink-0"
                                                                aria-hidden="true"
                                                            />
                                                            <span>Atendimento: {sec.horarioFuncionamento}</span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <Link
                                                            href={`/secretarias/${sec.slug}`}
                                                            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#00557d] hover:text-[#003d5b] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00557d] rounded"
                                                        >
                                                            <span>{linkLabel}</span>
                                                            <ArrowRight size={14} aria-hidden="true" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
