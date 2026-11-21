"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { History, ExternalLink, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import SeletorPeriodos from "@/components/transparencia/SeletorPeriodos";
import {
    PORTAL_2018_2022_DEFAULT_URL,
    resolvePortalUrl,
    type LinkExternoResumo,
} from "@/config/portais-periodos";
import { MUNICIPIO } from "@/config/municipio";

export default function Transparencia2018_2022Page() {
    const [linksExternos, setLinksExternos] = useState<LinkExternoResumo[]>([]);

    useEffect(() => {
        async function loadExternalLinks() {
            try {
                const res = await fetch("/api/links-externos");
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setLinksExternos(data);
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar links externos:", error);
            }
        }
        loadExternalLinks();
    }, []);

    const portal2018Url = resolvePortalUrl(
        linksExternos,
        "portal-2018-2022",
        PORTAL_2018_2022_DEFAULT_URL
    );

    return (
        <div className="bg-[#f4fbff] min-h-screen text-slate-900 pt-5 sm:pt-7 pb-24">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-7">
                <SeletorPeriodos periodoAtivo="2018-2022" linksExternos={linksExternos} />

                <section className="bg-white rounded-[28px] border border-sky-100 shadow-gov overflow-hidden">
                    <div className="bg-gradient-to-br from-[#01b0ef] via-[#1dc0fa] to-[#0098d4] p-7 sm:p-10 text-white border-b-4 border-[#fdb913]">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fdb913] text-slate-900 text-xs font-extrabold mb-4 shadow-xs">
                            <History size={13} />
                            <span>Acervo Histórico 2018 a 2022 • {MUNICIPIO.nome}/{MUNICIPIO.uf}</span>
                        </div>

                        <h1 className="text-2xl sm:text-4xl font-black font-heading tracking-tight text-white mb-3">
                            Portal da Transparência — Período 2018 a 2022
                        </h1>
                        <p className="text-sm text-sky-50 max-w-2xl leading-relaxed">
                            As prestações de contas, receitas, despesas, licitações e registros fiscais referentes
                            aos exercícios de <strong>2018 a 2022</strong> estão hospedados na plataforma externa{" "}
                            <strong>Governo Transparente</strong>.
                        </p>
                    </div>

                    <div className="p-7 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-2 max-w-xl">
                            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#01b0ef] uppercase tracking-wider">
                                <ShieldCheck size={15} />
                                <span>Redirecionamento Oficial Verificado</span>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed">
                                Clique no botão ao lado para abrir o portal <strong>Governo Transparente</strong> em
                                uma nova aba com segurança, ou navegue pelos períodos mais recentes abaixo.
                            </p>
                            <p className="text-xs font-mono text-slate-500 break-all">{portal2018Url}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                            <a
                                href={portal2018Url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#fdb913] hover:bg-[#e5a60d] text-slate-900 font-extrabold text-sm transition-all shadow-md"
                            >
                                <span>Acessar Governo Transparente (2018–2022)</span>
                                <ExternalLink size={16} />
                            </a>

                            <Link
                                href="/transparencia-2023-2025"
                                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-[#f4fbff] hover:bg-[#e6f8ff] border border-sky-200 text-slate-900 font-bold text-sm transition-all"
                            >
                                <span>Ver 2023–2025</span>
                                <ArrowRight size={15} className="text-[#01b0ef]" />
                            </Link>

                            <Link
                                href="/transparencia"
                                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-[#01b0ef] hover:bg-[#0098d4] text-white font-bold text-sm transition-all"
                            >
                                <Sparkles size={15} />
                                <span>Portal Atual (2026)</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
