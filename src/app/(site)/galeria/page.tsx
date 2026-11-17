"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Images, Eye, Calendar } from "lucide-react";
import PageHeader from "@/components/PageHeader";

type Foto = {
    id: string;
    titulo: string;
    descricao: string;
    arquivo: string;
    album: string;
    criadoEm: string;
};

export default function GaleriaPage() {
    const [fotos, setFotos] = useState<Foto[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAlbum, setSelectedAlbum] = useState("Todos");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/galeria");
                const data = await res.json();
                setFotos(data || []);
            } catch (error) {
                console.error("Erro ao buscar fotos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const albuns = [
        "Todos",
        ...Array.from(new Set(fotos.map((f) => f.album || "Geral"))),
    ].filter(Boolean);

    const filteredFotos =
        selectedAlbum === "Todos"
            ? fotos
            : fotos.filter((f) => (f.album || "Geral") === selectedAlbum);

    return (
        <div className="min-h-screen bg-[#f4fbff]">
            <PageHeader
                title="Galeria de Fotos"
                subtitle="Acompanhe registros fotográficos das ações, obras e eventos realizados no município de São Tomé."
                variant="premium"
                icon={<Images className="w-8 h-8" />}
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Galeria" },
                ]}
            />

            {/* Filtros de Álbum */}
            <div className="bg-white border-b border-[#01b0ef]/15 overflow-x-auto">
                <div className="max-w-[1240px] mx-auto px-6 py-4 flex items-center gap-2.5 no-scrollbar">
                    {albuns.map((album) => (
                        <button
                            key={album}
                            onClick={() => setSelectedAlbum(album)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                selectedAlbum === album
                                    ? "bg-[#01b0ef] text-white shadow-civic-sm"
                                    : "bg-[#f4fbff] text-slate-600 hover:text-[#01b0ef] hover:bg-[#01b0ef]/10"
                            }`}
                        >
                            {album}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-[1240px] mx-auto px-6 py-14 pb-24">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-10 h-10 border-3 border-[#01b0ef] border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-slate-600 font-semibold text-sm">
                            Carregando acervo fotográfico...
                        </p>
                    </div>
                ) : fotos.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#01b0ef]/30">
                        <div className="w-14 h-14 rounded-2xl bg-[#01b0ef]/10 text-[#01b0ef] flex items-center justify-center mx-auto mb-3">
                            <Images size={26} />
                        </div>
                        <p className="font-heading text-lg font-bold text-slate-900">
                            A galeria está vazia no momento
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                            Novos registros de eventos e obras públicas serão adicionados em breve.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredFotos.map((f) => (
                            <div
                                key={f.id}
                                className="group relative bg-white rounded-2xl overflow-hidden aspect-square h-[290px] shadow-civic-sm hover:shadow-civic-xl transition-all border border-slate-200/80 hover:border-[#01b0ef]"
                            >
                                <Image
                                    src={f.arquivo}
                                    alt={f.titulo}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                                    <span className="inline-block w-fit px-2.5 py-0.5 rounded-full bg-[#fdb913] text-slate-900 text-[10px] font-extrabold uppercase mb-1.5">
                                        {f.album || "Geral"}
                                    </span>
                                    <h3 className="font-heading text-white font-bold leading-snug mb-2 line-clamp-2">
                                        {f.titulo}
                                    </h3>
                                    <div className="flex items-center justify-between text-xs text-white/85 pt-2 border-t border-white/20">
                                        <span className="flex items-center gap-1.5 font-mono text-[11px]">
                                            <Calendar size={12} className="text-[#fdb913]" />
                                            {new Date(f.criadoEm).toLocaleDateString("pt-BR")}
                                        </span>
                                        <span className="flex items-center gap-1 text-[#fdb913] font-bold">
                                            <Eye size={13} /> Ver
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
