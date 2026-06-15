"use client";
import { useState, useEffect } from "react";
import { FaNewspaper, FaSpinner, FaDownload, FaSearch, FaCalendar, FaTag, FaFilter, FaFilePdf, FaEye } from "react-icons/fa";
import { FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import BannerPNTP from "@/components/transparencia/BannerPNTP";
import { exportToCSV, exportToJSON, exportToPDF, exportToXLSX } from "@/lib/exportUtils";
import TransparencyFilters from "@/components/transparencia/TransparencyFilters";
import PDFViewer from "@/components/transparencia/PDFViewer";

type Publicacao = {
    id: string;
    titulo: string;
    tipo: string;
    descricao: string;
    dataPublicacao: string;
    ano: number;
    secretaria: string;
    arquivo: string | null;
    documentUrl: string | null;
};

const TIPOS = [
    "Diário Oficial",
    "Edital",
    "Aviso",
    "Resultado",
    "Extrato de Contrato",
    "Extrato de Convênio",
    "Nota de Esclarecimento",
    "Portaria",
    "Decreto Municipal",
    "Resolução",
    "Lei Municipal",
];

const TIPO_COR: Record<string, string> = {
    "Diário Oficial": "bg-blue-100 text-blue-700 border-blue-200",
    "Edital": "bg-purple-100 text-purple-700 border-purple-200",
    "Aviso": "bg-amber-100 text-amber-700 border-amber-200",
    "Resultado": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Extrato de Contrato": "bg-orange-100 text-orange-700 border-orange-200",
    "Extrato de Convênio": "bg-cyan-100 text-cyan-700 border-cyan-200",
    "Nota de Esclarecimento": "bg-gray-100 text-gray-700 border-gray-200",
    "Portaria": "bg-slate-100 text-slate-700 border-slate-200",
    "Decreto Municipal": "bg-amber-50 text-amber-600 border-amber-100",
    "Resolução": "bg-rose-100 text-rose-700 border-rose-200",
    "Lei Municipal": "bg-blue-50 text-blue-600 border-blue-100",
};

const MOCK: Publicacao[] = [
    { id: "1", titulo: "Diário Oficial nº 001 – Janeiro/2026", tipo: "Diário Oficial", descricao: "Publicação oficial dos atos administrativos do mês de Janeiro de 2026.", dataPublicacao: "2026-01-31", ano: 2026, secretaria: "Administração", arquivo: null, documentUrl: null },
    { id: "2", titulo: "Aviso de Licitação – Pregão Eletrônico nº 006/2026", tipo: "Aviso", descricao: "Aviso de abertura de processo licitatório para aquisição de material de construção.", dataPublicacao: "2026-02-10", ano: 2026, secretaria: "Compras", arquivo: null, documentUrl: null },
    { id: "3", titulo: "Resultado – Concorrência nº 001/2026", tipo: "Resultado", descricao: "Resultado de julgamento da Concorrência nº 001/2026 – obra de ampliação da escola municipal.", dataPublicacao: "2026-02-20", ano: 2026, secretaria: "Obras", arquivo: null, documentUrl: null },
    { id: "4", titulo: "Extrato – Contrato nº 015/2026", tipo: "Extrato de Contrato", descricao: "Extrato do contrato firmado com a empresa XYZ para prestação de serviços de limpeza.", dataPublicacao: "2026-03-05", ano: 2026, secretaria: "Administração", arquivo: null, documentUrl: null },
    { id: "5", titulo: "Portaria nº 024/2026 – Designação de Fiscal", tipo: "Portaria", descricao: "Designa servidor para atuar como fiscal do Contrato nº 015/2026.", dataPublicacao: "2026-03-07", ano: 2026, secretaria: "Administração", arquivo: null, documentUrl: null },
    { id: "6", titulo: "Diário Oficial nº 002 – Fevereiro/2026", tipo: "Diário Oficial", descricao: "Publicação oficial dos atos administrativos do mês de Fevereiro de 2026.", dataPublicacao: "2026-02-28", ano: 2026, secretaria: "Administração", arquivo: null, documentUrl: null },
];

export default function PublicacoesPage() {
    const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState("");
    const [ano, setAno] = useState(new Date().getFullYear().toString());
    const [mes, setMes] = useState("");
    const [tipoFiltro, setTipoFiltro] = useState("");
    const [pdfViewer, setPdfViewer] = useState<{ url: string; titulo: string } | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (ano) query.append("ano", ano);
            // If no specific type filter, we fetch common publication types
            if (tipoFiltro) {
                query.append("tipo", tipoFiltro);
            } else {
                // Fetch all relevant transparency types for this page
                query.append("tipo", "Diário Oficial,Edital,Aviso,Resultado,Extrato de Contrato,Extrato de Convênio,Nota de Esclarecimento,Portaria,Decreto Municipal,Resolução,Lei Municipal,Outros");
            }
            
            const res = await fetch(`/api/documentos?${query.toString()}`);
            if (res.ok) {
                const data = await res.json();
                // Map API data to the component's expected structure
                const formatted = data.map((d: any) => ({
                    id: d.id,
                    titulo: d.titulo,
                    tipo: d.tipo,
                    descricao: d.titulo, // API doesn't have description yet, use title
                    dataPublicacao: d.criadoEm,
                    ano: d.ano || new Date(d.criadoEm).getFullYear(),
                    secretaria: "Prefeitura Municipal", // Placeholder
                    arquivo: d.arquivo,
                    documentUrl: d.documentUrl
                }));
                setPublicacoes(formatted);
            }
        } catch (error) {
            console.error("Erro ao carregar publicações:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [ano, mes, tipoFiltro]);

    const filtradas = publicacoes.filter(p => {
        const b = busca.toLowerCase();
        const matchBusca = !busca || p.titulo.toLowerCase().includes(b);
        return matchBusca;
    });

    const handleClear = () => {
        setBusca(""); setAno(new Date().getFullYear().toString()); setMes(""); setTipoFiltro("");
    };

    const handleExport = (format: "pdf" | "csv" | "json" | "xlsx") => {
        const payload = filtradas.map(p => ({
            "Título": p.titulo, "Tipo": p.tipo, "Secretaria": p.secretaria,
            "Data": new Date(p.dataPublicacao).toLocaleDateString("pt-BR"),
            "Descrição": p.descricao,
        }));
        const filename = `publicacoes_oficiais_${ano}`;
        const title = `Publicações Oficiais – São Tomé/RN (${ano})`;
        if (format === "csv") exportToCSV(payload, filename);
        else if (format === "json") exportToJSON(payload, filename);
        else if (format === "xlsx") exportToXLSX(payload, filename);
        else exportToPDF(payload, filename, title);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-['Montserrat',sans-serif]">
            <PageHeader
                title="Publicações Oficiais"
                subtitle="Acesso centralizado a editais, avisos, extratos, resultados e demais atos publicados pela administração municipal."
                variant="premium"
                icon={<FileText />}
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Transparência", href: "/transparencia" },
                    { label: "Publicações" }
                ]}
            />

            <div className="max-w-[1240px] mx-auto px-6 py-12 -mt-10 relative z-30">
                <TransparencyFilters
                    searchValue={busca}
                    onSearch={setBusca}
                    currentYear={ano}
                    onYearChange={setAno}
                    currentMonth={mes}
                    onMonthChange={setMes}
                    onClear={handleClear}
                    onExport={handleExport}
                    placeholder="Buscar por título ou palavras-chave..."
                >
                    <select
                        value={tipoFiltro}
                        onChange={e => setTipoFiltro(e.target.value)}
                        className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-[11px] font-bold text-gray-700 outline-none shadow-sm"
                    >
                        <option value="">Todos os Tipos</option>
                        {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </TransparencyFilters>

                {/* Resumo */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 border-l-4 border-l-slate-500">
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Total de Publicações</div>
                        <div className="text-xl font-black text-slate-600">{filtradas.length}</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 border-l-4 border-l-blue-500">
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Tipos Diferentes</div>
                        <div className="text-xl font-black text-blue-600">{new Set(filtradas.map(p => p.tipo)).size}</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 border-l-4 border-l-emerald-500">
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Exercício</div>
                        <div className="text-xl font-black text-emerald-600">{ano}</div>
                    </div>
                </div>

                {/* Lista */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex flex-col justify-center items-center py-32 gap-6">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
                                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
                            </div>
                            <p className="font-black text-gray-300 text-[9px] uppercase tracking-[0.4em] animate-pulse">Carregando publicações...</p>
                        </div>
                    ) : filtradas.length === 0 ? (
                        <div className="bg-white rounded-[3.5rem] border border-dashed border-gray-200 p-24 text-center shadow-inner">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gray-50 text-gray-300 mb-8 border border-gray-100">
                                <FaNewspaper size={24} />
                            </div>
                            <h4 className="text-xl font-black text-gray-800 uppercase tracking-tighter mb-3">Nenhuma publicação localizada</h4>
                            <p className="text-gray-400 font-medium text-sm max-w-sm mx-auto">Ajuste os filtros para encontrar a publicação desejada.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            <AnimatePresence mode="popLayout">
                                {filtradas.map((pub, idx) => (
                                    <motion.div 
                                        key={pub.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.04 }}
                                        className="group bg-white rounded-xl border border-slate-200/80 hover:border-primary-300 shadow-sm hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 flex flex-col"
                                    >
                                        {/* Card body */}
                                        <div className="p-5 flex-1">
                                            <div className="flex items-start gap-4">
                                                <div className="w-11 h-11 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                                                    <FaFilePdf size={18} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-bold text-slate-800 text-sm leading-snug mb-1.5 line-clamp-2 group-hover:text-primary-700 transition-colors">
                                                        {pub.titulo.replace(/\.pdf$/i, "")}
                                                    </h4>
                                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${TIPO_COR[pub.tipo] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                                                            {pub.tipo}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 font-medium">
                                                            {new Date(pub.dataPublicacao).toLocaleDateString("pt-BR")}
                                                        </span>
                                                    </div>
                                                    {pub.secretaria && (
                                                        <span className="inline-block text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100/50 uppercase tracking-wider">
                                                            {pub.secretaria}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card footer com ações */}
                                        <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-2">
                                            {pub.arquivo || pub.documentUrl ? (
                                                <>
                                                    <button
                                                        onClick={() => setPdfViewer({ url: (pub.arquivo || pub.documentUrl)!, titulo: pub.titulo.replace(/\.pdf$/i, "") })}
                                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-bold hover:bg-primary-600 hover:text-white transition-all duration-200"
                                                    >
                                                        <FaEye size={12} />
                                                        Visualizar
                                                    </button>
                                                    <a
                                                        href={pub.arquivo || pub.documentUrl || "#"}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-700 hover:text-white transition-all duration-200"
                                                    >
                                                        <FaDownload size={11} />
                                                        Baixar
                                                    </a>
                                                </>
                                            ) : (
                                                <div className="w-full py-2.5 bg-slate-50 text-slate-400 rounded-lg text-xs font-bold text-center border border-dashed border-slate-200">
                                                    Arquivo Indisponível
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                <div className="mt-20">
                    <BannerPNTP />
                </div>
            </div>

            {/* ═══════ MODAL PDF VIEWER ═══════ */}
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
