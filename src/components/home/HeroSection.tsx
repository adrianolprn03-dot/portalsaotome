"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search,
    ShieldCheck,
    ArrowRight,
    Headset,
    MapPin,
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize2,
    X,
} from "lucide-react";

export default function HeroSection() {
    const [videoError, setVideoError] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [progress, setProgress] = useState(0);
    const [isCinemaOpen, setIsCinemaOpen] = useState(false);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const router = useRouter();

    useEffect(() => {
        const prefersReduced =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced && videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, []);

    const closeCinema = useCallback(() => {
        setIsCinemaOpen(false);
        if (videoRef.current && !videoError) {
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
        }
    }, [videoError]);

    useEffect(() => {
        if (!isCinemaOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeCinema();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isCinemaOpen, closeCinema]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            router.push("/transparencia");
            return;
        }
        router.push(`/transparencia?q=${encodeURIComponent(searchQuery.trim())}`);
    };

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            video.play().catch(() => {});
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
        setIsMuted(video.muted);
    };

    const openCinema = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
        setIsCinemaOpen(true);
    };

    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (!video || !video.duration) return;
        setProgress((video.currentTime / video.duration) * 100);
    };

    return (
        <section
            className="relative w-full overflow-hidden border-b border-[#01b0ef]/20"
            style={{
                background:
                    "radial-gradient(ellipse 65% 75% at 76% 48%, rgba(1, 176, 239, 0.11) 0%, rgba(253, 185, 19, 0.05) 44%, rgba(255, 255, 255, 0) 78%), linear-gradient(180deg, #ffffff 0%, #f6fcff 56%, #eefaff 100%)",
            }}
        >
            {/* Two-Tone Heraldic Signature Line */}
            <div className="h-1 w-full heraldic-stripe" />

            {/* Continuous Edge-to-Edge Daylight Grid */}
            <div
                aria-hidden="true"
                className="absolute inset-0 civic-grid-pattern opacity-45 pointer-events-none"
            />

            {/* Main Asymmetric Stage */}
            <div className="relative z-10 max-w-[1320px] mx-auto px-5 sm:px-8 py-10 sm:py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                    {/* Left Column: Monumental Typography, Search Command & Dual CTAs (6 cols) */}
                    <div className="lg:col-span-6 min-w-0 w-full space-y-6 sm:space-y-7 max-w-[540px]">
                        {/* Headline (Direct Authority, Clean Line Rhythm, Zero Overlap) */}
                        <h1 className="font-heading text-[26px] sm:text-[38px] lg:text-[36px] xl:text-[42px] font-extrabold text-slate-900 tracking-[-0.025em] leading-[1.22]">
                            <span className="block mb-1">
                                <span className="relative z-0 inline-block text-[#01b0ef] pb-1.5">
                                    São Tomé
                                    <span
                                        aria-hidden="true"
                                        className="absolute left-0 right-0 bottom-0.5 h-[7px] bg-[#fdb913]/90 rounded-full -z-10"
                                    />
                                </span>
                                <span className="text-slate-900">,</span>
                            </span>
                            <span className="block">Construindo Hoje,</span>
                            <span className="block">o Futuro da nossa gente!</span>
                        </h1>

                        {/* Unified Search Command Bar */}
                        <form
                            onSubmit={handleSearch}
                            className="relative max-w-[510px]"
                            role="search"
                            aria-label="Pesquisa rápida no portal"
                        >
                            <label htmlFor="hero-portal-search" className="sr-only">
                                Pesquisar no Portal da Transparência
                            </label>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white rounded-2xl p-1.5 shadow-civic-lg border-2 border-[#01b0ef]/25 focus-within:border-[#01b0ef] transition-colors">
                                <div className="flex items-center flex-1 min-w-0 pl-3">
                                    <Search size={19} className="text-[#01b0ef] shrink-0 mr-2.5" aria-hidden="true" />
                                    <input
                                        id="hero-portal-search"
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Buscar licitações, folha, diárias, leis..."
                                        className="w-full min-w-0 py-2.5 pr-2 text-sm sm:text-[15px] font-medium text-slate-900 placeholder:text-slate-500 bg-transparent outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="shrink-0 min-h-[44px] bg-[#01b0ef] hover:bg-[#0098d4] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01b0ef] focus-visible:ring-offset-2"
                                >
                                    <span>Consultar</span>
                                    <ArrowRight size={15} aria-hidden="true" />
                                </button>
                            </div>
                        </form>

                        {/* Primary Dual CTAs */}
                        <div className="flex flex-wrap items-center gap-3 pt-0.5">
                            <Link
                                href="/transparencia"
                                className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-3 rounded-xl bg-[#fdb913] hover:bg-[#e5a60d] text-slate-900 font-bold text-xs sm:text-sm shadow-civic-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fdb913] focus-visible:ring-offset-2"
                            >
                                <ShieldCheck size={17} aria-hidden="true" />
                                <span>Portal da Transparência</span>
                            </Link>
                            <Link
                                href="/servicos/ouvidoria"
                                className="group inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-3 rounded-xl bg-white hover:bg-[#01b0ef] text-slate-800 hover:text-white border border-[#01b0ef]/35 hover:border-[#01b0ef] font-bold text-xs sm:text-sm shadow-civic-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01b0ef] focus-visible:ring-offset-2"
                            >
                                <Headset size={17} className="text-[#01b0ef] group-hover:text-white transition-colors" aria-hidden="true" />
                                <span>Ouvidoria &amp; e-SIC</span>
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Widescreen Architectural Cinema Stage (6 cols — 100% Unobstructed Video) */}
                    <div className="lg:col-span-6 min-w-0 w-full">
                        <div className="relative bg-white rounded-[1.75rem] p-2 sm:p-3 border border-[#01b0ef]/25 shadow-civic-xl">
                            {/* Geometric Brand Registration Corner Accent */}
                            <div
                                aria-hidden="true"
                                className="flex items-center gap-1.5 mb-2 sm:mb-2.5 px-1"
                            >
                                <span className="h-1.5 w-10 rounded-full bg-[#01b0ef]" />
                                <span className="h-1.5 w-4 rounded-full bg-[#fdb913]" />
                                <span className="ml-auto text-[11px] font-semibold tracking-wide text-slate-600">
                                    Prefeitura Municipal • RN
                                </span>
                            </div>

                            {/* True 16:9 Daylight Video Viewport (Zero Overlay Text or Badges on Video) */}
                            <div className="relative aspect-video w-full rounded-[1.25rem] overflow-hidden bg-[#eefaff] border border-slate-200/70">
                                {!videoError ? (
                                    <video
                                        ref={videoRef}
                                        src="/video_saotome.mp4"
                                        poster="/images/hero-bg.jpg"
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        onTimeUpdate={handleTimeUpdate}
                                        onError={() => setVideoError(true)}
                                        className="w-full h-full object-cover"
                                        aria-label="Vídeo panorâmico de São Tomé, Rio Grande do Norte"
                                    />
                                ) : (
                                    <img
                                        src="/images/hero-bg.jpg"
                                        alt="Vista panorâmica do município de São Tomé, Rio Grande do Norte"
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>

                            {/* Linear Progress Track Outside the Footage */}
                            {!videoError && (
                                <div
                                    aria-hidden="true"
                                    className="mt-2 h-[3px] w-full rounded-full bg-[#e6f7ff] overflow-hidden"
                                >
                                    <div
                                        className="h-full bg-[#fdb913] transition-[width] duration-200 ease-linear motion-reduce:transition-none"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            )}

                            {/* Clean Control & Origin Strip Below Video */}
                            <div className="mt-2.5 px-1.5 sm:px-2 pb-0.5 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-7 h-7 rounded-lg bg-[#01b0ef]/10 text-[#01b0ef] flex items-center justify-center shrink-0">
                                        <MapPin size={14} aria-hidden="true" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-900 truncate">
                                            São Tomé • Rio Grande do Norte
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    {!videoError && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={togglePlay}
                                                aria-label={isPlaying ? "Pausar vídeo do banner" : "Reproduzir vídeo do banner"}
                                                title={isPlaying ? "Pausar vídeo" : "Reproduzir vídeo"}
                                                className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#f4fbff] hover:bg-[#01b0ef] text-slate-700 hover:text-white border border-[#01b0ef]/20 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01b0ef]"
                                            >
                                                {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={toggleMute}
                                                aria-label={isMuted ? "Ativar som do vídeo" : "Silenciar vídeo"}
                                                title={isMuted ? "Ativar som" : "Silenciar"}
                                                className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#f4fbff] hover:bg-[#01b0ef] text-slate-700 hover:text-white border border-[#01b0ef]/20 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01b0ef]"
                                            >
                                                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={openCinema}
                                                aria-label="Assistir vídeo em tela expandida"
                                                title="Tela expandida"
                                                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-[#fdb913] hover:bg-[#e5a60d] text-slate-900 font-bold text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fdb913]"
                                            >
                                                <Maximize2 size={13} aria-hidden="true" />
                                                <span className="hidden sm:inline">Expandir</span>
                                            </button>
                                        </>
                                    )}

                                    <Link
                                        href="/a-prefeitura"
                                        className="inline-flex items-center gap-1 h-9 px-3 rounded-xl bg-[#01b0ef]/10 hover:bg-[#01b0ef] text-[#007bb0] hover:text-white font-bold text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01b0ef]"
                                    >
                                        <span>A Prefeitura</span>
                                        <ArrowRight size={13} aria-hidden="true" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Accessible Expanded Video Modal */}
            {isCinemaOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Vídeo institucional de São Tomé"
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-950/90 backdrop-blur-md"
                    onClick={closeCinema}
                >
                    <button
                        type="button"
                        onClick={closeCinema}
                        className="absolute top-5 right-5 w-11 h-11 flex items-center justify-center bg-[#fdb913] hover:bg-[#e5a60d] text-slate-900 rounded-full shadow-lg transition-colors cursor-pointer z-[110] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        aria-label="Fechar vídeo expandido"
                    >
                        <X size={22} />
                    </button>

                    <div
                        className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border-2 border-[#01b0ef]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <video
                            src="/video_saotome.mp4"
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
