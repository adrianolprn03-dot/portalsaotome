import PageHeader from "@/components/PageHeader";
import { Handshake, Info, FileText, ExternalLink, Calendar, Building2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Acordos Firmados | Portal da Transparência",
    description: "Informações sobre acordos firmados sem transferência de recursos financeiros.",
};

export default async function AcordosFirmadosPage() {
    const acordos = await prisma.convenio
        .findMany({
            where: { tipoConvenio: "acordo_sem_transferencia" },
            orderBy: { dataInicio: "desc" },
        })
        .catch(() => []);

    return (
        <div className="bg-[#f8fafc] min-h-screen">
            <PageHeader
                title="Acordos Firmados"
                subtitle="Consulte os termos de cooperação e acordos técnicos firmados sem repasse de recursos."
                variant="premium"
                icon={<Handshake className="text-white" size={32} />}
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Transparência", href: "/transparencia" },
                    { label: "Acordos Firmados" }
                ]}
            />

            <div className="max-w-5xl mx-auto px-6 py-16 space-y-10">
                {acordos.length > 0 && (
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
                        <div className="p-8 md:p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50/60 via-white to-emerald-50/40">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-widest mb-2">
                                    <CheckCircle2 size={13} /> Instrumentos Vigentes Registrados
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                                    Termos de Cooperação Técnica sem Repasse Financeiro
                                </h2>
                                <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
                                    Publicação integral em atendimento à Lei Federal nº 12.527/2011 (LAI) e ao Programa Nacional de Transparência Pública (PNTP).
                                </p>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {acordos.map((acordo) => (
                                <div
                                    key={acordo.id}
                                    className="p-8 hover:bg-slate-50/60 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                                >
                                    <div className="space-y-3 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black uppercase tracking-wider">
                                                Termo nº {acordo.numero}
                                            </span>
                                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                                Sem Transferência Financeira (R$ 0,00)
                                            </span>
                                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase">
                                                {acordo.status || "Vigente"}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-black text-slate-900 leading-snug">
                                            {acordo.objeto}
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
                                            <div className="flex items-center gap-2">
                                                <Building2 size={14} className="text-indigo-600 shrink-0" />
                                                <span>
                                                    <strong>Órgão Parceiro:</strong> {acordo.concedente}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-indigo-600 shrink-0" />
                                                <span>
                                                    <strong>Vigência:</strong>{" "}
                                                    {new Date(acordo.dataInicio).toLocaleDateString("pt-BR")} a{" "}
                                                    {new Date(acordo.dataFim).toLocaleDateString("pt-BR")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {acordo.arquivoInteiroTeor && (
                                        <div className="shrink-0">
                                            <a
                                                href={acordo.arquivoInteiroTeor}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-[#01b0ef] hover:bg-[#0098d4] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md"
                                            >
                                                <FileText size={15} /> Abrir Termo (PDF)
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-[2rem] p-12 shadow-xl border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Handshake size={200} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <Info size={24} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">O que são estes Acordos?</h2>
                        </div>

                        <div className="space-y-6 text-slate-600 font-medium leading-relaxed mb-12">
                            <p>
                                Refere-se a parcerias, termos de cooperação mútua, acordos de cooperação técnica e outros ajustes firmados pelo Município com entidades públicas ou privadas, nos quais <strong>não há previsão de transferência voluntária de recursos financeiros</strong> entre os partícipes.
                            </p>
                            <p>
                                O objetivo principal destes acordos costuma ser o intercâmbio de conhecimentos, cessão de uso de espaços, apoio institucional ou execução conjunta de atividades de interesse público sem envolver movimentação de caixa.
                            </p>
                        </div>

                        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 mb-12">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-2 italic">Acesso aos Documentos</h3>
                                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                        A listagem completa e a íntegra dos termos podem ser consultadas acima, no painel de convênios e parcerias ou solicitadas formalmente via e-SIC.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6">
                            <Link 
                                href="/servicos/esic" 
                                className="flex-1 bg-[#fdb913] text-slate-900 text-center py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-[#e5a60d] transition-all shadow-xl shadow-[#fdb913]/20 active:scale-95"
                            >
                                Solicitar via e-SIC
                            </Link>
                            <Link 
                                href="/transparencia/convenios" 
                                className="flex-1 bg-[#01b0ef] text-white text-center py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-[#0098d4] transition-all shadow-xl shadow-[#01b0ef]/20 active:scale-95 flex items-center justify-center gap-3"
                            >
                                <ExternalLink size={16} /> Acessar Painel de Parcerias
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
