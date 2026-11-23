"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import toast from "react-hot-toast";
import { TIPOS_LEGISLACAO } from "@/lib/rbac-routes";

export default function EditarLegislacaoPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [uploading, setUploading] = useState(false);

    const [tipo, setTipo] = useState("lei");
    const [numero, setNumero] = useState("");
    const [ano, setAno] = useState("");
    const [ementa, setEmenta] = useState("");
    const [categoria, setCategoria] = useState("");
    const [dataAto, setDataAto] = useState("");
    const [situacaoVigencia, setSituacaoVigencia] = useState("vigente");
    const [orgaoResponsavel, setOrgaoResponsavel] = useState("Gabinete do Prefeito");
    const [arquivo, setArquivo] = useState("");
    const [ativo, setAtivo] = useState(true);

    useEffect(() => {
        const fetchLegislacao = async () => {
            try {
                const res = await fetch(`/api/admin/legislacao/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setTipo(data.tipo || "lei");
                    setNumero(data.numero || "");
                    setAno(data.ano ? data.ano.toString() : "");
                    setEmenta(data.ementa || "");
                    setCategoria(data.categoria || "");
                    setDataAto(data.dataAto ? new Date(data.dataAto).toISOString().slice(0, 10) : "");
                    setSituacaoVigencia(data.situacaoVigencia || "vigente");
                    setOrgaoResponsavel(data.orgaoResponsavel || "Gabinete do Prefeito");
                    setArquivo(data.arquivo || "");
                    setAtivo(Boolean(data.ativo));
                } else {
                    toast.error("Legislação não encontrada.");
                    router.push("/admin/legislacao");
                }
            } catch (error) {
                console.error("Erro ao buscar:", error);
            } finally {
                setFetching(false);
            }
        };

        if (params.id) {
            fetchLegislacao();
        }
    }, [params.id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!numero || !ano || !ementa) {
            toast.error("Por favor, preencha número, ano e ementa.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/legislacao/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tipo,
                    numero,
                    ano,
                    ementa,
                    arquivo,
                    categoria: categoria || null,
                    dataAto: dataAto || null,
                    situacaoVigencia,
                    orgaoResponsavel,
                    ativo,
                }),
            });

            if (res.ok) {
                toast.success("Norma atualizada com sucesso!");
                router.push("/admin/legislacao");
                router.refresh();
            } else {
                const data = await res.json();
                toast.error(data.error || "Erro ao atualizar legislação.");
            }
        } catch (error) {
            console.error("Erro ao atualizar:", error);
            toast.error("Erro ao atualizar legislação. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/legislacao" className="text-gray-500 hover:text-blue-600 transition-colors">
                    <FiArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Editar Legislação / Ato Normativo</h1>
                    <p className="text-sm text-gray-500">
                        Atualize os metadados, vigência, ementa ou documento PDF vinculado.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo da Norma <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            required
                        >
                            {TIPOS_LEGISLACAO.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Número <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={numero}
                            onChange={(e) => setNumero(e.target.value)}
                            placeholder="Ex: 123/2026 ou 123"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ano <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={ano}
                            onChange={(e) => setAno(e.target.value)}
                            min="1900"
                            max="2100"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data do Ato / Publicação
                        </label>
                        <input
                            type="date"
                            value={dataAto}
                            onChange={(e) => setDataAto(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Situação de Vigência
                        </label>
                        <select
                            value={situacaoVigencia}
                            onChange={(e) => setSituacaoVigencia(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        >
                            <option value="vigente">Vigente</option>
                            <option value="alterada">Alterada</option>
                            <option value="revogada">Revogada</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Categoria / Assunto
                        </label>
                        <input
                            type="text"
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            placeholder="Ex: Orçamento, Pessoal, Saúde..."
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Órgão Responsável
                        </label>
                        <input
                            type="text"
                            value={orgaoResponsavel}
                            onChange={(e) => setOrgaoResponsavel(e.target.value)}
                            placeholder="Ex: Gabinete do Prefeito"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ementa (Resumo Oficial da Norma) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={ementa}
                        onChange={(e) => setEmenta(e.target.value)}
                        placeholder="Descreva o assunto ou resumo da norma..."
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
                        required
                    />
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Arquivo da Norma (PDF ou Imagem)
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Opção 1: Upload Direto (Vercel Blob)
                            </span>
                            <label className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-all bg-gray-50/50">
                                <div className="text-center">
                                    <p className="text-sm font-bold text-gray-700">
                                        {uploading
                                            ? "Enviando arquivo..."
                                            : arquivo && arquivo.includes("vercel-storage.com")
                                            ? "Arquivo carregado na nuvem"
                                            : "Clique para anexar PDF ou imagem"}
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    accept=".pdf, image/*"
                                    className="hidden"
                                    disabled={uploading}
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setUploading(true);
                                            const formData = new FormData();
                                            formData.append("file", file);
                                            try {
                                                const res = await fetch("/api/upload", {
                                                    method: "POST",
                                                    body: formData,
                                                });
                                                if (res.ok) {
                                                    const data = await res.json();
                                                    setArquivo(data.url);
                                                    toast.success("Arquivo enviado com sucesso!");
                                                } else {
                                                    const data = await res.json();
                                                    toast.error(data.error || "Erro no upload.");
                                                }
                                            } catch (err: any) {
                                                toast.error(`Erro no upload: ${err.message}`);
                                            } finally {
                                                setUploading(false);
                                            }
                                        }
                                    }}
                                />
                            </label>
                        </div>

                        <div className="space-y-2">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Opção 2: URL Externa (Google Drive / Diário Oficial)
                            </span>
                            <div className="h-full flex items-center">
                                <input
                                    type="url"
                                    value={arquivo}
                                    onChange={(e) => setArquivo(e.target.value)}
                                    placeholder="https://exemplo.com/arquivo.pdf"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {arquivo && (
                        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-xl break-all flex justify-between items-center">
                            <span>
                                <strong>Arquivo vinculado:</strong> {arquivo}
                            </span>
                            <button
                                type="button"
                                onClick={() => setArquivo("")}
                                className="text-red-500 hover:text-red-700 font-bold ml-2"
                            >
                                Remover
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="ativo"
                        checked={ativo}
                        onChange={(e) => setAtivo(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900 font-medium">
                        Norma ativa (visível no Portal da Transparência)
                    </label>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <Link
                        href="/admin/legislacao"
                        className="px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors mr-4"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-[#0098d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <FiSave />
                        )}
                        Salvar Alterações
                    </button>
                </div>
            </form>
        </div>
    );
}
