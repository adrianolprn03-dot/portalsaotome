"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search,
    ShieldCheck,
    ArrowRight,
    FileText,
    Headset,
    Building2,
    Sparkles,
    MapPin,
    Users,
    Calendar,
    Clock,
} from "lucide-react";

const quickTags = [
    { label: "Portal da Transparência", href: "/transparencia" },
    { label: "Licitações e Editais", href: "/transparencia/licitacoes" },
    { label: "Despesas e Receitas", href: "/transparencia/despesas" },
    { label: "Servidores e Folha", href: "/transparencia/servidores" },
    { label: "Pedido e-SIC (LAI)", href: "/servicos/esic" },
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
        <section className="relative w-full min-h-[580px] lg:min-h-[640px] flex flex-col justify-between overflow-hidden bg-[#071E3D]">
            {/* Background Video com fallback para imagem */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {!videoError ? (
                    <video
                        src="/video_saotome.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        onError={() => setVideoError(true)}
                        className="w-full h-full object-cover opacity-55 scale-105"
                    />
                ) : (
                    <img
                        src="/images/hero-bg.jpg"
                        alt="Vista aérea de São Tomé"
                        className="w-full h-full object-cover opacity-50 scale-105"
                    />
                )}
                <div className="absolute inset-0 hero-gradient" />
                <div className="absolute inset-0 civic-grid-dark opacity-60" />
            </div>

            {/* Ambient Glows */}
            <div className="absolute top-12 left-1/4 w-96 h-96 rounded-full bg-primary-500/20 blur-[120px] pointer-events-none z-0" />
            <div className="absolute bottom-12 right-1/4 w-80 h-80 rounded-full bg-secondary-500/15 blur-[100px] pointer-events-none z-0" />

            {/* Main Hero Content */}
            <div className="relative z-10 max-w-[1240px] w-full mx-auto px-6 pt-14 pb-12 md:pt-20 md:pb-16 flex-1 flex flex-col justify-center">
                <div className="max-w-3xl space-y-6">
                    {/* Official Eyebrow Badge */}
                    <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-secondary-400 animate-pulse" />
                        <span>Portal Institucional Oficial • São Tomé / RN</span>
                        <span className="hidden sm:inline-flex items-center gap-1 pl-2 border-l border-white/20 text-secondary-400 font-mono text-[11px]">
                            <ShieldCheck size={13} /> PNTP 2026
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="font-heading text-3xl sm:text-5xl lg:text-[54px] font-extrabold text-white tracking-tight leading-[1.08]">
                        Gestão transparente e serviços digitais para o{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-sky-300 to-secondary-400">
                            cidadão são-tomeense.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-slate-200/90 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                        Acesse serviços públicos, acompanhe a execução orçamentária em tempo real, consulte licitações, atos normativos e utilize a Ouvidoria Municipal.
                    </p>

                    {/* Hero Command Search Bar */}
                    <form
                        onSubmit={handleSearch}
                        className="relative max-w-2xl pt-2"
                        role="search"
                        aria-label="Pesquisa rápida no portal"
                    >
                        <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-2xl shadow-black/25 border border-white/40 focus-within:ring-4 focus-within:ring-primary-500/30 transition-all">
                            <div className="pl-4 pr-3 text-slate-400">
                                <Search size={20} className="text-primary-600" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="O que você procura? Ex: licitações, folha de pagamento, diárias, leis..."
                                className="w-full py-3 pr-4 text-sm sm:text-base font-medium text-slate-800 placeholder:text-slate-400 bg-transparent outline-none"
                            />
                            <button
                                type="submit"
                                className="shrink-0 bg-[#071E3D] hover:bg-primary-600 text-white font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-sm"
                            >
                                <span>Consultar</span>
                                <ArrowRight size={15} className="text-secondary-400" />
                            </button>
                        </div>
                    </form>

                    {/* Quick Access Pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-xs font-semibold text-secondary-400 flex items-center gap-1.5 mr-1">
                            <Sparkles size={13} />
                            Mais acessados:
                        </span>
                        {quickTags.map((tag) => (
                            <Link
                                key={tag.href}
                                href={tag.href}
                                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white hover:text-[#071E3D] text-slate-100 border border-white/15 backdrop-blur-sm transition-all"
                            >
                                {tag.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Municipal Indicators Bar */}
            <div className="relative z-10 border-t border-white/10 bg-[#041328]/80 backdrop-blur-md">
                <div className="max-w-[1240px] mx-auto px-6 py-4 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {stats.map((stat, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-secondary-400 shrink-0">
                                <stat.icon size={17} />
                            </div>
                            <div>
                                <div className="text-[11px] text-slate-400 font-medium leading-none mb-1">
                                    {stat.label}
                                </div>
                                <div className="text-xs sm:text-sm font-bold font-mono text-white">
                                    {stat.value}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
