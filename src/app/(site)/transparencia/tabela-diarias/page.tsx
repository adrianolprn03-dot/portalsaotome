"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import BannerPNTP from "@/components/transparencia/BannerPNTP";
import {
    FaTable,
    FaFilePdf,
    FaDownload,
    FaGavel,
    FaRoute,
    FaExternalLinkAlt,
} from "react-icons/fa";
import {
    exportToCSV,
    exportToJSON,
    exportToPDF,
    exportToXLSX,
} from "@/lib/exportUtils";

interface ItemTabelaDiaria {
    cargo: string;
    dentroEstadoSemPernoite: string;
    dentroEstadoComPernoite: string;
    foraEstado: string;
}

interface RegistroAnoTabela {
    ano: number;
    norma: string;
    vigencia: string;
    itens: ItemTabelaDiaria[];
}

const REGISTROS_TABELA: RegistroAnoTabela[] = [
    {
        ano: 2026,
        norma: "Decreto Municipal nº 005/2017 (Vigente em 2026)",
        vigencia: "Vigência contínua nos exercícios de 2017 a 2026",
        itens: [
            {
                cargo: "Prefeito(a) e Vice-Prefeito(a)",
                dentroEstadoSemPernoite: "R$ 250,00",
                dentroEstadoComPernoite: "R$ 500,00",
                foraEstado: "R$ 800,00",
            },
            {
                cargo: "Secretários Municipais, Chefe de Gabinete e Procurador Geral",
                dentroEstadoSemPernoite: "R$ 150,00",
                dentroEstadoComPernoite: "R$ 300,00",
                foraEstado: "R$ 600,00",
            },
            {
                cargo: "Coordenadores, Assessores e Demais Cargos Comissionados",
                dentroEstadoSemPernoite: "R$ 100,00",
                dentroEstadoComPernoite: "R$ 200,00",
                foraEstado: "R$ 400,00",
            },
            {
                cargo: "Servidores Efetivos, Motoristas e Demais Agentes Públicos",
                dentroEstadoSemPernoite: "R$ 80,00",
                dentroEstadoComPernoite: "R$ 160,00",
                foraEstado: "R$ 350,00",
            },
        ],
    },
];

export default function TabelaDiariasPage() {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const registroAtual = REGISTROS_TABELA[0];

    useEffect(() => {
        fetch("/api/documentos?tipo=tabela-diarias")
            .then((r) => (r.ok ? r.json() : []))
            .then((data) => {
                const list = Array.isArray(data) ? data : data?.data || [];
                const doc = list.find((d: { arquivoUrl?: string }) => d.arquivoUrl);
                if (doc?.arquivoUrl) setPdfUrl(doc.arquivoUrl);
            })
            .catch(() => {});
    }, []);

    const handleExport = (format: "pdf" | "csv" | "json" | "xlsx") => {
        const payload = registroAtual.itens.map((i) => ({
            "Cargo / Função": i.cargo,
            "No Estado (Sem Pernoite)": i.dentroEstadoSemPernoite,
            "No Estado (Com Pernoite)": i.dentroEstadoComPernoite,
            "Fora do Estado": i.foraEstado,
            "Norma Regulamentadora": registroAtual.norma,
        }));

        const filename = `tabela_diarias_${registroAtual.ano}_saotome`;
        const title = `Tabela Oficial de Valores de Diárias (${registroAtual.ano}) – São Tomé/RN`;

        if (format === "csv") exportToCSV(payload, filename);
        else if (format === "json") exportToJSON(payload, filename);
        else if (format === "xlsx") exportToXLSX(payload, filename);
        else exportToPDF(payload, filename, title);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            <PageHeader
                title="Tabela de Valores de Diárias"
                subtitle="Consulte os valores oficiais fixados por nível hierárquico e destino de deslocamento conforme o Decreto Municipal regulamentador."
                breadcrumbs={[
                    { label: "Transparência", href: "/transparencia" },
                    { label: "Diárias e Passagens", href: "/transparencia/diarias" },
                    { label: "Tabela de Valores" },
                ]}
            />

            <div className="container mx-auto px-4 max-w-6xl -mt-8 relative z-20 space-y-8">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#003da5]/5 via-white to-blue-50/40">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#003da5] text-[11px] font-black uppercase tracking-widest mb-2">
                                <FaTable size={11} /> {registroAtual.norma}
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                                Tabela de Valores de Diárias por Cargo e Destino
                            </h2>
                            <p className="text-xs md:text-sm text-slate-500 mt-1">
                                {registroAtual.vigencia}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {pdfUrl && (
                                <a
                                    href={pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#003da5] hover:bg-[#002868] text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                                >
                                    <FaFilePdf size={13} /> Ato Oficial (PDF)
                                </a>
                            )}
                            <button
                                onClick={() => handleExport("pdf")}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
                            >
                                <FaDownload size={11} /> PDF
                            </button>
                            <button
                                onClick={() => handleExport("xlsx")}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
                            >
                                <FaDownload size={11} /> XLSX
                            </button>
                            <button
                                onClick={() => handleExport("csv")}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
                            >
                                <FaDownload size={11} /> CSV
                            </button>
                            <button
                                onClick={() => handleExport("json")}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
                            >
                                <FaDownload size={11} /> JSON
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-500">
                                    <th className="py-4 px-6">Cargo / Enquadramento Funcional</th>
                                    <th className="py-4 px-6 text-right">Dentro do RN (Sem Pernoite)</th>
                                    <th className="py-4 px-6 text-right">Dentro do RN (Com Pernoite)</th>
                                    <th className="py-4 px-6 text-right">Fora do Estado do RN</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {registroAtual.itens.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-4 px-6 font-bold text-slate-900">
                                            {item.cargo}
                                        </td>
                                        <td className="py-4 px-6 text-right font-mono font-bold text-slate-700">
                                            {item.dentroEstadoSemPernoite}
                                        </td>
                                        <td className="py-4 px-6 text-right font-mono font-bold text-[#003da5]">
                                            {item.dentroEstadoComPernoite}
                                        </td>
                                        <td className="py-4 px-6 text-right font-mono font-bold text-emerald-700">
                                            {item.foraEstado}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <FaGavel className="text-[#003da5]" /> Regulamentação e Relação de Diárias Pagas
                        </h3>
                        <p className="text-xs md:text-sm text-slate-600">
                            Consulte o texto integral da regulamentação ou acesse as portarias e diárias concedidas por exercício.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3 shrink-0">
                        <Link
                            href="/transparencia/regulamentacao-diarias"
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider transition-all"
                        >
                            Ver Regulamentação
                        </Link>
                        <Link
                            href="/transparencia/diarias"
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#003da5] hover:bg-[#002868] text-white text-xs font-black uppercase tracking-wider transition-all"
                        >
                            Diárias Concedidas <FaExternalLinkAlt size={10} />
                        </Link>
                    </div>
                </div>

                <BannerPNTP />
            </div>
        </div>
    );
}
