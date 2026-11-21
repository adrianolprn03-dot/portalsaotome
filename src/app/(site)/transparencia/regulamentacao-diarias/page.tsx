"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import BannerPNTP from "@/components/transparencia/BannerPNTP";
import {
    FaGavel,
    FaFilePdf,
    FaExternalLinkAlt,
    FaCheckCircle,
    FaClipboardCheck,
    FaTable,
    FaRoute,
    FaBalanceScale,
} from "react-icons/fa";

interface DocumentoRegulamentacao {
    id: number;
    titulo: string;
    categoria?: string | null;
    arquivoUrl?: string | null;
    createdAt?: string;
}

export default function RegulamentacaoDiariasPage() {
    const [docs, setDocs] = useState<DocumentoRegulamentacao[]>([]);

    useEffect(() => {
        fetch("/api/documentos?tipo=regulamentacao-diarias")
            .then((r) => (r.ok ? r.json() : []))
            .then((data) => {
                const list = Array.isArray(data) ? data : data?.data || [];
                setDocs(list);
            })
            .catch(() => setDocs([]));
    }, []);

    const docPrincipal = docs.find((d) => d.arquivoUrl) || null;

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            <PageHeader
                title="Regulamentação da Concessão de Diárias"
                subtitle="Normas, critérios legais, prestação de contas e ato normativo municipal que disciplina a concessão de diárias no Município de São Tomé/RN."
                breadcrumbs={[
                    { label: "Transparência", href: "/transparencia" },
                    { label: "Diárias e Passagens", href: "/transparencia/diarias" },
                    { label: "Regulamentação de Diárias" },
                ]}
            />

            <div className="container mx-auto px-4 max-w-6xl -mt-8 relative z-20 space-y-8">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#003da5] text-xs font-black uppercase tracking-wider">
                            <FaGavel /> Ato Normativo Vigente • Decreto Municipal nº 005/2017
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">
                            {docPrincipal?.titulo ||
                                "Decreto Municipal nº 005/2017 — Regulamentação e Tabela Oficial de Diárias"}
                        </h2>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Disciplina a solicitação, autorização, pagamento e prestação de contas de diárias concedidas a agentes políticos e servidores públicos municipais em deslocamento a serviço fora da sede do Município de São Tomé/RN.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        {docPrincipal?.arquivoUrl && (
                            <a
                                href={docPrincipal.arquivoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-[#003da5] hover:bg-[#002868] text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg"
                            >
                                <FaFilePdf size={15} /> Baixar Decreto Oficial (PDF)
                            </a>
                        )}
                        <Link
                            href="/transparencia/tabela-diarias"
                            className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider transition-all"
                        >
                            <FaTable size={13} /> Ver Tabela de Valores
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#003da5] flex items-center justify-center">
                            <FaCheckCircle size={20} />
                        </div>
                        <h3 className="font-black text-slate-900 text-base">
                            1. Finalidade e Interesse Público
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            As diárias destinam-se exclusivamente a indenizar despesas extraordinárias com alimentação, hospedagem e locomoção urbana em viagens oficiais devidamente motivadas e autorizadas pelo ordenador de despesa.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3">
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <FaClipboardCheck size={20} />
                        </div>
                        <h3 className="font-black text-slate-900 text-base">
                            2. Prestação de Contas Obrigatória
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            No prazo regulamentar após o retorno, o beneficiário deve apresentar o Relatório Circunstanciado de Viagem acompanhado dos comprovantes de participação, certificados ou atestados de comparecimento.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3">
                        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <FaBalanceScale size={20} />
                        </div>
                        <h3 className="font-black text-slate-900 text-base">
                            3. Transparência e Controle (PNTP)
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Todas as portarias e concessões de diárias são publicadas nominalmente com cargo, destino, período, motivo, quantidade e valor concedido no Portal da Transparência.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <FaRoute className="text-[#003da5]" /> Consulta de Diárias Concedidas
                        </h3>
                        <p className="text-xs md:text-sm text-slate-600">
                            Acesse a relação completa de diárias pagas por exercício (2023 a 2026) com as respectivas portarias em PDF.
                        </p>
                    </div>
                    <Link
                        href="/transparencia/diarias"
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#003da5] hover:bg-[#002868] text-white text-xs font-black uppercase tracking-wider transition-all shrink-0"
                    >
                        Consultar Diárias Pagas <FaExternalLinkAlt size={11} />
                    </Link>
                </div>

                <BannerPNTP />
            </div>
        </div>
    );
}
