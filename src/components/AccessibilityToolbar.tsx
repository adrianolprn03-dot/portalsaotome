"use client";
import { useAccessibility } from "./AccessibilityProvider";
import {
    Contrast,
    Minus,
    Plus,
    RotateCcw,
    Accessibility,
} from "lucide-react";
import Link from "next/link";

export default function AccessibilityToolbar() {
    const { toggleHighContrast, increaseFontSize, decreaseFontSize, resetFontSize } =
        useAccessibility();

    return (
        <div
            role="region"
            aria-label="Barra de acessibilidade e atalhos do portal"
            className="bg-[#004666] text-white h-9 w-full border-b border-white/15 flex items-center justify-between overflow-x-auto no-scrollbar relative z-[100] px-4 md:px-8 lg:px-10 text-xs"
        >
            <div className="flex items-center gap-5 shrink-0">
                {/* Identificação Oficial */}
                <div className="flex items-center gap-2 text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#fdb913] shrink-0" aria-hidden="true" />
                    <span className="tracking-wide uppercase font-heading text-white">
                        Prefeitura de São Tomé • RN
                    </span>
                </div>

                {/* Atalhos e-MAG */}
                <div className="hidden xl:flex items-center gap-4 text-[11px] text-white border-l border-white/25 pl-5 font-medium">
                    <a
                        href="#conteudo-principal"
                        accessKey="1"
                        className="hover:text-[#fdb913] transition-colors flex items-center gap-1.5"
                    >
                        <span>Ir para o conteúdo</span>
                        <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white/15 rounded text-white">
                            1
                        </kbd>
                    </a>
                    <a
                        href="#menu-principal"
                        accessKey="2"
                        className="hover:text-[#fdb913] transition-colors flex items-center gap-1.5"
                    >
                        <span>Ir para o menu</span>
                        <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white/15 rounded text-white">
                            2
                        </kbd>
                    </a>
                    <a
                        href="#campo-busca-portal"
                        accessKey="3"
                        className="hover:text-[#fdb913] transition-colors flex items-center gap-1.5"
                    >
                        <span>Ir para a busca</span>
                        <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white/15 rounded text-white">
                            3
                        </kbd>
                    </a>
                </div>
            </div>

            {/* Controles de Acessibilidade */}
            <div className="flex items-center gap-2.5 md:gap-3.5 shrink-0 ml-3">
                <button
                    type="button"
                    onClick={toggleHighContrast}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors text-[11px] font-bold cursor-pointer"
                    title="Alternar Alto Contraste"
                    aria-label="Alternar Alto Contraste"
                >
                    <Contrast size={13} className="text-[#fdb913]" aria-hidden="true" />
                    <span className="hidden sm:inline">Alto contraste</span>
                </button>

                <div
                    className="flex items-center bg-white/10 rounded-md p-0.5 border border-white/20"
                    role="group"
                    aria-label="Ajuste de tamanho da fonte"
                >
                    <button
                        type="button"
                        onClick={decreaseFontSize}
                        className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded text-white transition-colors cursor-pointer"
                        title="Diminuir fonte (A-)"
                        aria-label="Diminuir tamanho da fonte"
                    >
                        <Minus size={12} aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={resetFontSize}
                        className="px-1.5 h-6 flex items-center justify-center hover:bg-white/20 rounded text-[10px] font-mono font-bold text-white transition-colors cursor-pointer"
                        title="Tamanho padrão da fonte (A)"
                        aria-label="Restaurar tamanho padrão da fonte"
                    >
                        <RotateCcw size={11} aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={increaseFontSize}
                        className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded text-white transition-colors cursor-pointer"
                        title="Aumentar fonte (A+)"
                        aria-label="Aumentar tamanho da fonte"
                    >
                        <Plus size={12} aria-hidden="true" />
                    </button>
                </div>

                <Link
                    href="/transparencia/acessibilidade"
                    className="hidden md:flex items-center gap-1.5 border-l border-white/25 pl-3 text-[11px] font-bold text-white hover:text-[#fdb913] transition-colors"
                >
                    <Accessibility size={13} className="text-[#fdb913]" aria-hidden="true" />
                    <span>Acessibilidade</span>
                </Link>
            </div>
        </div>
    );
}
