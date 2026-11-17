"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search,
    ShieldCheck,
    ArrowRight,
    Sparkles,
    MapPin,
    Users,
    Calendar,
    Clock,
    Headset,
    Play,
} from "lucide-react";

const quickTags = [
    { label: "Licitações e Editais", href: "/transparencia/licitacoes" },
    { label: "Despesas e Receitas", href: "/transparencia/despesas" },
    { label: "Servidores e Folha", href: "/transparencia/servidores" },
    { label: "Pedido e-SIC (LAI)", href: "/servicos/esic" },
    { label: "Ouvidoria", href: "/servicos/ouvidoria" },
    { label: "Medicamentos SUS", href: "/transparencia/medicamentos-sus" },
];

const stats = [
    { icon: Users, label: "População Estimada", value: "10.827 hab." },
    { icon: MapPin, label: "Área Territorial", value: "862,6 km²" },
    { icon: Calendar, label: "Emancipação Política", value: "1928" },
    { icon: Clock, label: "Atendimento Presencial", value: "07h às 13h" },
];

export default function HeroSection() {
    const [videoError, setVideoError] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            router.push("/transparencia");
            return;
        }
        router.push(`/transparencia?q=${encodeURIComponent(searchQuery.trim())}`);
    };

    return (
        <section className="relative w-full overflow-hidden hero-gradient border-b border-[#01b0ef]/20">
            {/* Top Brand Accent Stripe */}
            <div className="h-1.5 w-full heraldic-stripe" />

            {/* Subtle Sunlit Ambient Orbs & Dot Grid */}
            <div className="absolute inset-0 civic-grid-pattern opacity-80 pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-[440px] h-[440px] rounded-full bg-[#01b0ef]/15 blur-[100px] pointer-events-none" />
            <div className="absolute top-12 right-0 w-[420px] h-[420px] rounded-full bg-[#fdb913]/20 blur-[110px] pointer-events-none" />

            {/* Main Split Showcase */}
            <div className="relative z-10 max-w-[1240px] mx-auto px-6 pt-12 pb-12 md:pt-16 md:pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                    {/* Left Column: Editorial Headline + Search Command (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Eyebrow Badges */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#01b0ef]/30 text-slate-800 text-xs font-bold shadow-civic-sm">
                                <span className="w-2 h-2 rounded-full bg-[#fdb913] animate-pulse" />
                                <span>Portal Oficial • São Tomé / RN</span>
                            </span>
                            <Link
                                href="/transparencia/radar"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fdb913] text-slate-900 text-xs font-extrabold shadow-xs hover:brightness-105 transition-all"
                            >
                                <ShieldCheck size={14} />
                                <span>PNTP 2026</span>
                            </Link>
                        </div>

                        {/* Headline */}
                        <h1 className="font-heading text-3xl sm:text-5xl lg:text-[50px] font-extrabold text-slate-900 tracking-tight leading-[1.08]">
                            Gestão aberta e serviços digitais para{" "}
                            <span className="relative inline-block text-[#01b0ef]">
                                São Tomé
                                <span className="absolute left-0 right-0 -bottom-1 h-2 bg-[#fdb913]/85 rounded-full -z-10" />
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
                            Consulte receitas, despesas, licitações, contratos e atos oficiais em tempo real, ou acesse os canais digitais de atendimento ao cidadão.
                        </p>

                        {/* Floating Command Search Bar */}
                        <form
                            onSubmit={handleSearch}
                            className="relative max-w-2xl"
                            role="search"
                            aria-label="Pesquisa rápida no portal"
                        >
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white rounded-2xl p-2 shadow-[0_20px_50px_-14px_rgba(1,176,239,0.28)] border-2 border-[#01b0ef]/25 focus-within:border-[#01b0ef] transition-all">
                                <div className="flex items-center flex-1 pl-3">
                                    <Search size={20} className="text-[#01b0ef] shrink-0 mr-3" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="O que você procura? Ex: licitações, folha, diárias, leis..."
                                        className="w-full py-2.5 pr-3 text-sm sm:text-base font-medium text-slate-800 placeholder:text-slate-400 bg-transparent outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="shrink-0 bg-[#01b0ef] hover:bg-[#0098d4] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <span>Consultar</span>
                                    <ArrowRight size={15} />
                                </button>
                            </div>
                        </form>

                        {/* Primary Dual CTAs */}
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                            <Link
                                href="/transparencia"
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#fdb913] hover:brightness-105 text-slate-900 font-bold text-xs sm:text-sm shadow-civic-sm transition-all"
                            >
                                <ShieldCheck size={16} />
                                <span>Portal da Transparência</span>
                            </Link>
                            <Link
                                href="/servicos/ouvidoria"
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-[#01b0ef] text-slate-800 hover:text-white border border-[#01b0ef]/30 font-bold text-xs sm:text-sm shadow-civic-sm transition-all"
                            >
                                <Headset size={16} className="text-[#01b0ef] group-hover:text-white" />
                                <span>Ouvidoria &amp; e-SIC</span>
                            </Link>
                        </div>

                        {/* Quick Access Pills */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mr-1">
                                <Sparkles size={13} className="text-[#fdb913]" />
                                Mais acessados:
                            </span>
                            {quickTags.map((tag) => (
                                <Link
                                    key={tag.href}
                                    href={tag.href}
                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white hover:bg-[#01b0ef] text-slate-700 hover:text-white border border-slate-200 hover:border-[#01b0ef] shadow-xs transition-all"
                                >
                                    {tag.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Bright Daylight Video Showcase Frame (5 cols) */}
                    <div className="lg:col-span-5">
                        <div className="relative">
                            {/* Decorative Bright Backing Shape */}
                            <div className="absolute -inset-3 rounded-[2.25rem] bg-gradient-to-tr from-[#01b0ef]/25 via-[#01b0ef]/10 to-[#fdb913]/25 blur-lg pointer-events-none" />

                            {/* Framed Video Card (Full Daylight - Zero Dark Scrim) */}
                            <div className="relative bg-white p-2.5 rounded-[2rem] shadow-[0_24px_60px_-15px_rgba(1,176,239,0.28)] border-2 border-white">
                                <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/4.2] w-full rounded-[1.5rem] overflow-hidden bg-[#eefaff]">
                                    {!videoError ? (
                                        <video
                                            src="/video_saotome.mp4"
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            onError={() => setVideoError(true)}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <img
                                            src="/images/hero-bg.jpg"
                                            alt="Vista aérea de São Tomé"
                                            className="w-full h-full object-cover"
                                        />
                                    )}

                                    {/* Floating Top Pill */}
                                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[11px] font-bold shadow-md">
                                            <MapPin size={13} className="text-[#01b0ef]" />
                                            <span>São Tomé • RN</span>
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fdb913] text-slate-900 text-[11px] font-extrabold shadow-md">
                                            <Play size={11} className="fill-current" />
                                            <span>Ao Vivo</span>
                                        </span>
                                    </div>

                                    {/* Bottom Floating Info Bar */}
                                    <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-lg border border-[#01b0ef]/20 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-[#01b0ef]">
                                                Atendimento ao Cidadão
                                            </p>
                                            <p className="text-xs font-extrabold text-slate-900 truncate">
                                                Serviços 100% Online • Lei 12.527/2011
                                            </p>
                                        </div>
                                        <Link
                                            href="/a-prefeitura"
                                            className="shrink-0 w-9 h-9 rounded-xl bg-[#01b0ef] hover:bg-[#0098d4] text-white flex items-center justify-center transition-colors shadow-xs"
                                            aria-label="Conhecer a Prefeitura"
                                        >
                                            <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Luminous Municipal Indicators Strip */}
            <div className="relative z-10 border-t border-[#01b0ef]/15 bg-white/90 backdrop-blur-md">
                <div className="max-w-[1240px] mx-auto px-6 py-4 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {stats.map((stat, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#01b0ef]/10 border border-[#01b0ef]/20 flex items-center justify-center text-[#01b0ef] shrink-0">
                                <stat.icon size={18} />
                            </div>
                            <div>
                                <div className="text-[11px] text-slate-500 font-semibold leading-none mb-1">
                                    {stat.label}
                                </div>
                                <div className="text-xs sm:text-sm font-extrabold font-mono text-slate-900 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#fdb913]" />
                                    <span>{stat.value}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
