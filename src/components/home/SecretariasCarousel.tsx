"use client";
import { useRef } from "react";
import Link from "next/link";
import {
    UserCheck,
    ChevronLeft,
    ChevronRight,
    Building2,
    ArrowRight,
} from "lucide-react";
import { getSecretariaIcon } from "@/lib/icons";

type Secretaria = {
    id: string;
    nome: string;
    slug: string;
    descricao: string;
    secretario: string | null;
};

export default function SecretariasCarousel({
    secretarias,
}: {
    secretarias: Secretaria[];
}) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo =
                direction === "left"
                    ? scrollLeft - clientWidth / 1.5
                    : scrollLeft + clientWidth / 1.5;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
        }
    };

    return (
        <section className="py-20 bg-white border-t border-slate-200/80">
            <div className="max-w-[1240px] mx-auto px-6">
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
                    <div className="space-y-3">
                        <div className="section-eyebrow">
                            <Building2 size={14} className="text-[#01b0ef]" />
                            <span>Estrutura Organizacional</span>
                        </div>
                        <h2 className="section-title">
                            Secretarias e <span className="text-[#01b0ef]">Órgãos Municipais</span>
                        </h2>
                        <p className="text-slate-600 text-sm">
                            Navegue pelas pastas da administração municipal e consulte suas atribuições e gestores.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => scroll("left")}
                            className="w-10 h-10 rounded-xl bg-white text-slate-700 border border-slate-200 flex items-center justify-center hover:bg-[#01b0ef] hover:text-white hover:border-[#01b0ef] transition-all shadow-civic-sm"
                            aria-label="Anterior"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            className="w-10 h-10 rounded-xl bg-white text-slate-700 border border-slate-200 flex items-center justify-center hover:bg-[#01b0ef] hover:text-white hover:border-[#01b0ef] transition-all shadow-civic-sm"
                            aria-label="Próximo"
                        >
                            <ChevronRight size={18} />
                        </button>
                        <Link
                            href="/secretarias"
                            className="ml-2 hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-[#fdb913] hover:brightness-105 px-4 py-2.5 rounded-xl transition-all shadow-xs"
                        >
                            <span>Ver todas</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* Carousel */}
                <div
                    ref={scrollRef}
                    className="flex gap-5 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory"
                >
                    {secretarias.map((sec) => {
                        const nomeCurto = sec.nome
                            .replace("Secretaria Municipal de ", "")
                            .replace("Secretaria Municipal da ", "")
                            .replace("Secretaria do ", "");
                        const Icone = getSecretariaIcon(sec.nome);

                        return (
                            <Link
                                key={sec.id}
                                href={`/secretarias/${sec.slug}`}
                                className="snap-start shrink-0 w-[280px] group block"
                            >
                                <div className="h-full bg-[#f4fbff] hover:bg-white rounded-2xl p-6 shadow-civic-sm border border-[#01b0ef]/20 hover:border-[#01b0ef] hover:shadow-civic-lg flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#01b0ef]/25 group-hover:heraldic-stripe transition-all" />

                                    <div>
                                        <div className="flex items-start gap-3.5 mb-4">
                                            <div className="w-11 h-11 bg-white border border-[#01b0ef]/25 text-[#01b0ef] rounded-xl flex items-center justify-center group-hover:bg-[#01b0ef] group-hover:text-white group-hover:border-[#01b0ef] transition-colors shrink-0 shadow-xs">
                                                <Icone size={20} />
                                            </div>
                                            <h3 className="font-heading text-base font-bold text-slate-900 group-hover:text-[#01b0ef] leading-snug line-clamp-2 transition-colors">
                                                {nomeCurto}
                                            </h3>
                                        </div>
                                        <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 mb-5">
                                            {sec.descricao ||
                                                "Acesse para consultar competências, endereço, telefone e serviços desta secretaria."}
                                        </p>
                                    </div>

                                    <div className="pt-3.5 border-t border-[#01b0ef]/15 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <UserCheck
                                                className="text-[#01b0ef] shrink-0"
                                                size={14}
                                            />
                                            <div className="min-w-0">
                                                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    Titular da Pasta
                                                </span>
                                                <span className="block text-xs font-semibold text-slate-700 truncate">
                                                    {sec.secretario || "Em atualização"}
                                                </span>
                                            </div>
                                        </div>
                                        <ArrowRight
                                            size={14}
                                            className="text-[#01b0ef] group-hover:translate-x-0.5 transition-all shrink-0"
                                        />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <style>{`
                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>
            </div>
        </section>
    );
}
