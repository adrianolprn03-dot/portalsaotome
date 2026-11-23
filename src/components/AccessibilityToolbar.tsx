"use client";
import { useAccessibility } from "./AccessibilityProvider";
import {
    Contrast,
    Minus,
    Plus,
    RotateCcw,
    Network,
    Accessibility,
    ShieldCheck,
} from "lucide-react";
import Link from "next/link";

export default function AccessibilityToolbar() {
    const { toggleHighContrast, increaseFontSize, decreaseFontSize, resetFontSize } =
        useAccessibility();

    return (
        <div className="bg-[#01b0ef] text-white h-9 w-full border-b border-white/20 flex items-center justify-between overflow-x-auto no-scrollbar relative z-[100] px-4 md:px-8 lg:px-12 text-xs">
            <div className="flex items-center gap-6 shrink-0">
                {/* Identificação Oficial */}
                <div className="flex items-center gap-2 text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#fdb913] shrink-0" />
                    <span className="tracking-wide uppercase font-heading text-white">
                        São Tomé • RN
                    </span>
                    <span className="hidden sm:inline text-white/85 font-medium">
                        | Portal Oficial
                    </span>
                </div>

                {/* Atalhos e-MAG */}
                <div className="hidden xl:flex items-center gap-4 text-[11px] text-white/95 border-l border-white/25 pl-6 font-medium">
                    <a
                        href="#conteudo-principal"
                        accessKey="1"
                        className="hover:text-[#fdb913] transition-colors flex items-center gap-1.5"
                    >
                        <span>Conteúdo</span>
                        <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white/20 rounded text-white">
                            1
                        </kbd>
                    </a>
                    <a
                        href="#menu-principal"
                        accessKey="2"
                        className="hover:text-[#fdb913] transition-colors flex items-center gap-1.5"
                    >
                        <span>Menu</span>
                        <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white/20 rounded text-white">
                            2
                        </kbd>
                    </a>
                    <a
                        href="#busca"
                        accessKey="3"
                        className="hover:text-[#fdb913] transition-colors flex items-center gap-1.5"
                    >
                        <span>Busca</span>
                        <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white/20 rounded text-white">
                            3
                        </kbd>
                    </a>
                </div>
            </div>

            {/* Controles de Acessibilidade e Links */}
            <div className="flex items-center gap-3 md:gap-4 shrink-0 ml-4">
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={toggleHighContrast}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/25 text-white transition-all text-[11px] font-bold"
                        title="Alternar Alto Contraste"
                        aria-label="Alternar Alto Contraste"
                    >
                        <Contrast size={13} className="text-[#fdb913]" />
                        <span className="hidden sm:inline">Contraste</span>
                    </button>

                    <div className="flex items-center bg-white/15 rounded-md p-0.5 border border-white/20">
                        <button
                            onClick={decreaseFontSize}
                            className="w-6 h-6 flex items-center justify-center hover:bg-white/25 rounded text-white transition-colors"
                            title="Diminuir Fonte (A-)"
                            aria-label="Diminuir Fonte"
                        >
                            <Minus size={12} />
                        </button>
                        <button
                            onClick={resetFontSize}
                            className="px-1.5 h-6 flex items-center justify-center hover:bg-white/25 rounded text-[10px] font-mono font-bold text-white transition-colors"
                            title="Tamanho Padrão (A)"
                            aria-label="Tamanho Padrão de Fonte"
                        >
                            <RotateCcw size={11} />
                        </button>
                        <button
                            onClick={increaseFontSize}
                            className="w-6 h-6 flex items-center justify-center hover:bg-white/25 rounded text-white transition-colors"
                            title="Aumentar Fonte (A+)"
                            aria-label="Aumentar Fonte"
                        >
                            <Plus size={12} />
                        </button>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-3.5 border-l border-white/25 pl-4 text-[11px] font-bold">
                    <Link
                        href="/transparencia/radar"
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fdb913] text-slate-900 hover:brightness-105 transition-all"
                    >
                        <ShieldCheck size={12} />
                        <span>PNTP 2026</span>
                    </Link>
                    <Link
                        href="/mapa-do-site"
                        className="flex items-center gap-1.5 text-white hover:text-[#fdb913] transition-colors"
                    >
                        <Network size={13} />
                        <span>Mapa do Site</span>
                    </Link>
                    <Link
                        href="/transparencia/acessibilidade"
                        className="flex items-center gap-1.5 text-white hover:text-[#fdb913] transition-colors"
                    >
                        <Accessibility size={13} />
                        <span>Acessibilidade</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
