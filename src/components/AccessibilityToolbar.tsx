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
        <div className="bg-[#071E3D] text-slate-300 h-9 w-full border-b border-white/10 flex items-center justify-between overflow-x-auto no-scrollbar relative z-[100] px-4 md:px-8 lg:px-12 text-xs">
            <div className="flex items-center gap-6 shrink-0">
                {/* Identificação Oficial */}
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-secondary-500 shrink-0" />
                    <span className="tracking-wide uppercase font-heading font-bold text-white">
                        São Tomé • RN
                    </span>
                    <span className="hidden sm:inline text-slate-400 font-normal">
                        | Poder Executivo Municipal
                    </span>
                </div>

                {/* Atalhos e-MAG */}
                <div className="hidden xl:flex items-center gap-4 text-[11px] text-slate-300 border-l border-white/10 pl-6">
                    <a
                        href="#conteudo-principal"
                        accessKey="1"
                        className="hover:text-secondary-400 transition-colors flex items-center gap-1.5"
                    >
                        <span>Conteúdo</span>
                        <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/10 rounded text-slate-200">
                            1
                        </kbd>
                    </a>
                    <a
                        href="#menu-principal"
                        accessKey="2"
                        className="hover:text-secondary-400 transition-colors flex items-center gap-1.5"
                    >
                        <span>Menu</span>
                        <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/10 rounded text-slate-200">
                            2
                        </kbd>
                    </a>
                    <a
                        href="#busca"
                        accessKey="3"
                        className="hover:text-secondary-400 transition-colors flex items-center gap-1.5"
                    >
                        <span>Busca</span>
                        <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/10 rounded text-slate-200">
                            3
                        </kbd>
                    </a>
                </div>
            </div>

            {/* Controles de Acessibilidade e Links */}
            <div className="flex items-center gap-3 md:gap-5 shrink-0 ml-4">
                <div className="flex items-center gap-1">
                    <button
                        onClick={toggleHighContrast}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-white/10 hover:text-white transition-all text-[11px] font-medium"
                        title="Alternar Alto Contraste"
                        aria-label="Alternar Alto Contraste"
                    >
                        <Contrast size={13} className="text-secondary-400" />
                        <span className="hidden sm:inline">Contraste</span>
                    </button>

                    <div className="flex items-center bg-white/5 rounded-md p-0.5 border border-white/10">
                        <button
                            onClick={decreaseFontSize}
                            className="w-6 h-6 flex items-center justify-center hover:bg-white/15 rounded text-slate-300 hover:text-white transition-colors"
                            title="Diminuir Fonte (A-)"
                            aria-label="Diminuir Fonte"
                        >
                            <Minus size={12} />
                        </button>
                        <button
                            onClick={resetFontSize}
                            className="px-1.5 h-6 flex items-center justify-center hover:bg-white/15 rounded text-[10px] font-mono font-bold text-slate-300 hover:text-white transition-colors"
                            title="Tamanho Padrão (A)"
                            aria-label="Tamanho Padrão de Fonte"
                        >
                            <RotateCcw size={11} />
                        </button>
                        <button
                            onClick={increaseFontSize}
                            className="w-6 h-6 flex items-center justify-center hover:bg-white/15 rounded text-slate-300 hover:text-white transition-colors"
                            title="Aumentar Fonte (A+)"
                            aria-label="Aumentar Fonte"
                        >
                            <Plus size={12} />
                        </button>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-4 border-l border-white/10 pl-4 text-[11px] font-medium">
                    <Link
                        href="/transparencia/radar"
                        className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 transition-colors"
                    >
                        <ShieldCheck size={13} />
                        <span>PNTP 2026</span>
                    </Link>
                    <Link
                        href="/mapa-do-site"
                        className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
                    >
                        <Network size={13} className="text-primary-400" />
                        <span>Mapa do Site</span>
                    </Link>
                    <Link
                        href="/transparencia/acessibilidade"
                        className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
                    >
                        <Accessibility size={13} className="text-primary-400" />
                        <span>Acessibilidade</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
