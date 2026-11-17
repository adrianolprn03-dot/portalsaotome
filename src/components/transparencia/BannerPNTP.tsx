"use client";

import Link from "next/link";
import { ShieldCheck, Headset, BarChart3 } from "lucide-react";
import DataAtualizacao from "@/components/transparencia/DataAtualizacao";

export default function BannerPNTP({
    criterio,
    requisito,
    status,
}: {
    criterio?: string;
    requisito?: string;
    status?: string;
} = {}) {
    return (
        <div className="w-full max-w-[1240px] mx-auto px-6 mb-10">
            <div className="relative overflow-hidden bg-gradient-to-r from-[#01b0ef] via-[#1dc0fa] to-[#0098d4] rounded-3xl p-7 md:p-9 text-white shadow-civic-xl border-b-4 border-[#fdb913]">
                <div className="absolute inset-0 civic-grid-light opacity-55 pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex items-start sm:items-center gap-5 flex-1">
                        <div className="w-14 h-14 bg-[#fdb913] rounded-2xl flex items-center justify-center shrink-0 text-slate-900 shadow-sm">
                            <ShieldCheck size={26} />
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h2 className="font-heading text-lg md:text-xl font-extrabold text-white">
                                    Transparência Ativa Certificada
                                </h2>
                                <span className="px-2.5 py-0.5 bg-[#fdb913] text-slate-900 rounded-full text-[11px] font-mono font-extrabold">
                                    PNTP 2026
                                </span>
                                {criterio && (
                                    <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-full text-[11px] font-mono font-bold">
                                        Critério {criterio}
                                    </span>
                                )}
                            </div>
                            <p className="text-white/95 text-xs sm:text-sm leading-relaxed max-w-2xl">
                                Dados públicos disponibilizados em conformidade com o Programa Nacional de Transparência Pública (ATRICON), Lei de Responsabilidade Fiscal e Lei de Acesso à Informação (Lei nº 12.527/2011).
                            </p>
                        </div>
                    </div>

                    <div className="shrink-0 w-full lg:w-auto flex flex-wrap gap-3">
                        <Link
                            href="/servicos/esic"
                            className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 bg-[#fdb913] hover:brightness-105 text-slate-900 px-5 py-3 rounded-xl font-bold text-xs transition-all shadow-sm whitespace-nowrap"
                        >
                            <Headset size={15} />
                            <span>Solicitar via e-SIC</span>
                        </Link>
                        <Link
                            href="/transparencia/radar"
                            className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 bg-white hover:bg-[#eefaff] text-[#01b0ef] px-5 py-3 rounded-xl font-bold text-xs transition-all shadow-sm whitespace-nowrap"
                        >
                            <BarChart3 size={15} />
                            <span>Radar PNTP</span>
                        </Link>
                    </div>
                </div>

                {/* Data de Atualização e Data de Acesso */}
                <div className="relative z-10 mt-5 pt-4 border-t border-white/25">
                    <DataAtualizacao variant="banner" />
                </div>
            </div>
        </div>
    );
}
