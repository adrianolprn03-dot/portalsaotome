"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    FiPlus,
    FiEdit,
    FiTrash2,
    FiFileText,
    FiSearch,
    FiCopy,
    FiExternalLink,
    FiCheckCircle,
    FiXCircle,
    FiChevronLeft,
    FiChevronRight,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { TIPOS_LEGISLACAO } from "@/lib/rbac-routes";

type Legislacao = {
    id: string;
    tipo: string;
    numero: string;
    ano: number;
    ementa: string;
    categoria?: string | null;
    dataAto?: string | null;
    situacaoVigencia?: string | null;
    orgaoResponsavel?: string | null;
    arquivo: string | null;
    ativo: boolean;
    criadoEm: string;
};

export default function LegislacaoAdminPage() {
    const [legislacoes, setLegislacoes] = useState<Legislacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [tipoFilter, setTipoFilter] = useState("");
    const [anoFilter, setAnoFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [vigenciaFilter, setVigenciaFilter] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 25;

    const fetchLegislacoes = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (tipoFilter) query.append("tipo", tipoFilter);
            if (anoFilter) query.append("ano", anoFilter);
            if (searchQuery.trim()) query.append("q", searchQuery.trim());
            if (vigenciaFilter) query.append("situacaoVigencia", vigenciaFilter);
            query.append("page", String(page));
            query.append("limit", String(limit));

            const res = await fetch(`/api/admin/legislacao?${query.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setLegislacoes(data.items || []);
                setTotal(data.total || 0);
                setTotalPages(data.totalPages || Math.max(1, Math.ceil((data.total || 0) / limit)));
            }
        } catch (error) {
            console.error("Erro ao buscar legislação:", error);
            toast.error("Erro ao carregar itens de legislação.");
        } finally {
            setLoading(false);
        }
    }, [tipoFilter, anoFilter, searchQuery, vigenciaFilter, page]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLegislacoes();
        }, 250);
        return () => clearTimeout(timer);
    }, [fetchLegislacoes]);

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este ato normativo? Essa ação não pode ser desfeita.")) return;

        try {
            const res = await fetch(`/api/admin/legislacao/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success("Ato normativo excluído com sucesso!");
                fetchLegislacoes();
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error || "Erro ao excluir legislação.");
            }
        } catch {
            toast.error("Erro ao excluir legislação.");
        }
    };

    const handleToggleAtivo = async (item: Legislacao) => {
        try {
            const res = await fetch(`/api/admin/legislacao/${item.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ativo: !item.ativo }),
            });
            if (res.ok) {
                toast.success(
                    !item.ativo ? "Ato publicado no portal!" : "Ato ocultado do portal."
                );
                fetchLegislacoes();
            } else {
                toast.error("Erro ao alterar status da norma.");
            }
        } catch {
            toast.error("Erro de conexão ao alterar status.");
        }
    };

    const handleDuplicate = async (item: Legislacao) => {
        try {
            const res = await fetch("/api/admin/legislacao", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tipo: item.tipo,
                    numero: `${item.numero} (Cópia)`,
                    ano: item.ano,
                    ementa: item.ementa,
                    arquivo: item.arquivo,
                    categoria: item.categoria,
                    situacaoVigencia: item.situacaoVigencia || "vigente",
                    orgaoResponsavel: item.orgaoResponsavel || "Gabinete do Prefeito",
                    ativo: false,
                }),
            });
            if (res.ok) {
                toast.success("Cópia criada como rascunho (Inativo) para edição!");
                fetchLegislacoes();
            } else {
                toast.error("Erro ao duplicar norma.");
            }
        } catch {
            toast.error("Erro ao duplicar norma.");
        }
    };

    const formatTipo = (tipo: string) => {
        const found = TIPOS_LEGISLACAO.find((t) => t.value === tipo);
        return found ? found.label : tipo;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Legislação Municipal, Decretos, Portarias e Atos Diversos
                    </h1>
                    <p className="text-sm text-gray-500">
                        Inclua, edite, publique, duplique ou exclua Leis, Decretos, Portarias, Resoluções, LOA/LDO/PPA e Legislações Diversas ({total} registros encontrados).
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href="/transparencia/legislacao"
                        target="_blank"
                        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
                    >
                        <FiExternalLink /> Ver no Portal
                    </Link>
                    <Link
                        href="/admin/legislacao/new"
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#0098d4] transition-colors shadow-sm"
                    >
                        <FiPlus size={16} />
                        Incluir Nova Norma
                    </Link>
                </div>
            </div>

            {/* Atalhos Rápidos por Categoria de Ato */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => { setTipoFilter(""); setPage(1); }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        tipoFilter === ""
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                >
                    Todos os Atos
                </button>
                {TIPOS_LEGISLACAO.map((t) => (
                    <button
                        key={t.value}
                        onClick={() => { setTipoFilter(t.value); setPage(1); }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            tipoFilter === t.value
                                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Barra de Busca e Filtros */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-5">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                        Pesquisar por Número, Ementa ou Assunto
                    </label>
                    <div className="relative">
                        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Ex: 005/2017, diárias, crédito suplementar, nomeação..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                        Tipo de Legislação
                    </label>
                    <select
                        value={tipoFilter}
                        onChange={(e) => {
                            setTipoFilter(e.target.value);
                            setPage(1);
                        }}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Todos os tipos</option>
                        {TIPOS_LEGISLACAO.map((t) => (
                            <option key={t.value} value={t.value}>
                                {t.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                        Ano
                    </label>
                    <input
                        type="number"
                        placeholder="Ex: 2026"
                        value={anoFilter}
                        onChange={(e) => {
                            setAnoFilter(e.target.value);
                            setPage(1);
                        }}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                        Vigência
                    </label>
                    <select
                        value={vigenciaFilter}
                        onChange={(e) => {
                            setVigenciaFilter(e.target.value);
                            setPage(1);
                        }}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Todas</option>
                        <option value="vigente">Vigente</option>
                        <option value="alterada">Alterada</option>
                        <option value="revogada">Revogada</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : legislacoes.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
                    Nenhuma norma encontrada para os filtros selecionados. Clique em &quot;Incluir Nova Norma&quot; para cadastrar.
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Norma / Ato
                                    </th>
                                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Ementa / Assunto
                                    </th>
                                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Vigência / Status
                                    </th>
                                    <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {legislacoes.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FiFileText className="text-blue-500 mr-2.5 shrink-0" size={18} />
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">
                                                        {formatTipo(item.tipo)} nº {item.numero}
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                                        <span>Exercício: {item.ano}</span>
                                                        {item.categoria && (
                                                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px]">
                                                                {item.categoria}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-800 line-clamp-2">{item.ementa}</div>
                                            {item.arquivo && (
                                                <a
                                                    href={item.arquivo}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs font-bold text-blue-600 hover:underline mt-1 inline-flex items-center gap-1"
                                                >
                                                    <FiExternalLink size={11} /> Abrir PDF / Documento
                                                </a>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col items-start gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleAtivo(item)}
                                                    title="Clique para alternar entre Publicado (Ativo) e Oculto (Inativo)"
                                                    className={`px-2.5 py-0.5 inline-flex items-center gap-1 text-xs leading-5 font-bold rounded-full cursor-pointer transition-all ${
                                                        item.ativo
                                                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                            : "bg-red-100 text-red-800 hover:bg-red-200"
                                                    }`}
                                                >
                                                    {item.ativo ? <FiCheckCircle size={11} /> : <FiXCircle size={11} />}
                                                    {item.ativo ? "Publicado" : "Inativo"}
                                                </button>
                                                <span className="text-[11px] text-gray-500 capitalize">
                                                    Vigência: {item.situacaoVigencia || "vigente"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDuplicate(item)}
                                                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Duplicar / Clonar Norma"
                                                >
                                                    <FiCopy size={16} />
                                                </button>
                                                <Link
                                                    href={`/admin/legislacao/editar/${item.id}`}
                                                    className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar Norma"
                                                >
                                                    <FiEdit size={16} />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Excluir Norma"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginação */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
                        <div>
                            Mostrando página <strong>{page}</strong> de <strong>{totalPages}</strong> ({total} atos normativos no total)
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <FiChevronLeft /> Anterior
                            </button>
                            <button
                                type="button"
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Próxima <FiChevronRight />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
