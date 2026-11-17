"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Newspaper, Calendar, ArrowRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";

type Noticia = {
    id: string;
    titulo: string;
    slug: string;
    resumo: string;
    publicadoEm: string;
    imagem?: string;
    secretaria?: { nome: string };
};

function formatarData(dataStr: string) {
    if (!dataStr) return "";
    const d = new Date(dataStr.includes("T") ? dataStr : dataStr + "T00:00:00");
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export default function NoticiasPage() {
    const [noticias, setNoticias] = useState<Noticia[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNoticias = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/noticias?publicada=true&limit=12");
                const data = await res.json();
                setNoticias(data.items || []);
            } catch (error) {
                console.error("Erro ao buscar notícias:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNoticias();
    }, []);

    return (
        <div className="min-h-screen bg-[#f4fbff]">
            <PageHeader
                title="Notícias e Comunicados"
                subtitle="Acompanhe as ações, obras, editais e investimentos realizados pela Prefeitura Municipal de São Tomé."
                variant="premium"
                icon={<Newspaper className="w-8 h-8" />}
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Notícias" },
                ]}
            />

            <div className="max-w-[1240px] mx-auto px-6 py-14 pb-24">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-10 h-10 border-3 border-[#01b0ef] border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-slate-600 font-semibold text-sm">
                            Carregando publicações...
                        </p>
                    </div>
                ) : noticias.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-civic-sm border border-slate-200/80">
                        <div className="w-14 h-14 rounded-2xl bg-[#01b0ef]/10 text-[#01b0ef] flex items-center justify-center mx-auto mb-4">
                            <Newspaper size={26} />
                        </div>
                        <h2 className="font-heading text-xl font-bold text-slate-900 mb-1">
                            Nenhuma notícia publicada no momento
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Novas matérias e comunicados oficiais serão exibidos nesta seção.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                        {noticias.map((n) => (
                            <article
                                key={n.id}
                                className="bg-white rounded-2xl shadow-civic-sm hover:shadow-civic-xl transition-all duration-300 hover:-translate-y-1 border border-slate-200/80 hover:border-[#01b0ef] overflow-hidden flex flex-col group"
                            >
                                <Link
                                    href={`/noticias/${n.slug}`}
                                    className="block overflow-hidden h-52 relative bg-[#eefaff]"
                                >
                                    {n.imagem ? (
                                        <img
                                            src={n.imagem}
                                            alt={n.titulo}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#01b0ef] to-[#0098d4] flex items-center justify-center">
                                            <Newspaper className="text-white/40" size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-[#fdb913] text-slate-900 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                                            {n.secretaria?.nome || "Comunicado Oficial"}
                                        </span>
                                    </div>
                                </Link>

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center gap-2 text-slate-500 text-xs font-mono mb-3">
                                        <Calendar size={13} className="text-[#01b0ef]" />
                                        <time dateTime={n.publicadoEm}>
                                            {formatarData(n.publicadoEm)}
                                        </time>
                                    </div>

                                    <h2 className="font-heading font-bold text-slate-900 text-lg leading-snug mb-2.5 line-clamp-2 group-hover:text-[#01b0ef] transition-colors">
                                        <Link href={`/noticias/${n.slug}`}>{n.titulo}</Link>
                                    </h2>

                                    <p className="text-slate-600 text-sm leading-relaxed flex-1 line-clamp-3 mb-5">
                                        {n.resumo}
                                    </p>

                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <Link
                                            href={`/noticias/${n.slug}`}
                                            className="inline-flex items-center gap-1.5 text-[#01b0ef] font-bold text-xs group-hover:gap-2.5 transition-all"
                                        >
                                            <span>Ler matéria completa</span>
                                            <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
