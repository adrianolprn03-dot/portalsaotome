export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCalendarCheck, FaInfoCircle } from "react-icons/fa";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Agenda de Eventos e Compromissos | Prefeitura de São Tomé",
    description: "Fique por dentro das reuniões oficiais, audiências públicas e eventos da gestão municipal de São Tomé – RN.",
};

type Evento = {
    id: string;
    titulo: string;
    descricao: string | null;
    local: string | null;
    dataInicio: Date;
    dataFim: Date | null;
    publico: boolean;
};

export default async function AgendaPublicaPage() {
    let eventos: Evento[] = [];
    try {
        eventos = await prisma.evento.findMany({
            where: { publico: true },
            orderBy: { dataInicio: "desc" },
        });
    } catch (error) {
        console.error("Erro ao buscar agenda pública:", error);
    }

    const agora = new Date();
    
    // Dividir em futuros e passados
    const compromissosFuturos = eventos
        .filter(e => new Date(e.dataInicio) >= agora)
        .reverse(); // Ordena futuros do mais próximo ao mais distante

    const compromissosPassados = eventos
        .filter(e => new Date(e.dataInicio) < agora); // Ordena passados do mais recente ao mais antigo

    const formatarDia = (data: Date) => data.getDate().toString().padStart(2, "0");
    const formatarMes = (data: Date) => {
        return data.toLocaleDateString("pt-BR", { month: "short" })
            .replace(".", "")
            .toUpperCase();
    };
    const formatarHora = (data: Date) => {
        return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    };
    const formatarDataCompleta = (data: Date) => {
        return data.toLocaleDateString("pt-BR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const renderCardCompromisso = (e: Evento) => (
        <div key={e.id} className="group bg-white rounded-[2.5rem] p-8 md:p-10 border-2 border-gray-50 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 hover:-translate-y-1 flex flex-col md:flex-row gap-8 items-start">
            <div className="shrink-0 w-24 h-24 rounded-[2rem] flex flex-col items-center justify-center bg-blue-50 text-[#01b0ef] border-2 border-white group-hover:bg-[#01b0ef] group-hover:text-white transition-all duration-500 shadow-sm">
                <span className="font-black text-4xl leading-none">{formatarDia(e.dataInicio)}</span>
                <span className="text-[11px] font-black mt-1.5 uppercase tracking-widest">{formatarMes(e.dataInicio)}</span>
            </div>
            
            <div className="flex-grow space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-gray-100 text-gray-500 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-gray-200/50">
                        {e.dataInicio >= agora ? "Agendado" : "Realizado"}
                    </span>
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-tight">
                        {formatarDataCompleta(e.dataInicio)}
                    </span>
                </div>
                
                <h3 className="font-black text-[#0088b9] text-xl leading-tight group-hover:text-[#01b0ef] transition-colors">
                    {e.titulo}
                </h3>
                
                {e.descricao && (
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">
                        {e.descricao}
                    </p>
                )}
                
                <div className="flex flex-wrap gap-6 text-[11px] font-black uppercase tracking-widest text-gray-400 pt-2 border-t border-gray-100/50">
                    <span className="flex items-center gap-2">
                        <FaClock className="text-[#FDB913]" size={16} /> 
                        {formatarHora(e.dataInicio)}
                    </span>
                    <span className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-[#FDB913]" size={16} /> 
                        {e.local || "Gabinete do Prefeito (Sede Administrativa)"}
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] font-['Montserrat',sans-serif]">
            <PageHeader
                title="Agenda Oficial de Compromissos"
                subtitle="Acompanhe de forma transparente as reuniões, audiências públicas e agendas de trabalho oficiais de nosso município."
                variant="premium"
                icon={<FaCalendarAlt />}
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "A Prefeitura", href: "/a-prefeitura" },
                    { label: "Agenda de Compromissos" }
                ]}
            />

            <div className="max-w-[1240px] mx-auto px-6 py-16">
                
                {/* Destaque / Próximos Compromissos */}
                <section className="mb-20">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#01b0ef] border-2 border-gray-50 shadow-sm">
                            <FaCalendarCheck size={22} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">
                                Próximos Compromissos
                            </h2>
                            <div className="h-1.5 w-16 bg-[#FDB913] mt-2 rounded-full" />
                        </div>
                    </div>

                    {compromissosFuturos.length === 0 ? (
                        <div className="p-16 rounded-[3rem] bg-white border border-gray-100 text-center shadow-sm flex flex-col items-center justify-center gap-4">
                            <div className="w-16 h-16 bg-blue-50/50 rounded-full flex items-center justify-center text-blue-400">
                                <FaInfoCircle size={24} />
                            </div>
                            <span className="text-gray-400 font-black uppercase tracking-widest text-xs">
                                Nenhum compromisso agendado para os próximos dias
                            </span>
                            <p className="text-gray-500 text-sm max-w-md">
                                A agenda municipal é atualizada dinamicamente pela assessoria de comunicação municipal.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {compromissosFuturos.map(renderCardCompromisso)}
                        </div>
                    )}
                </section>

                {/* Histórico de Compromissos */}
                <section>
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#01b0ef] border-2 border-gray-50 shadow-sm">
                            <FaCalendarAlt size={22} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">
                                Compromissos Anteriores
                            </h2>
                            <div className="h-1.5 w-16 bg-[#FDB913] mt-2 rounded-full" />
                        </div>
                    </div>

                    {compromissosPassados.length === 0 ? (
                        <div className="p-12 rounded-[2rem] border-2 border-dashed border-gray-100 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px] bg-gray-50/30">
                            Nenhum compromisso histórico cadastrado.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {compromissosPassados.map(renderCardCompromisso)}
                        </div>
                    )}
                </section>

                {/* Banner de Transparência Adicional */}
                <div className="mt-20 p-10 bg-[#0088b9] text-white rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl" />
                    <div className="relative z-10 flex-1 space-y-2 text-center md:text-left">
                        <h3 className="text-2xl font-black uppercase tracking-tight">Transparência como prioridade</h3>
                        <p className="text-blue-100 text-sm font-medium leading-relaxed max-w-xl">
                            Todas as reuniões externas, audiências com órgãos estaduais e federais, e visitas institucionais de interesse do município são documentadas na agenda pública.
                        </p>
                    </div>
                    <div className="shrink-0 relative z-10">
                        <Link href="/a-prefeitura/prefeito" className="px-10 py-5 bg-white text-[#0088b9] hover:bg-[#FDB913] hover:text-slate-900 rounded-full text-[11px] font-black uppercase tracking-widest transition-all shadow-xl">
                            Conhecer a Gestão
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
