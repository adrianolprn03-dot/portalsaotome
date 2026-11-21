import Link from "next/link";
import {
    Receipt,
    Coins,
    Gavel,
    FileSignature,
    HardHat,
    Scale,
    ArrowRight,
    ShieldCheck,
    Clock,
    BarChart3,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateFortaleza } from "@/lib/timezone";

const ACESSOS_DIRETOS = [
    {
        titulo: "Despesas",
        descricao: "Empenhos, liquidações e pagamentos realizados pelo município.",
        href: "/transparencia/despesas",
        icon: Receipt,
    },
    {
        titulo: "Receitas",
        descricao: "Arrecadação municipal, tributos e transferências constitucionais.",
        href: "/transparencia/receitas",
        icon: Coins,
    },
    {
        titulo: "Licitações",
        descricao: "Editais, atas, julgamentos e acompanhamento de compras públicas.",
        href: "/transparencia/licitacoes",
        icon: Gavel,
    },
    {
        titulo: "Contratos",
        descricao: "Contratos administrativos firmados, aditivos, valores e vigências.",
        href: "/transparencia/contratos",
        icon: FileSignature,
    },
    {
        titulo: "Obras",
        descricao: "Situação física, cronogramas, medições e investimentos em obras.",
        href: "/transparencia/obras",
        icon: HardHat,
    },
    {
        titulo: "Legislação",
        descricao: "Leis ordinárias e complementares, decretos e portarias municipais.",
        href: "/transparencia/legislacao",
        icon: Scale,
    },
];

export default async function TransparenciaCompactSection() {
    let ultimaAtualizacao: Date | null = null;
    let totalAtosPublicados = 0;

    try {
        const [lastLegislacao, lastDoc, lastNoticia, countAtos] = await Promise.all([
            prisma.legislacao.findFirst({
                where: { ativo: true, NOT: { situacaoPublicacao: "rascunho" } },
                orderBy: { atualizadoEm: "desc" },
                select: { atualizadoEm: true },
            }),
            prisma.documento.findFirst({
                where: { ativo: true, situacaoPublicacao: "publicado" },
                orderBy: { atualizadoEm: "desc" },
                select: { atualizadoEm: true },
            }),
            prisma.noticia.findFirst({
                where: { publicada: true },
                orderBy: { atualizadoEm: "desc" },
                select: { atualizadoEm: true },
            }),
            prisma.legislacao.count({
                where: { ativo: true, NOT: { situacaoPublicacao: "rascunho" } },
            }),
        ]);

        totalAtosPublicados = countAtos;

        const candidates = [
            lastLegislacao?.atualizadoEm,
            lastDoc?.atualizadoEm,
            lastNoticia?.atualizadoEm,
        ].filter((d): d is Date => d instanceof Date && !isNaN(d.getTime()));

        if (candidates.length > 0) {
            ultimaAtualizacao = candidates.sort((a, b) => b.getTime() - a.getTime())[0];
        }
    } catch (error) {
        console.error("Erro ao consultar metadados verificáveis de transparência:", error);
    }

    const dataFormatada = ultimaAtualizacao ? formatDateFortaleza(ultimaAtualizacao) : null;

    return (
        <section
            className="bg-[#f4fbff] py-12 md:py-16 border-b border-slate-200/80"
            aria-labelledby="transparencia-home-heading"
        >
            <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
                {/* Cabeçalho compacto com ações e dados verificáveis */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
                    <div className="max-w-2xl">
                        <div className="section-eyebrow">
                            <ShieldCheck size={14} className="text-[#006494]" aria-hidden="true" />
                            <span>Acesso à Informação • Lei Federal nº 12.527/2011</span>
                        </div>
                        <h2 id="transparencia-home-heading" className="section-title">
                            Transparência Pública
                        </h2>
                        <p className="text-slate-700 text-base mt-1.5 leading-relaxed">
                            Consulte a aplicação dos recursos municipais, processos licitatórios, contratos vigentes e atos normativos oficiais.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <Link
                            href="/transparencia"
                            className="inline-flex items-center gap-2 min-h-[46px] px-5 py-2.5 rounded-xl bg-[#fdb913] hover:bg-[#e5a60d] text-slate-950 font-bold text-sm shadow-civic-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00557d] focus-visible:ring-offset-2"
                        >
                            <span>Acessar Portal da Transparência</span>
                            <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                        <Link
                            href="/transparencia/radar"
                            className="inline-flex items-center gap-2 min-h-[46px] px-4 py-2.5 rounded-xl bg-white hover:bg-[#e8f6fd] text-[#00557d] border border-slate-300 hover:border-[#006494] font-bold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00557d] focus-visible:ring-offset-2"
                        >
                            <BarChart3 size={16} aria-hidden="true" />
                            <span>Matriz PNTP e Radar</span>
                        </Link>
                    </div>
                </div>

                {/* Grade compacta de 6 acessos diretos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ACESSOS_DIRETOS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="group flex items-start gap-4 p-5 bg-white hover:bg-[#fcfdff] rounded-2xl border border-slate-200 hover:border-[#006494] shadow-civic-sm hover:shadow-civic-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00557d] focus-visible:ring-offset-2"
                            >
                                <div className="w-11 h-11 rounded-xl bg-[#e8f6fd] text-[#00557d] group-hover:bg-[#006494] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                    <Icon size={21} aria-hidden="true" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="font-heading font-bold text-slate-900 group-hover:text-[#00557d] text-base leading-snug transition-colors">
                                            {item.titulo}
                                        </h3>
                                        <ArrowRight
                                            size={16}
                                            className="text-slate-400 group-hover:text-[#00557d] group-hover:translate-x-0.5 transition-all shrink-0"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed mt-1">
                                        {item.descricao}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Rodapé verificável da seção */}
                <div className="mt-6 pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                        {dataFormatada && (
                            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                                <Clock size={14} className="text-[#006494]" aria-hidden="true" />
                                <span>
                                    Última atualização registrada no portal:{" "}
                                    <strong className="font-bold text-slate-900">{dataFormatada}</strong>
                                </span>
                            </span>
                        )}
                        {totalAtosPublicados > 0 && (
                            <span className="inline-flex items-center gap-1.5">
                                <span className="text-slate-300" aria-hidden="true">•</span>
                                <span>
                                    Acervo legislativo com{" "}
                                    <strong className="font-bold text-slate-800">
                                        {totalAtosPublicados.toLocaleString("pt-BR")}
                                    </strong>{" "}
                                    atos oficiais publicados
                                </span>
                            </span>
                        )}
                    </div>
                    <div className="text-slate-600">
                        <span>Fonte: Base oficial do Portal Institucional e sistemas integrados de gestão fiscal</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
