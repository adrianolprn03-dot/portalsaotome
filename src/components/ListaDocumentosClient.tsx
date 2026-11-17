"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    Download,
    Calendar,
    Search,
    ChevronDown,
    Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BannerPNTP from "./transparencia/BannerPNTP";
import PDFViewer from "@/components/transparencia/PDFViewer";

type Documento = {
    id: string;
    titulo: string;
    tipo: string;
    arquivo: string | null;
    documentUrl?: string | null;
    ano: number | null;
    tamanho: number | null;
    criadoEm: string;
};

interface ListaDocumentosClientProps {
    tipoDocumento: string;
    tituloVazio?: string;
    mensagemVazia?: string;
}

export default function ListaDocumentosClient({
    tipoDocumento,
    tituloVazio = "Nenhum documento encontrado",
    mensagemVazia = "Tente ajustar seus filtros ou realizar uma nova busca.",
}: ListaDocumentosClientProps) {
    const [documentos, setDocumentos] = useState<Documento[]>([]);
    const [loading, setLoading] = useState(true);
    const [anoFiltro, setAnoFiltro] = useState("");
    const [buscaFiltro, setBuscaFiltro] = useState("");
    const [pdfViewer, setPdfViewer] = useState<{
        url: string;
        titulo: string;
    } | null>(null);

    const currentYear = new Date().getFullYear();
    const anos = Array.from({ length: 15 }, (_, i) =>
        (currentYear - i).toString()
    );

    const fetchDocumentos = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            query.append("tipo", tipoDocumento);
            if (anoFiltro) query.append("ano", anoFiltro);

            const res = await fetch(`/api/documentos?${query.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setDocumentos(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocumentos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [anoFiltro]);

    const documentosFiltrados = documentos.filter((doc) =>
        doc.titulo.toLowerCase().includes(buscaFiltro.toLowerCase())
    );

    return (
        <div className="max-w-[1240px] mx-auto px-6 py-10">
            {/* Painel de Filtros */}
            <div className="bg-white rounded-2xl p-6 shadow-civic-sm border border-[#01b0ef]/20 flex flex-col md:flex-row items-end gap-4 mb-10">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                        Pesquisar no Acervo Oficial
                    </label>
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#01b0ef]"
                        />
                        <input
                            type="text"
                            placeholder="Digite o número, ano ou assunto do documento..."
                            value={buscaFiltro}
                            onChange={(e) => setBuscaFiltro(e.target.value)}
                            className="input-field pl-11"
                        />
                    </div>
                </div>

                <div className="w-full md:w-56">
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                        Exercício Financeiro
                    </label>
                    <div className="relative">
                        <Calendar
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#01b0ef] pointer-events-none"
                        />
                        <select
                            value={anoFiltro}
                            onChange={(e) => setAnoFiltro(e.target.value)}
                            className="input-field pl-11 pr-10 appearance-none cursor-pointer font-mono"
                        >
                            <option value="">Todos os Anos</option>
                            {anos.map((a) => (
                                <option key={a} value={a}>
                                    {a}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            size={15}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                    </div>
                </div>
            </div>

            {/* Listagem */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#01b0ef]" />
                        <h2 className="font-heading text-sm font-bold text-slate-800 uppercase tracking-wider">
                            Base Oficial de Documentos
                        </h2>
                    </div>
                    <div className="text-xs font-mono font-extrabold bg-[#fdb913] text-slate-900 px-3.5 py-1.5 rounded-full">
                        {documentosFiltrados.length}{" "}
                        {documentosFiltrados.length === 1
                            ? "registro"
                            : "registros"}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col justify-center items-center py-24 gap-4 bg-white rounded-3xl border border-slate-200/80">
                        <div className="w-10 h-10 border-3 border-[#01b0ef] border-t-transparent rounded-full animate-spin" />
                        <p className="font-semibold text-slate-500 text-xs">
                            Consultando acervo documental...
                        </p>
                    </div>
                ) : documentosFiltrados.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl border border-dashed border-[#01b0ef]/30 p-16 text-center"
                    >
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#01b0ef]/10 text-[#01b0ef] mb-4">
                            <Search size={22} />
                        </div>
                        <h3 className="font-heading text-lg font-bold text-slate-900 mb-1">
                            {tituloVazio}
                        </h3>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto">
                            {mensagemVazia}
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        <AnimatePresence mode="popLayout">
                            {documentosFiltrados.map((doc, idx) => (
                                <motion.div
                                    key={doc.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="group bg-white rounded-2xl border border-slate-200/80 hover:border-[#01b0ef] shadow-civic-sm hover:shadow-civic-lg transition-all duration-200 flex flex-col justify-between"
                                >
                                    <div className="p-5 flex-1">
                                        <div className="flex items-start gap-3.5">
                                            <div className="w-11 h-11 bg-[#01b0ef]/10 border border-[#01b0ef]/25 text-[#01b0ef] rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#01b0ef] group-hover:text-white transition-colors">
                                                <FileText size={20} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                                    <span className="text-[10px] font-bold text-slate-900 bg-[#fdb913]/25 px-2 py-0.5 rounded border border-[#fdb913]/50 uppercase tracking-wider">
                                                        {tipoDocumento.replace("-", " ")}
                                                    </span>
                                                    {doc.ano && (
                                                        <span className="text-[11px] font-mono font-bold text-[#01b0ef]">
                                                            {doc.ano}
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="font-heading font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-[#01b0ef] transition-colors">
                                                    {doc.titulo.replace(/\.pdf$/i, "")}
                                                </h4>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-5 py-3.5 bg-[#f4fbff] border-t border-slate-100 flex items-center gap-2 rounded-b-2xl">
                                        {doc.arquivo || doc.documentUrl ? (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        setPdfViewer({
                                                            url: (doc.arquivo || doc.documentUrl)!,
                                                            titulo: doc.titulo.replace(
                                                                /\.pdf$/i,
                                                                ""
                                                            ),
                                                        })
                                                    }
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#01b0ef] hover:bg-[#0098d4] text-white rounded-xl text-xs font-bold transition-all"
                                                >
                                                    <Eye size={14} />
                                                    <span>Visualizar</span>
                                                </button>
                                                <a
                                                    href={doc.arquivo || doc.documentUrl || "#"}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-1.5 py-2 px-3.5 bg-[#fdb913] hover:brightness-105 text-slate-900 rounded-xl text-xs font-bold transition-all"
                                                >
                                                    <Download size={13} />
                                                    <span>PDF</span>
                                                </a>
                                            </>
                                        ) : (
                                            <div className="w-full py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-semibold text-center">
                                                Arquivo digital em processamento
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Rodapé Informativo */}
            <div className="mt-16 pt-10 border-t border-slate-200/80">
                <BannerPNTP />
            </div>

            <AnimatePresence>
                {pdfViewer && (
                    <PDFViewer
                        url={pdfViewer.url}
                        titulo={pdfViewer.titulo}
                        onClose={() => setPdfViewer(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
