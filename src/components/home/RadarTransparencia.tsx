import Link from "next/link";
import {
    ExternalLink,
    CheckCircle2,
    ShieldCheck,
    BarChart3,
    Database,
    Scale,
    ArrowRight,
    Award,
} from "lucide-react";

export default function RadarTransparencia() {
    const radarUrl = "https://radardatransparencia.atricon.org.br/index.html";

    const pilares = [
        { label: "Transparência Ativa", sub: "Receitas, Despesas e LRF" },
        { label: "Acesso à Informação", sub: "e-SIC e Ouvidoria Integrados" },
        { label: "Dados Abertos", sub: "Exportação CSV, JSON e XLSX" },
        { label: "Controle Social", sub: "Obras, Contratos e Licitações" },
    ];

    const dimensoes = [
        { nome: "Execução Orçamentária e Financeira", meta: "100%", icon: BarChart3 },
        { nome: "Licitações, Contratos e Obras", meta: "100%", icon: Scale },
        { nome: "Atendimento ao Cidadão (LAI / Ouvidoria)", meta: "100%", icon: ShieldCheck },
        { nome: "Dados Abertos e Acessibilidade e-MAG", meta: "100%", icon: Database },
    ];

    return (
        <section className="bg-[#F6F9FC] py-20 md:py-24 px-6 relative overflow-hidden border-b border-slate-200/80">
            <div className="max-w-[1240px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Side: Text Content (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="section-eyebrow">
                            <ShieldCheck size={14} className="text-primary-600" />
                            <span>PNTP 2026 • ATRICON &amp; Tribunais de Contas</span>
                        </div>

                        <h2 className="section-title">
                            Compromisso permanente com a{" "}
                            <span className="text-primary-600">transparência pública</span>
                        </h2>

                        <p className="text-slate-600 text-base leading-relaxed max-w-2xl">
                            O Radar da Transparência Pública avalia o cumprimento da Lei de Acesso à Informação (Lei nº 12.527/2011) e da Lei de Responsabilidade Fiscal em todos os municípios brasileiros. São Tomé mantém dados estruturados, atualizados e auditáveis.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                            {pilares.map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-civic-sm"
                                >
                                    <CheckCircle2
                                        size={18}
                                        className="text-emerald-600 shrink-0 mt-0.5"
                                    />
                                    <div>
                                        <div className="text-xs font-bold text-[#071E3D]">
                                            {item.label}
                                        </div>
                                        <div className="text-[11px] text-slate-500">
                                            {item.sub}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-3.5 pt-3">
                            <Link
                                href={radarUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary"
                            >
                                <span>Consultar Radar ATRICON</span>
                                <ExternalLink size={15} />
                            </Link>

                            <Link href="/transparencia/radar" className="btn-outline">
                                <span>Painel de Governança PNTP</span>
                                <ArrowRight size={15} />
                            </Link>
                        </div>
                    </div>

                    {/* Right Side: Architectural Governance Card (5 cols) */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-civic-xl overflow-hidden">
                            <div className="h-1.5 w-full heraldic-stripe" />

                            <div className="p-7 sm:p-8 space-y-6">
                                <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-12 h-12 rounded-2xl bg-[#071E3D] text-secondary-400 flex items-center justify-center shadow-sm">
                                            <Award size={24} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-primary-600 uppercase tracking-wider">
                                                Matriz de Conformidade
                                            </div>
                                            <h3 className="font-heading text-lg font-extrabold text-[#071E3D]">
                                                Programa Nacional • PNTP
                                            </h3>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-xs font-bold">
                                        Ciclo 2026
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {dimensoes.map((dim, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3.5 rounded-xl bg-[#F6F9FC] border border-slate-200/70 flex items-center justify-between gap-3"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <dim.icon
                                                    size={17}
                                                    className="text-primary-600 shrink-0"
                                                />
                                                <span className="text-xs font-semibold text-slate-700 truncate">
                                                    {dim.nome}
                                                </span>
                                            </div>
                                            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 shrink-0">
                                                Ativo
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                    <span>Auditado pela Controladoria Geral</span>
                                    <span className="font-mono font-bold text-[#071E3D]">
                                        TCE/RN • ATRICON
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
