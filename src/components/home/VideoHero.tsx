"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, X, ArrowRight } from "lucide-react";

export default function VideoHero() {
    const [isOpen, setIsOpen] = useState(false);
    const [imgError, setImgError] = useState(false);

    const videoSrc = "/video_saotome.mp4";

    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen]);

    return (
        <section className="relative w-full py-14 md:py-20 bg-[#eefaff] border-y border-[#01b0ef]/20 overflow-hidden">
            <div className="max-w-[1240px] mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    {/* Left: Interactive 16:9 Invitation Frame (Static High-Luminance Poster) */}
                    <div className="lg:col-span-7">
                        <div className="bg-white p-2.5 rounded-[1.75rem] border border-[#01b0ef]/25 shadow-civic-lg">
                            <button
                                type="button"
                                onClick={() => setIsOpen(true)}
                                className="group relative block w-full aspect-video rounded-[1.25rem] overflow-hidden bg-slate-100 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#01b0ef]"
                                aria-label="Assistir vídeo institucional completo de São Tomé"
                            >
                                {!imgError ? (
                                    <img
                                        src="/images/hero-slider-2.jpg"
                                        alt="Paisagem de São Tomé no coração do Potengi"
                                        onError={() => setImgError(true)}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <img
                                        src="/images/hero-bg.jpg"
                                        alt="Vista de São Tomé, Rio Grande do Norte"
                                        className="w-full h-full object-cover"
                                    />
                                )}

                                {/* Subtle Luminous Center Play Affordance */}
                                <span className="absolute inset-0 flex items-center justify-center bg-slate-900/10 group-hover:bg-slate-900/20 transition-colors motion-reduce:transition-none">
                                    <span className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full bg-[#fdb913] group-hover:bg-[#e5a60d] text-slate-900 shadow-xl border-4 border-white transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none">
                                        <Play size={28} className="ml-1 fill-current" aria-hidden="true" />
                                    </span>
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Right: Editorial Narrative & Direct Actions */}
                    <div className="lg:col-span-5 space-y-5">
                        <div className="h-1.5 w-20 rounded-full heraldic-stripe" aria-hidden="true" />

                        <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.12] text-balance">
                            Conheça as riquezas e a história de{" "}
                            <span className="text-[#01b0ef]">São Tomé</span>
                        </h2>

                        <p className="text-slate-600 text-base leading-relaxed font-normal">
                            Um olhar especial sobre a nossa cultura, o trabalho da nossa gente e o desenvolvimento do nosso município no coração do Potengi.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                            <button
                                type="button"
                                onClick={() => setIsOpen(true)}
                                className="inline-flex items-center gap-2 min-h-[46px] px-6 py-3 rounded-xl bg-[#fdb913] hover:bg-[#e5a60d] text-slate-900 font-bold text-sm shadow-civic-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fdb913] focus-visible:ring-offset-2"
                            >
                                <Play size={16} className="fill-current" aria-hidden="true" />
                                <span>Assistir vídeo completo</span>
                            </button>
                            <Link
                                href="/a-prefeitura/historia"
                                className="inline-flex items-center gap-2 min-h-[46px] px-5 py-3 rounded-xl bg-white hover:bg-[#01b0ef] text-slate-800 hover:text-white border border-[#01b0ef]/30 hover:border-[#01b0ef] font-bold text-sm shadow-civic-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01b0ef] focus-visible:ring-offset-2"
                            >
                                <span>História do Município</span>
                                <ArrowRight size={15} aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Modal */}
            {isOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Vídeo institucional completo de São Tomé"
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-950/90 backdrop-blur-md"
                    onClick={() => setIsOpen(false)}
                >
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-[#fdb913] hover:bg-[#e5a60d] text-slate-900 rounded-full transition-colors cursor-pointer z-[110] shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        aria-label="Fechar vídeo"
                    >
                        <X size={24} />
                    </button>

                    <div
                        className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border-2 border-[#01b0ef]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <video
                            src={videoSrc}
                            controls
                            autoPlay
                            playsInline
                            className="w-full h-full"
                        />
                    </div>
                </div>
            )}
        </section>
    );
}
