"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    CalendarDays,
    MapPin,
    Clock,
    ArrowRight,
    Landmark,
    ShieldCheck,
    Users,
} from "lucide-react";

type Evento = {
    id: string;
    titulo: string;
    dataInicio: string;
    local: string | null;
    descricao: string | null;
};

export default function AgendaSection() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEventos = async () => {
            try {
                const res = await fetch("/api/agenda");
                const data = await res.json();
                const proximos = (data || [])
                    .filter((e: Evento) => new Date(e.dataInicio) >= new Date())
                    .slice(0, 3);
                setEventos(proximos);
            } catch (error) {
                console.error("Erro ao buscar agenda:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEventos();
    }, []);

    return (
        <section
            className="py-20 bg-[#f4fbff] border-b border-[#01b0ef]/15"
            aria-labelledby="agenda-titulo"
        >
            <div className="max-w-[1240px] mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                    {/* AGENDA LIST (7 cols) */}
                    <div className="lg:col-span-7 flex flex-col justify-between bg-white rounded-3xl p-7 sm:p-10 border border-slate-200/80 shadow-civic-sm">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-12 bg-[#01b0ef]/10 text-[#01b0ef] rounded-2xl flex items-center justify-center border border-[#01b0ef]/25 shrink-0">
                                        <CalendarDays size={24} />
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-[#01b0ef] uppercase tracking-wider">
                                            Transparência do Executivo
                                        </span>
                                        <h2
                                            id="agenda-titulo"
                                            className="font-heading text-2xl font-extrabold text-slate-900"
                                        >
                                            Agenda Oficial de Compromissos
                                        </h2>
                                    </div>
                                </div>

                                <Link
                                    href="/a-prefeitura/agenda"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-[#fdb913] hover:brightness-105 px-4 py-2.5 rounded-xl transition-all w-fit shadow-xs"
                                >
                                    <span>Agenda completa</span>
                                    <ArrowRight size={14} />
                                </Link>
                            </div>

                            {loading ? (
                                <div className="py-16 flex items-center justify-center">
                                    <div className="w-8 h-8 border-3 border-[#01b0ef] border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : eventos.length === 0 ? (
                                <div className="p-10 rounded-2xl border border-dashed border-[#01b0ef]/30 text-center bg-[#f4fbff] my-2">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#01b0ef]/25 text-[#01b0ef] flex items-center justify-center mx-auto mb-3 shadow-xs">
                                        <CalendarDays size={22} />
                                    </div>
                                    <p className="text-slate-800 font-bold text-sm mb-1">
                                        Sem compromissos públicos registrados para hoje
                                    </p>
                                    <p className="text-slate-500 text-xs max-w-md mx-auto">
                                        Consulte o histórico completo de audiências, reuniões e eventos oficiais na página da Agenda do Prefeito.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {eventos.map((e) => {
                                        const data = new Date(e.dataInicio);
                                        const dia = data.getDate().toString().padStart(2, "0");
                                        const mes = data
                                            .toLocaleDateString("pt-BR", { month: "short" })
                                            .replace(".", "")
                                            .toUpperCase();
                                        const hora = data.toLocaleTimeString("pt-BR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        });

                                        return (
                                            <div
                                                key={e.id}
                                                className="group flex items-center gap-5 p-4 sm:p-5 rounded-2xl bg-[#f4fbff] hover:bg-white border border-slate-200/80 hover:border-[#01b0ef] hover:shadow-civic transition-all duration-200"
                                            >
                                                <div className="shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center bg-white text-slate-900 border border-[#01b0ef]/25 group-hover:bg-[#01b0ef] group-hover:text-white group-hover:border-[#01b0ef] transition-colors shadow-xs">
                                                    <span className="font-heading font-extrabold text-2xl leading-none">
                                                        {dia}
                                                    </span>
                                                    <span className="text-[10px] font-mono font-bold mt-1 uppercase tracking-wider text-[#01b0ef] group-hover:text-[#fdb913]">
                                                        {mes}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-heading font-bold text-slate-900 text-base leading-snug group-hover:text-[#01b0ef] transition-colors mb-2 truncate">
                                                        {e.titulo}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                                                        <span className="inline-flex items-center gap-1.5 font-mono">
                                                            <Clock className="text-[#fdb913]" size={14} />
                                                            {hora}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <MapPin className="text-[#01b0ef]" size={14} />
                                                            {e.local || "Gabinete do Executivo • Sede"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span>Atualizado pelo Gabinete Civil</span>
                            <Link
                                href="/a-prefeitura/agenda"
                                className="font-bold text-[#01b0ef] hover:underline"
                            >
                                Consultar calendário completo →
                            </Link>
                        </div>
                    </div>

                    {/* MENSAGEM INSTITUCIONAL & GOVERNANÇA (5 cols) */}
                    <div className="lg:col-span-5 flex">
                        <div className="relative w-full p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#01b0ef] to-[#0096ce] text-white shadow-civic-xl overflow-hidden flex flex-col justify-between border-b-4 border-[#fdb913]">
                            <div className="absolute inset-0 civic-grid-light opacity-50 pointer-events-none" />
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/15 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="w-14 h-14 bg-[#fdb913] rounded-2xl flex items-center justify-center text-slate-900 shadow-sm">
                                        <Landmark size={26} />
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-900 text-xs font-bold shadow-xs">
                                        <ShieldCheck size={13} className="text-[#01b0ef]" /> Gestão Municipal
                                    </span>
                                </div>

                                <div>
                                    <h3 className="font-heading text-2xl font-extrabold text-white tracking-tight mb-3">
                                        Governança de portas abertas para São Tomé
                                    </h3>
                                    <blockquote className="text-white/95 text-sm sm:text-base leading-relaxed italic border-l-4 border-[#fdb913] pl-4">
                                        &ldquo;Nossa administração é pautada pela responsabilidade fiscal, transparência ativa e respeito a cada cidadão são-tomeense.&rdquo;
                                    </blockquote>
                                </div>
                            </div>

                            <div className="relative z-10 pt-8 mt-8 border-t border-white/25 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <Link
                                        href="/a-prefeitura/prefeito"
                                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#fdb913] hover:brightness-105 text-slate-900 font-bold text-xs transition-all shadow-sm"
                                    >
                                        <Users size={15} />
                                        <span>Prefeito e Vice</span>
                                    </Link>
                                    <Link
                                        href="/a-prefeitura/estrutura"
                                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white hover:bg-[#eefaff] text-[#01b0ef] font-bold text-xs transition-all shadow-sm"
                                    >
                                        <Landmark size={15} />
                                        <span>Organograma</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
