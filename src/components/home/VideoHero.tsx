"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, ArrowRight, Landmark, Award, Sparkles, Compass } from "lucide-react";

interface VideoHeroProps {
    slogan?: string;
}

const MARCOS_MUNICIPIO = [
    {
        label: "Emancipação Política",
        valor: "1928 • Lei Estadual nº 697",
        icon: Landmark,
    },
    {
        label: "Região Geográfica",
        valor: "Borborema Potiguar / Potengi",
        icon: Compass,
    },
    {
        label: "Identidade e Tradição",
        valor: "Gentílico São-tomeense",
        icon: Sparkles,
    },
    {
        label: "Símbolos Municipais",
        valor: "Brasão, Bandeira e Hino Oficial",
        icon: Award,
    },
];

export default function VideoHero({
    slogan = "O Trabalho Segue em Frente",
}: VideoHeroProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [imgError, setImgError] = useState(false);

    const videoSrc = "/video_saotome.mp4";
    const posterSrc = !imgError ? "/images/hero-slider-2.jpg" : "/images/hero-panoramica.jpg";

    return (
        <section
            className="relative w-full py-14 md:py-20 bg-[#eefaff] border-t border-slate-200/80 overflow-hidden"
            aria-labelledby="conheca-saotome-heading"
        >
            <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    {/* Coluna Esquerda: Vídeo Institucional sob demanda com capa estática */}
                    <div className="lg:col-span-7">
                        <div className="bg-white p-2.5 sm:p-3 rounded-3xl border border-slate-200 shadow-civic-lg">
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900">
                                {!isPlaying ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsPlaying(true)}
                                        className="group relative block w-full h-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#fdb913]"
                                        aria-label="Reproduzir vídeo institucional: Conheça São Tomé"
                                    >
                                        <img
                                            src={posterSrc}
                                            alt="Vista panorâmica da cidade e paisagem sertaneja de São Tomé/RN"
                                            onError={() => setImgError(true)}
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full object-cover"
                                        />
                                        <span
                                            className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent transition-opacity"
                                            aria-hidden="true"
                                        />

                                        {/* Botão central de reprodução */}
                                        <span
                                            className="absolute inset-0 flex items-center justify-center"
                                            aria-hidden="true"
                                        >
                                            <span className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full bg-[#fdb913] group-hover:bg-[#e5a60d] text-slate-950 shadow-xl border-4 border-white transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none">
                                                <Play size={28} className="ml-1 fill-current" />
                                            </span>
                                        </span>

                                        {/* Legenda da capa estática */}
                                        <span className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 text-white">
                                            <span className="text-sm sm:text-base font-bold drop-shadow">
                                                Vídeo Institucional • Paisagens, cultura e história de São Tomé
                                            </span>
                                            <span className="shrink-0 px-3 py-1 rounded-full bg-slate-900/80 border border-white/25 text-xs font-semibold">
                                                Reprodução sob demanda
                                            </span>
                                        </span>
                                    </button>
                                ) : (
                                    <video
                                        src={videoSrc}
                                        poster={posterSrc}
                                        controls
                                        autoPlay
                                        playsInline
                                        preload="metadata"
                                        className="w-full h-full object-contain bg-black"
                                        aria-label="Vídeo institucional do município de São Tomé, Rio Grande do Norte"
                                    >
                                        Seu navegador não suporta a reprodução de vídeo HTML5.
                                    </video>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Coluna Direita: História, Cultura, Símbolos e Slogan Institucional */}
                    <div className="lg:col-span-5 space-y-5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-extrabold text-[#00557d] uppercase tracking-wider shadow-2xs">
                            <Landmark size={13} aria-hidden="true" />
                            <span>Identidade Municipal • {slogan}</span>
                        </div>

                        <h2
                            id="conheca-saotome-heading"
                            className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight"
                        >
                            Conheça <span className="text-[#00557d]">São Tomé</span>
                        </h2>

                        <p className="text-slate-700 text-base leading-relaxed">
                            Localizado na região do Potengi, a 112 km de Natal, São Tomé preserva a força da cultura sertaneja potiguar, seu patrimônio histórico, seus símbolos cívicos e as tradições do povo são-tomeense.
                        </p>

                        {/* Grade de marcos históricos e culturais */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            {MARCOS_MUNICIPIO.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={item.label}
                                        className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-[#e8f6fd] text-[#00557d] flex items-center justify-center shrink-0 mt-0.5">
                                            <Icon size={16} aria-hidden="true" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-900">
                                                {item.label}
                                            </div>
                                            <div className="text-xs text-slate-600 mt-0.5">
                                                {item.valor}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Chamada para reprodução e links para História, Símbolos e Cultura */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            {!isPlaying && (
                                <button
                                    type="button"
                                    onClick={() => setIsPlaying(true)}
                                    className="inline-flex items-center gap-2 min-h-[46px] px-5 py-2.5 rounded-xl bg-[#fdb913] hover:bg-[#e5a60d] text-slate-950 font-bold text-sm shadow-civic-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00557d] focus-visible:ring-offset-2"
                                >
                                    <Play size={16} className="fill-current" aria-hidden="true" />
                                    <span>Assistir vídeo institucional</span>
                                </button>
                            )}

                            <Link
                                href="/a-prefeitura/historia"
                                className="inline-flex items-center gap-2 min-h-[46px] px-5 py-2.5 rounded-xl bg-white hover:bg-[#006494] text-[#00557d] hover:text-white border border-slate-300 hover:border-[#006494] font-bold text-sm shadow-civic-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00557d] focus-visible:ring-offset-2"
                            >
                                <span>História da Cidade</span>
                                <ArrowRight size={15} aria-hidden="true" />
                            </Link>

                            <Link
                                href="/municipio/simbolos"
                                className="inline-flex items-center gap-1.5 min-h-[46px] px-4 py-2.5 rounded-xl bg-white hover:bg-[#e8f6fd] text-slate-800 border border-slate-300 font-bold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00557d] focus-visible:ring-offset-2"
                            >
                                <span>Símbolos e Cultura</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
