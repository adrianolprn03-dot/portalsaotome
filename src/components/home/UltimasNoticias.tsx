"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Newspaper, Sparkles } from "lucide-react";

type Noticia = {
    id: string;
    titulo: string;
    resumo: string;
    imagem: string | null;
    publicadoEm: string;
    slug: string;
    secretaria?: { nome: string };
};

const defaultNoticias: Noticia[] = [
    {
        id: "1",
        titulo: "Prefeitura Municipal de São Tomé atualiza Portal da Transparência conforme PNTP 2026",
        resumo: "Nova plataforma garante transparência ativa, controle social e acesso simplificado aos atos oficiais e finanças municipais.",
        imagem: "/images/hero-bg.jpg",
        publicadoEm: new Date().toISOString(),
        slug: "portal-transparencia-2026-sao-tome",
    },
    {
        id: "2",
        titulo: "Ampliação dos Serviços de Saúde e Atendimento à População de São Tomé",
        resumo: "Unidades de atendimento passam por reestruturação para melhorar o acesso dos cidadãos aos exames e consultas.",
        imagem: null,
        publicadoEm: new Date().toISOString(),
        slug: "ampliacao-servicos-saude-sao-tome",
    },
    {
        id: "3",
        titulo: "Investimentos em Infraestrutura Escolar e Rede Municipal de Ensino",
        resumo: "Ações contínuas de valorização da educação e equipamentos para as escolas do município.",
        imagem: null,
        publicadoEm: new Date().toISOString(),
        slug: "investimentos-educacao-sao-tome",
    },
];

export default function UltimasNoticias() {
    const [noticias, setNoticias] = useState<Noticia[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNoticias = async () => {
            try {
                const res = await fetch("/api/noticias?limit=5&publicada=true");
                const data = await res.json();
                if (data.items && data.items.length > 0) {
                    setNoticias(data.items);
                } else {
                    setNoticias(defaultNoticias);
                }
            } catch (error) {
                console.error("Erro ao carregar notícias:", error);
                setNoticias(defaultNoticias);
            } finally {
                setLoading(false);
            }
        };
        fetchNoticias();
    }, []);

    const formatarData = (data: string | null) => {
        if (!data) return "";
        const d = new Date(data);
        if (isNaN(d.getTime())) return "";
        return d
            .toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })
            .replace(/ de /g, " ");
    };

    if (loading) return null;

    const destaque = noticias[0];
    const laterais = noticias.slice(1, 5);

    return (
        <section
            className="bg-white py-20 md:py-24 relative overflow-hidden border-b border-slate-200/70"
            aria-labelledby="noticias-titulo"
        >
            <div className="max-w-[1240px] mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="space-y-3 max-w-xl">
                        <div className="section-eyebrow">
                            <Newspaper size={14} className="text-[#01b0ef]" />
                            <span>Agência Municipal de Notícias</span>
                        </div>
                        <h2 id="noticias-titulo" className="section-title">
                            Acompanhe as ações e investimentos da{" "}
                            <span className="text-[#01b0ef]">Prefeitura</span>
                        </h2>
                    </div>
                    <Link
                        href="/noticias"
                        className="btn-outline shrink-0 self-start md:self-auto group"
                    >
                        <span>Ver todas as notícias</span>
                        <ArrowRight
                            size={16}
                            className="text-[#01b0ef] group-hover:translate-x-1 transition-transform"
                        />
                    </Link>
                </div>

                {/* Editorial Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Featured Article (7 cols) */}
                    <div className="lg:col-span-7 flex">
                        <Link
                            href={`/noticias/${destaque.slug}`}
                            className="group relative flex flex-col w-full min-h-[440px] lg:min-h-[520px] rounded-3xl overflow-hidden shadow-civic-lg border border-[#01b0ef]/20 transition-all duration-300 hover:shadow-civic-xl"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/35 to-transparent z-10" />

                            {destaque.imagem ? (
                                <img
                                    src={destaque.imagem}
                                    alt={destaque.titulo}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-[#01b0ef] to-[#0098d4]" />
                            )}

                            <div className="relative z-20 flex flex-col justify-end h-full p-7 sm:p-10">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fdb913] text-slate-900 text-xs font-extrabold shadow-sm">
                                        <Sparkles size={12} />
                                        {destaque.secretaria?.nome || "Destaque Oficial"}
                                    </span>
                                    <span className="text-white text-xs font-mono flex items-center gap-1.5 bg-[#01b0ef] px-3 py-1 rounded-full shadow-sm">
                                        <Calendar size={12} />
                                        {formatarData(destaque.publicadoEm)}
                                    </span>
                                </div>

                                <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-3 group-hover:text-[#fdb913] transition-colors line-clamp-3">
                                    {destaque.titulo}
                                </h3>

                                <p className="text-white/90 text-sm sm:text-base line-clamp-2 mb-6 font-normal leading-relaxed">
                                    {destaque.resumo}
                                </p>

                                <div className="inline-flex items-center gap-2 text-slate-900 font-bold text-xs bg-[#01b0ef] px-5 py-2.5 rounded-xl w-fit group-hover:bg-[#fdb913] group-hover:text-slate-900 transition-all shadow-sm">
                                    <span>Ler matéria completa</span>
                                    <ArrowRight
                                        size={15}
                                        className="group-hover:translate-x-1 transition-transform"
                                    />
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Side News List (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                        {laterais.map((n) => (
                            <Link
                                key={n.id}
                                href={`/noticias/${n.slug}`}
                                className="group flex items-center gap-4 p-4 rounded-2xl bg-[#f4fbff] hover:bg-white border border-slate-200/80 hover:border-[#01b0ef] hover:shadow-civic transition-all duration-300"
                            >
                                <div className="relative w-28 h-24 sm:w-32 sm:h-28 rounded-xl overflow-hidden bg-[#eefaff] shrink-0">
                                    {n.imagem ? (
                                        <img
                                            src={n.imagem}
                                            alt={n.titulo}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#01b0ef] to-[#0098d4] flex items-center justify-center text-white/70">
                                            <Newspaper size={24} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-[11px] font-mono font-bold text-[#01b0ef]">
                                            {formatarData(n.publicadoEm)}
                                        </span>
                                        {n.secretaria?.nome && (
                                            <>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-[11px] font-semibold text-slate-500 truncate">
                                                    {n.secretaria.nome}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    <h3 className="font-heading font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-[#01b0ef] transition-colors line-clamp-2 mb-2">
                                        {n.titulo}
                                    </h3>

                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 group-hover:text-[#01b0ef] transition-colors">
                                        <span>Ler publicação</span>
                                        <ArrowRight
                                            size={13}
                                            className="group-hover:translate-x-1 transition-transform"
                                        />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
