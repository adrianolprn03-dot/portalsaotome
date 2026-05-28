"use client";

import { useEffect } from "react";
import { FaFilePdf, FaDownload, FaTimes, FaGoogleDrive, FaExternalLinkAlt } from "react-icons/fa";
import { motion } from "framer-motion";

interface PDFViewerProps {
    url: string;
    titulo: string;
    onClose: () => void;
}

export default function PDFViewer({ url, titulo, onClose }: PDFViewerProps) {
    const isGoogleDrive = url.includes("drive.google.com") || url.includes("docs.google.com");
    const viewerUrl = isGoogleDrive ? url : `/api/pdf-proxy?url=${encodeURIComponent(url)}`;

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handler);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handler);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[40] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 md:p-8 pt-24 md:pt-32"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-full flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Barra superior */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 ${isGoogleDrive ? 'bg-blue-100 text-blue-500' : 'bg-red-100 text-red-500'} rounded-xl flex items-center justify-center shrink-0`}>
                            {isGoogleDrive ? <FaGoogleDrive size={16} /> : <FaFilePdf size={16} />}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold text-slate-800 truncate">{titulo}</h3>
                            <p className="text-[11px] text-slate-400">Visualizador de Documento</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <a
                            href={viewerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
                        >
                            {isGoogleDrive ? <FaExternalLinkAlt size={12} /> : <FaDownload size={12} />}
                            <span className="hidden sm:inline">{isGoogleDrive ? "Abrir" : "Baixar PDF"}</span>
                        </a>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-500 transition-colors"
                        >
                            <FaTimes size={14} />
                        </button>
                    </div>
                </div>

                {/* Conteúdo principal */}
                {isGoogleDrive ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-8 text-center overflow-y-auto">
                        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/10 mb-8 border border-slate-100">
                            <FaGoogleDrive size={48} className="text-blue-500" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-4">Arquivo no Google Drive</h2>
                        <p className="text-slate-500 max-w-lg mb-8 leading-relaxed font-medium">
                            Este documento está hospedado no Google Drive. Devido a políticas de segurança e privacidade do Google, não é possível visualizá-lo diretamente nesta janela.
                        </p>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-xl shadow-blue-600/30 flex items-center gap-3 text-lg"
                        >
                            <FaExternalLinkAlt />
                            Abrir Documento no Google Drive
                        </a>
                        <p className="mt-8 text-xs font-semibold text-slate-400 bg-slate-100 px-4 py-2 rounded-lg">
                            Dica: Caso apareça "Você precisa ter acesso", utilize a opção "Solicitar Acesso" no link original.
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 relative bg-slate-200">
                        <iframe
                            src={viewerUrl}
                            className="absolute inset-0 w-full h-full border-0"
                            title={titulo}
                            allowFullScreen
                        />
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
