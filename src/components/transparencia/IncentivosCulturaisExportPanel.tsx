"use client";

import { FaFileCsv, FaFileCode, FaFileExcel, FaDownload, FaCheckCircle, FaLockOpen, FaCode } from "react-icons/fa";

export default function IncentivosCulturaisExportPanel({ exercicioAno }: { exercicioAno: string }) {
    const handleDownload = (format: string) => {
        window.open(`/api/transparencia/incentivos-culturais/export?format=${format}`, "_blank");
    };

    return (
        <div className="bg-gradient-to-br from-[#01b0ef] via-[#1dc0fa] to-[#0098d4] text-white rounded-[2.5rem] p-8 md:p-10 mb-14 shadow-2xl shadow-[#01b0ef]/20 border-b-4 border-[#fdb913] relative overflow-hidden group">
            {/* Background Accent glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none group-hover:bg-white/25 transition-all duration-700" />
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                <div className="space-y-3 max-w-2xl">
                    <div className="inline-flex items-center gap-2 bg-[#fdb913] text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                        <FaLockOpen size={10} /> Formatos Abertos e Editáveis – PNTP 2026
                    </div>
                    <h3 className="text-2xl font-black tracking-tight uppercase">
                        Gravação de Dados em Formatos Editáveis
                    </h3>
                    <p className="text-white/95 text-xs font-medium leading-relaxed">
                        Em integral conformidade com os critérios da <strong className="text-white font-bold">Cartilha de Transparência Pública PNTP 2026</strong>, 
                        disponibilizamos o download integral das informações de incentivos e editais culturais em arquivos de dados abertos, processáveis e editáveis por software de planilha ou análise automatizada.
                    </p>
                </div>

                {/* Grid de Botões de Exportação Editáveis */}
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {/* CSV Editável */}
                    <button
                        onClick={() => handleDownload("csv")}
                        className="flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-[#fdb913] text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-lg hover:scale-105"
                        title="Baixar em formato CSV editável (Excel, LibreOffice, Google Sheets)"
                    >
                        <FaFileCsv size={16} />
                        <span>CSV Editável</span>
                    </button>

                    {/* XLSX Planilha */}
                    <button
                        onClick={() => handleDownload("xlsx")}
                        className="flex items-center gap-2 px-5 py-3.5 bg-[#fdb913] hover:bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-lg hover:scale-105"
                        title="Baixar em formato de Planilha XLSX"
                    >
                        <FaFileExcel size={16} />
                        <span>Planilha (XLSX)</span>
                    </button>

                    {/* JSON Estruturado */}
                    <button
                        onClick={() => handleDownload("json")}
                        className="flex items-center gap-2 px-5 py-3.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-lg shadow-blue-950/30 hover:scale-105"
                        title="Baixar em formato JSON estruturado editável"
                    >
                        <FaFileCode size={16} />
                        <span>JSON Aberto</span>
                    </button>

                    {/* XML Dados Abertos */}
                    <button
                        onClick={() => handleDownload("xml")}
                        className="flex items-center gap-2 px-5 py-3.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-lg shadow-amber-950/30 hover:scale-105"
                        title="Baixar em formato XML dados abertos"
                    >
                        <FaCode size={16} />
                        <span>XML Dados</span>
                    </button>
                </div>
            </div>

            {/* Rodapé Informativo PNTP */}
            <div className="mt-6 pt-6 border-t border-purple-800/30 flex items-center justify-between text-[10px] font-bold text-purple-300/60">
                <span className="flex items-center gap-1.5">
                    <FaCheckCircle className="text-emerald-400 text-xs" />
                    Padrão de Dados Abertos e Gravação Editável PNTP Atendido (Exercício {exercicioAno})
                </span>
                <span className="hidden sm:inline-block">Prefeitura Municipal de São Tomé / RN</span>
            </div>
        </div>
    );
}
