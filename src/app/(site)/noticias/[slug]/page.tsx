import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { Calendar, User, ArrowLeft, Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

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

    const dataFormatada = new Date(
        noticia.publicadoEm || noticia.criadoEm
    ).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    return (
        <main className="min-h-screen bg-[#F6F9FC] pb-24">
            <PageHeader
                title={noticia.secretaria?.nome || "Agência Municipal de Notícias"}
                subtitle="Publicação oficial da Prefeitura Municipal de São Tomé – RN"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Notícias", href: "/noticias" },
                    { label: noticia.titulo.slice(0, 36) + "..." },
                ]}
            />

            <article className="max-w-4xl mx-auto px-6 py-12 relative z-10">
                <div className="mb-6">
                    <Link
                        href="/noticias"
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-primary-600 bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-civic-sm transition-colors"
                    >
                        <ArrowLeft size={14} />
                        <span>Voltar para todas as notícias</span>
                    </Link>
                </div>

                <div className="bg-white rounded-3xl shadow-civic-lg border border-slate-200/80 overflow-hidden">
                    <div className="h-1.5 w-full heraldic-stripe" />

                    {noticia.imagem && (
                        <div className="w-full aspect-video md:h-[440px] overflow-hidden relative bg-slate-100">
                            <img
                                src={noticia.imagem}
                                alt={noticia.titulo}
                                className="w-full h-full object-cover"
                            />
                            {noticia.secretaria && (
                                <div className="absolute top-6 left-6">
                                    <span className="inline-flex items-center gap-1.5 bg-secondary-500 text-[#071E3D] text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md">
                                        <Building2 size={13} />
                                        {noticia.secretaria.nome}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="p-8 md:p-12">
                        <div className="flex flex-wrap items-center gap-5 mb-6 text-slate-500 text-xs font-medium pb-6 border-b border-slate-100">
                            <div className="flex items-center gap-2 font-mono">
                                <Calendar className="w-4 h-4 text-primary-600" />
                                <time dateTime={noticia.publicadoEm?.toString() || ""}>
                                    {dataFormatada}
                                </time>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-primary-600" />
                                <span>Assessoria de Comunicação Institucional</span>
                            </div>
                        </div>

                        <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#071E3D] leading-tight mb-6 tracking-tight">
                            {noticia.titulo}
                        </h1>

                        {noticia.resumo && (
                            <p className="text-lg text-slate-600 font-medium leading-relaxed mb-8 border-l-4 border-primary-500 pl-5 py-1 bg-slate-50/70 rounded-r-xl">
                                {noticia.resumo}
                            </p>
                        )}

                        <div
                            className="prose prose-slate prose-lg max-w-none text-slate-700
                            prose-headings:font-heading prose-headings:font-bold prose-headings:text-[#071E3D]
                            prose-a:text-primary-600 hover:prose-a:text-primary-700 prose-a:font-semibold
                            prose-img:rounded-2xl prose-img:shadow-civic
                            prose-p:leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: noticia.conteudo }}
                        />
                    </div>
                </div>
            </article>
        </main>
    );
}
