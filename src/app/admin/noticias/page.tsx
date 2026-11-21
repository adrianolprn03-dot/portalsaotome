"use client";
import { useState, useEffect } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaSpinner, FaStar } from "react-icons/fa";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatDateFortaleza, isAvisoVigente } from "@/lib/timezone";

type Noticia = {
    id: string;
    titulo: string;
    slug: string;
    publicada: boolean;
    destaque?: boolean;
    tipoPublicacao?: string;
    validoAte?: string | null;
    publicadoEm: string;
    criadoEm?: string;
    secretaria?: { nome: string };
};

export default function AdminNoticiasPage() {
    const [noticias, setNoticias] = useState<Noticia[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchNoticias();
    }, []);

    const fetchNoticias = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/noticias?limit=50");
            const data = await res.json();
            setNoticias(data.items || []);
        } catch {
            toast.error("Erro ao carregar notícias");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDestaque = async (item: Noticia) => {
        try {
            const res = await fetch(`/api/noticias/${item.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ destaque: !item.destaque }),
            });
            if (res.ok) {
                toast.success(
                    !item.destaque
                        ? "Marcada como destaque na página inicial"
                        : "Removida do destaque"
                );
                fetchNoticias();
            } else {
                toast.error("Não foi possível atualizar o destaque");
            }
        } catch {
            toast.error("Erro de conexão");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta publicação?")) return;

        try {
            const res = await fetch(`/api/noticias/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Publicação excluída com sucesso");
                fetchNoticias();
            } else {
                toast.error("Erro ao excluir publicação");
            }
        } catch {
            toast.error("Erro de conexão");
        }
    };

    const filtered = noticias.filter((n) =>
        n.titulo.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Gerenciar Notícias e Avisos com Prazo
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Gerencie notícias, matéria em destaque na home e avisos oficiais com validade (America/Fortaleza).
                    </p>
                </div>
                <Link href="/admin/noticias/nova" className="btn-primary flex items-center gap-2">
                    <FaPlus /> Nova Publicação
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar notícia ou aviso..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                                <th className="px-6 py-4">Título</th>
                                <th className="px-6 py-4">Tipo / Prazo</th>
                                <th className="px-6 py-4">Destaque Home</th>
                                <th className="px-6 py-4">Secretaria</th>
                                <th className="px-6 py-4">Publicação</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <FaSpinner className="animate-spin inline-block text-primary-500 text-2xl" />
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">
                                        Nenhuma publicação encontrada.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((n) => {
                                    const isAviso = n.tipoPublicacao === "aviso";
                                    const vigente = isAviso ? isAvisoVigente(n.validoAte) : true;
                                    const prazoTexto = n.validoAte
                                        ? formatDateFortaleza(n.validoAte, "short")
                                        : null;

                                    return (
                                        <tr key={n.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-gray-800 max-w-xs">
                                                <div className="line-clamp-2">{n.titulo}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span
                                                        className={`inline-flex w-fit px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                            isAviso
                                                                ? "bg-amber-100 text-amber-800"
                                                                : "bg-sky-100 text-sky-800"
                                                        }`}
                                                    >
                                                        {isAviso ? "Aviso com Prazo" : "Notícia"}
                                                    </span>
                                                    {isAviso && prazoTexto && (
                                                        <span
                                                            className={`text-[11px] font-medium ${
                                                                vigente ? "text-emerald-700" : "text-red-600"
                                                            }`}
                                                        >
                                                            {vigente
                                                                ? `Vigente até ${prazoTexto}`
                                                                : `Vencido em ${prazoTexto}`}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleDestaque(n)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                                                        n.destaque
                                                            ? "bg-[#fdb913] text-slate-900"
                                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                    }`}
                                                    title="Alternar destaque na página inicial"
                                                >
                                                    <FaStar size={11} />
                                                    <span>{n.destaque ? "Destaque" : "Normal"}</span>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {n.secretaria?.nome || "Geral"}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {formatDateFortaleza(n.publicadoEm || n.criadoEm, "short") || "—"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                        n.publicada
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-orange-100 text-orange-700"
                                                    }`}
                                                >
                                                    {n.publicada ? "Publicada" : "Rascunho"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/admin/noticias/editar/${n.id}`}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <FaEdit />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(n.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
