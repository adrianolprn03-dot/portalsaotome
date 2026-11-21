import Link from "next/link";
import { ArrowRight, Calendar, Newspaper, Bell, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
    selectHomeNoticiasAndAvisos,
    NoticiaPublicaItem,
} from "@/lib/noticias-selector";

export default async function UltimasNoticias({
    overrideItems,
}: {
    overrideItems?: NoticiaPublicaItem[];
} = {}) {
    let rawItems: NoticiaPublicaItem[] = [];

    if (overrideItems) {
        rawItems = overrideItems;
    } else {
        try {
            const dbItems = await prisma.noticia.findMany({
                where: { publicada: true },
                orderBy: [{ publicadoEm: "desc" }, { criadoEm: "desc" }],
                take: 15,
                include: {
                    secretaria: { select: { nome: true, slug: true } },
                },
            });
            rawItems = dbItems as unknown as NoticiaPublicaItem[];
        } catch (error) {
            console.error("Erro ao carregar notícias da home:", error);
            rawItems = [];
        }
    }

    const { avisosVigentes, principal, secundarias } =
        selectHomeNoticiasAndAvisos(rawItems);

    return (
        <section
            id="noticias-e-avisos"
            aria-labelledby="noticias-avisos-titulo"
            className="bg-[#f4fbff] py-12 sm:py-16 border-b border-slate-200"
        >
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Cabeçalho da Seção */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h2 id="noticias-avisos-titulo" className="section-title">
                            Notícias e avisos
                        </h2>
                        <p className="text-slate-700 text-base mt-1">
                            Publicações oficiais, comunicados com prazo e ações realizadas no município.
                        </p>
                    </div>

                    <Link
                        href="/noticias"
                        className="btn-outline self-start sm:self-auto shrink-0"
                    >
                        <span>Ver todas as notícias</span>
                        <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                </div>

                {/* Avisos Oficiais Vigentes (Respeitando o fuso America/Fortaleza) */}
                {avisosVigentes.length > 0 && (
                    <div
                        aria-label="Avisos oficiais vigentes"
                        className="space-y-3"
                    >
                        {avisosVigentes.map((aviso) => (
                            <article
                                key={aviso.id}
                                className="rounded-2xl bg-[#fff9e7] border-2 border-[#fdb913] p-4 sm:p-5 shadow-civic-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                                <div className="flex items-start gap-3.5 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-[#fdb913] text-slate-900 flex items-center justify-center shrink-0 mt-0.5">
                                        <Bell size={19} aria-hidden="true" />
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-900 text-[#fdb913]">
                                                Aviso Oficial
                                            </span>
                                            {aviso.validoAteFmt && (
                                                <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-md border border-[#fdb913]">
                                                    <Clock size={12} aria-hidden="true" />
                                                    <span>Prazo até {aviso.validoAteFmt}</span>
                                                </span>
                                            )}
                                            <span className="text-xs font-mono text-slate-700">
                                                Publicado em {aviso.dataPublicacaoFmt}
                                            </span>
                                        </div>
                                        <h3 className="font-heading text-lg font-extrabold text-slate-900 leading-snug">
                                            <Link
                                                href={`/noticias/${aviso.slug}`}
                                                className="hover:text-[#00557d] hover:underline"
                                            >
                                                {aviso.titulo}
                                            </Link>
                                        </h3>
                                        <p className="text-slate-800 text-sm leading-relaxed line-clamp-2">
                                            {aviso.resumo}
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href={`/noticias/${aviso.slug}`}
                                    className="btn-primary text-xs px-4 py-2.5 shrink-0 self-start md:self-center"
                                >
                                    <span>Ler aviso completo</span>
                                    <ArrowRight size={14} aria-hidden="true" />
                                </Link>
                            </article>
                        ))}
                    </div>
                )}

                {/* Grade Editorial Adaptativa (1 principal + até 2 chamadas secundárias) */}
                {!principal ? (
                    <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-[#edf8ff] text-[#00557d] flex items-center justify-center mx-auto">
                            <Newspaper size={22} aria-hidden="true" />
                        </div>
                        <h3 className="font-heading text-lg font-bold text-slate-900">
                            Nenhuma notícia publicada no momento
                        </h3>
                        <p className="text-slate-600 text-sm max-w-md mx-auto">
                            As matérias e comunicados oficiais cadastrados pela Prefeitura aparecerão automaticamente nesta seção.
                        </p>
                    </div>
                ) : (
                    <div
                        className={`grid grid-cols-1 gap-6 ${
                            secundarias.length > 0 ? "lg:grid-cols-12" : ""
                        }`}
                    >
                        {/* Notícia Principal com Fotografia (ou fallback institucional limpo) */}
                        <article
                            className={`${
                                secundarias.length > 0 ? "lg:col-span-7" : ""
                            } bg-white rounded-2xl border border-slate-200 hover:border-[#006494] shadow-civic-sm hover:shadow-civic-lg transition-all overflow-hidden flex flex-col`}
                        >
                            {principal.imagem ? (
                                <Link
                                    href={`/noticias/${principal.slug}`}
                                    tabIndex={-1}
                                    aria-hidden="true"
                                    className="block relative aspect-[16/9] w-full overflow-hidden bg-[#edf8ff]"
                                >
                                    <img
                                        src={principal.imagem}
                                        alt=""
                                        className="w-full h-full object-cover news-image"
                                    />
                                </Link>
                            ) : (
                                <div className="h-2 w-full heraldic-stripe" />
                            )}

                            <div className="p-6 sm:p-7 flex flex-col justify-between flex-1 space-y-4">
                                <div className="space-y-2.5">
                                    <div className="flex flex-wrap items-center gap-2.5 text-xs">
                                        <span className="font-extrabold px-2.5 py-1 rounded-md bg-[#edf8ff] text-[#00557d] border border-[#9fd8f5]">
                                            {principal.secretaria?.nome || "Notícia Municipal"}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-slate-600">
                                            <Calendar size={13} className="text-[#006494]" aria-hidden="true" />
                                            <time
                                                dateTime={
                                                    principal.publicadoEm
                                                        ? new Date(principal.publicadoEm).toISOString()
                                                        : undefined
                                                }
                                            >
                                                {principal.dataPublicacaoFmt}
                                            </time>
                                        </span>
                                    </div>

                                    <h3 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                                        <Link
                                            href={`/noticias/${principal.slug}`}
                                            className="hover:text-[#00557d] transition-colors"
                                        >
                                            {principal.titulo}
                                        </Link>
                                    </h3>

                                    <p className="text-slate-700 text-base leading-relaxed line-clamp-3">
                                        {principal.resumo}
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-slate-100">
                                    <Link
                                        href={`/noticias/${principal.slug}`}
                                        className="inline-flex items-center gap-2 text-sm font-extrabold text-[#00557d] hover:text-[#003e5c] hover:underline"
                                    >
                                        <span>Ler matéria completa</span>
                                        <ArrowRight size={15} aria-hidden="true" />
                                    </Link>
                                </div>
                            </div>
                        </article>

                        {/* Duas Chamadas Secundárias (com título, data e link) */}
                        {secundarias.length > 0 && (
                            <div className="lg:col-span-5 flex flex-col gap-4">
                                {secundarias.map((secItem) => (
                                    <article
                                        key={secItem.id}
                                        className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 hover:border-[#006494] shadow-civic-sm hover:shadow-civic transition-all flex-1 flex flex-col justify-between gap-4"
                                    >
                                        <div className="flex items-start gap-4">
                                            {secItem.imagem && (
                                                <Link
                                                    href={`/noticias/${secItem.slug}`}
                                                    tabIndex={-1}
                                                    aria-hidden="true"
                                                    className="w-24 h-24 sm:w-28 sm:h-24 rounded-xl overflow-hidden bg-[#edf8ff] shrink-0 border border-slate-200"
                                                >
                                                    <img
                                                        src={secItem.imagem}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </Link>
                                            )}

                                            <div className="min-w-0 flex-1 space-y-1.5">
                                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                                    <span className="inline-flex items-center gap-1 font-mono font-bold text-[#00557d]">
                                                        <Calendar size={12} aria-hidden="true" />
                                                        <time
                                                            dateTime={
                                                                secItem.publicadoEm
                                                                    ? new Date(secItem.publicadoEm).toISOString()
                                                                    : undefined
                                                            }
                                                        >
                                                            {secItem.dataPublicacaoFmt}
                                                        </time>
                                                    </span>
                                                    {secItem.secretaria?.nome && (
                                                        <span className="text-slate-600 font-semibold truncate">
                                                            • {secItem.secretaria.nome}
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="font-heading text-base sm:text-lg font-extrabold text-slate-900 leading-snug line-clamp-2">
                                                    <Link
                                                        href={`/noticias/${secItem.slug}`}
                                                        className="hover:text-[#00557d] transition-colors"
                                                    >
                                                        {secItem.titulo}
                                                    </Link>
                                                </h3>

                                                <p className="text-slate-700 text-sm leading-relaxed line-clamp-2">
                                                    {secItem.resumo}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-2.5 border-t border-slate-100">
                                            <Link
                                                href={`/noticias/${secItem.slug}`}
                                                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#00557d] hover:text-[#003e5c] hover:underline"
                                            >
                                                <span>Ler matéria</span>
                                                <ArrowRight size={14} aria-hidden="true" />
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
