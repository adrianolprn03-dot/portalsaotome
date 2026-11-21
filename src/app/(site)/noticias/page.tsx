"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Newspaper, Calendar, ArrowRight, AlertCircle, Clock } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { formatDateFortaleza, isAvisoVigente } from "@/lib/timezone";

type Noticia = {
    id: string;
    titulo: string;
    slug: string;
    resumo: string;
    publicadoEm: string;
    criadoEm?: string;
    imagem?: string;
    tipoPublicacao?: string;
    validoAte?: string | null;
    secretaria?: { nome: string };
};

export default function NoticiasPage() {
    const [noticias, setNoticias] = useState<Noticia[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroTipo, setFiltroTipo] = useState<"todos" | "noticia" | "aviso">("todos");

    useEffect(() => {
        const fetchNoticias = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/noticias?publicada=true&limit=24");
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

    const itensFiltrados = noticias.filter((n) => {
        if (filtroTipo === "todos") return true;
        const tipo = n.tipoPublicacao === "aviso" ? "aviso" : "noticia";
        return tipo === filtroTipo;
    });

    return (
        <div className="min-h-screen bg-[#f4fbff]">
            <PageHeader
                title="Notícias e Avisos Oficiais"
                subtitle="Acompanhe as publicações, obras, comunicados com prazo e ações realizadas pela Prefeitura de São Tomé."
                variant="premium"
                icon={<Newspaper className="w-8 h-8" />}
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Notícias" },
                ]}
            />

            <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10 md:py-14 pb-24 space-y-8">
                {/* Filtro rápido: Todas, Notícias, Avisos e Editais */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por tipo de publicação">
                        {[
                            { id: "todos", label: "Todas as publicações" },
                            { id: "noticia", label: "Notícias" },
                            { id: "aviso", label: "Avisos e Comunicados" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setFiltroTipo(tab.id as "todos" | "noticia" | "aviso")}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                    filtroTipo === tab.id
                                        ? "bg-[#006494] text-white"
                                        : "bg-[#f4fbff] hover:bg-[#e8f6fd] text-slate-700"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <span className="text-xs font-semibold text-slate-600">
                        {itensFiltrados.length}{" "}
                        {itensFiltrados.length === 1 ? "publicação encontrada" : "publicações encontradas"}
                    </span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-10 h-10 border-3 border-[#006494] border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-slate-700 font-semibold text-sm">
                            Carregando publicações...
                        </p>
                    </div>
                ) : itensFiltrados.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-civic-sm border border-slate-200/80">
                        <div className="w-14 h-14 rounded-2xl bg-[#e8f6fd] text-[#00557d] flex items-center justify-center mx-auto mb-4">
                            <Newspaper size={26} aria-hidden="true" />
                        </div>
                        <h2 className="font-heading text-xl font-bold text-slate-900 mb-1">
                            Nenhuma publicação encontrada
                        </h2>
                        <p className="text-slate-600 text-sm">
                            Novas matérias e comunicados oficiais serão exibidos nesta seção.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {itensFiltrados.map((n) => {
                            const isAviso = n.tipoPublicacao === "aviso";
                            const vigente = isAviso ? isAvisoVigente(n.validoAte) : true;
                            const prazoTexto = n.validoAte ? formatDateFortaleza(n.validoAte) : null;

                            return (
                                <article
                                    key={n.id}
                                    className="bg-white rounded-2xl shadow-civic-sm hover:shadow-civic-md transition-all border border-slate-200 hover:border-[#006494] overflow-hidden flex flex-col group"
                                >
                                    <Link
                                        href={`/noticias/${n.slug}`}
                                        className="block overflow-hidden h-52 relative bg-[#eefaff]"
                                        tabIndex={-1}
                                        aria-hidden="true"
                                    >
                                        {n.imagem ? (
                                            <img
                                                src={n.imagem}
                                                alt=""
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#00557d] to-[#0077b0] flex items-center justify-center">
                                                <Newspaper className="text-white/40" size={48} />
                                            </div>
                                        )}
                                        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
                                            <span className="bg-[#fdb913] text-slate-950 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                                                {n.secretaria?.nome || "Prefeitura de São Tomé"}
                                            </span>
                                            {isAviso && (
                                                <span
                                                    className={`text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm ${
                                                        vigente
                                                            ? "bg-amber-950 text-[#fdb913]"
                                                            : "bg-slate-800 text-slate-200"
                                                    }`}
                                                >
                                                    {vigente ? "Aviso Oficial" : "Aviso no Histórico"}
                                                </span>
                                            )}
                                        </div>
                                    </Link>

                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex flex-wrap items-center justify-between gap-2 text-slate-600 text-xs font-mono mb-3">
                                            <span className="inline-flex items-center gap-1.5">
                                                <Calendar size={13} className="text-[#006494]" aria-hidden="true" />
                                                <time dateTime={n.publicadoEm || n.criadoEm}>
                                                    {formatDateFortaleza(n.publicadoEm || n.criadoEm)}
                                                </time>
                                            </span>

                                            {isAviso && prazoTexto && (
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-bold ${
                                                        vigente
                                                            ? "bg-[#fff8e1] text-amber-950 border border-[#fdb913]"
                                                            : "bg-slate-100 text-slate-600 border border-slate-300"
                                                    }`}
                                                >
                                                    {vigente ? (
                                                        <>
                                                            <AlertCircle size={12} aria-hidden="true" />
                                                            <span>Prazo até {prazoTexto}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock size={12} aria-hidden="true" />
                                                            <span>Encerrado em {prazoTexto}</span>
                                                        </>
                                                    )}
                                                </span>
                                            )}
                                        </div>

                                        <h2 className="font-heading font-bold text-slate-900 text-lg leading-snug mb-2.5 line-clamp-2 group-hover:text-[#00557d] transition-colors">
                                            <Link href={`/noticias/${n.slug}`}>{n.titulo}</Link>
                                        </h2>

                                        <p className="text-slate-600 text-sm leading-relaxed flex-1 line-clamp-3 mb-5">
                                            {n.resumo}
                                        </p>

                                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <Link
                                                href={`/noticias/${n.slug}`}
                                                className="inline-flex items-center gap-1.5 text-[#00557d] font-bold text-sm hover:underline"
                                            >
                                                <span>Ler publicação completa</span>
                                                <ArrowRight size={15} aria-hidden="true" />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
