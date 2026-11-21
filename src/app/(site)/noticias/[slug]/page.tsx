import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { Calendar, User, ArrowLeft, Building2, AlertCircle, Clock } from "lucide-react";
import { formatDateFortaleza, isAvisoVigente } from "@/lib/timezone";

export const revalidate = 60;

export default function NoticiaPage({ params }: { params: { slug: string } }) {
    return <NoticiaLoader slug={params.slug} />;
}

async function NoticiaLoader({ slug }: { slug: string }) {
    const noticia = await prisma.noticia.findUnique({
        where: { slug },
        include: { secretaria: true },
    });

    if (!noticia || !noticia.publicada) {
        notFound();
    }

    const dataFormatada = formatDateFortaleza(noticia.publicadoEm || noticia.criadoEm);
    const isAviso = noticia.tipoPublicacao === "aviso";
    const vigente = isAviso ? isAvisoVigente(noticia.validoAte) : true;
    const prazoFormatado = noticia.validoAte ? formatDateFortaleza(noticia.validoAte) : null;

    return (
        <div className="min-h-screen bg-[#f4fbff] pb-24">
            <PageHeader
                title={noticia.secretaria?.nome || "Notícias e Comunicados Oficiais"}
                subtitle="Publicação oficial da Prefeitura Municipal de São Tomé – RN"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Notícias", href: "/noticias" },
                    { label: noticia.titulo.slice(0, 42) + (noticia.titulo.length > 42 ? "…" : "") },
                ]}
            />

            <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-12 relative z-10">
                <div className="mb-6">
                    <Link
                        href="/noticias"
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-[#00557d] bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-civic-sm transition-colors"
                    >
                        <ArrowLeft size={14} aria-hidden="true" />
                        <span>Voltar para todas as notícias</span>
                    </Link>
                </div>

                <div className="bg-white rounded-3xl shadow-civic-lg border border-slate-200 overflow-hidden">
                    <div className="h-1.5 w-full heraldic-stripe" aria-hidden="true" />

                    {noticia.imagem && (
                        <div className="w-full aspect-video md:h-[420px] overflow-hidden relative bg-[#eefaff]">
                            <img
                                src={noticia.imagem}
                                alt={noticia.titulo}
                                className="w-full h-full object-cover"
                            />
                            {noticia.secretaria && (
                                <div className="absolute top-5 left-5">
                                    <span className="inline-flex items-center gap-1.5 bg-[#fdb913] text-slate-950 text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-md">
                                        <Building2 size={13} aria-hidden="true" />
                                        {noticia.secretaria.nome}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="p-6 sm:p-8 md:p-12">
                        {/* Aviso com prazo (vigente ou encerrado no histórico) */}
                        {isAviso && (
                            <div
                                className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 ${
                                    vigente
                                        ? "bg-[#fff8e1] border-[#fdb913] text-slate-900"
                                        : "bg-slate-100 border-slate-300 text-slate-700"
                                }`}
                            >
                                {vigente ? (
                                    <AlertCircle
                                        size={20}
                                        className="text-amber-800 shrink-0 mt-0.5"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <Clock
                                        size={20}
                                        className="text-slate-600 shrink-0 mt-0.5"
                                        aria-hidden="true"
                                    />
                                )}
                                <div className="text-sm">
                                    <strong className="font-bold block">
                                        {vigente
                                            ? "Comunicado / Aviso Oficial em Vigência"
                                            : "Aviso com Prazo Encerrado (Consulta Histórica)"}
                                    </strong>
                                    {prazoFormatado && (
                                        <span className="text-xs">
                                            {vigente
                                                ? `Prazo final: ${prazoFormatado} (Horário de Brasília / America-Fortaleza).`
                                                : `O prazo deste aviso encerrou em ${prazoFormatado}. O registro permanece publicado para transparência e histórico.`}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-5 mb-6 text-slate-600 text-xs font-medium pb-6 border-b border-slate-100">
                            <div className="flex items-center gap-2 font-mono">
                                <Calendar className="w-4 h-4 text-[#006494]" aria-hidden="true" />
                                <time dateTime={(noticia.publicadoEm || noticia.criadoEm).toISOString()}>
                                    Publicado em {dataFormatada}
                                </time>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-[#006494]" aria-hidden="true" />
                                <span>Assessoria de Comunicação Institucional</span>
                            </div>
                        </div>

                        <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
                            {noticia.titulo}
                        </h1>

                        {noticia.resumo && (
                            <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed mb-8 border-l-4 border-[#006494] pl-5 py-2 bg-[#f4fbff] rounded-r-xl">
                                {noticia.resumo}
                            </p>
                        )}

                        <div
                            className="prose prose-slate prose-lg max-w-none text-slate-800
                            prose-headings:font-heading prose-headings:font-bold prose-headings:text-slate-900
                            prose-a:text-[#00557d] hover:prose-a:underline prose-a:font-semibold
                            prose-img:rounded-2xl prose-img:shadow-civic
                            prose-p:leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: noticia.conteudo }}
                        />
                    </div>
                </div>
            </article>
        </div>
    );
}
