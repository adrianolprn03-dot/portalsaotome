"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
    FaPlus, FaSearch, FaEdit, FaTrash, FaSpinner, FaPlane, 
    FaCalendarAlt, FaShieldAlt, FaFilePdf, FaCheckCircle, FaExternalLinkAlt, FaStamp
} from "react-icons/fa";
import { FaBuildingColumns } from "react-icons/fa6";
import toast from "react-hot-toast";
import { HISTORICO_DIARIAS, HistoricoTabelaDiaria } from "@/lib/diarias-historico";
import DeclaracaoInexistenciaBanner from "@/components/admin/DeclaracaoInexistenciaBanner";

type Diaria = {
    id: string;
    servidor: string;
    cargo: string;
    destino: string;
    valor: number;
    mes: number;
    ano: number;
    numeroPortaria?: string | null;
    portariaUrl?: string | null;
    codigoPermanente?: string | null;
    situacaoPublicacao?: string;
    femurn?: { codigo: string; edicao: string; publicadoEm: string } | null;
};

export default function AdminDiariasPage() {
    const [aba, setAba] = useState<"concessoes" | "tabela" | "declaracoes">("concessoes");
    const [items, setItems] = useState<Diaria[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [somenteRascunhosFemurn, setSomenteRascunhosFemurn] = useState(false);
    const [anoTabelaSelecionado, setAnoTabelaSelecionado] = useState<number>(2026);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/diarias?incluirRascunhos=true", { cache: "no-store" });
            const data = await res.json();
            setItems(data.items || []);
        } catch {
            toast.error("Erro ao carregar diárias");
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePublicacao = async (item: Diaria) => {
        const novoStatus = item.situacaoPublicacao === "rascunho" ? "publicado" : "rascunho";
        try {
            const res = await fetch(`/api/diarias/${item.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ situacaoPublicacao: novoStatus }),
            });
            if (res.ok) {
                toast.success(novoStatus === "publicado" ? "Diária aprovada e publicada!" : "Diária movida para rascunho.");
                fetchData();
            } else {
                toast.error("Erro ao atualizar status.");
            }
        } catch {
            toast.error("Erro ao atualizar status.");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Excluir esta diária?")) return;
        try {
            const res = await fetch(`/api/diarias/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Excluída com sucesso");
                fetchData();
            }
        } catch {
            toast.error("Erro ao excluir");
        }
    };

    const rascunhosFemurnCount = items.filter(
        (i) => i.situacaoPublicacao === "rascunho" && (i.femurn || i.codigoPermanente)
    ).length;

    const filtered = items.filter(i => {
        if (somenteRascunhosFemurn && !(i.situacaoPublicacao === "rascunho" && (i.femurn || i.codigoPermanente))) {
            return false;
        }
        const q = search.toLowerCase();
        return (
            i.servidor.toLowerCase().includes(q) ||
            i.destino.toLowerCase().includes(q) ||
            (i.numeroPortaria || "").toLowerCase().includes(q) ||
            (i.codigoPermanente || "").toLowerCase().includes(q)
        );
    });

    const tabelaAtual = HISTORICO_DIARIAS.find(h => h.ano === anoTabelaSelecionado) || HISTORICO_DIARIAS[0];

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
    };

    return (
        <div className="space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FaPlane className="text-[#01b0ef]" /> Gestão de Diárias e Indenizações de Viagem
                    </h1>
                    <p className="text-slate-600 text-sm">
                        Concessões individuais, tabelas de valores fixados (2021 a 2026) e declarações oficiais de não regulamentação.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link 
                        href="/admin/diarias/novo" 
                        className="btn-primary flex items-center gap-2 bg-[#01b0ef] hover:bg-[#0098d4] border-none text-xs font-bold"
                    >
                        <FaPlus /> Nova Diária Concedida
                    </Link>
                </div>
            </div>

            <DeclaracaoInexistenciaBanner
                modulo="diarias_internacionais"
                criterioPntp="7.2"
                tituloModulo="Diárias Internacionais / Não Regulamentação"
            />

            {/* Abas Superiores */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-2 shadow-sm flex flex-wrap gap-2">
                <button
                    onClick={() => setAba("concessoes")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        aba === "concessoes"
                            ? "bg-[#01b0ef] text-white shadow-sm"
                            : "text-slate-600 hover:bg-[#f4fbff]"
                    }`}
                >
                    <FaPlane size={13} />
                    <span>Concessões de Diárias ({items.length})</span>
                </button>

                <button
                    onClick={() => setAba("tabela")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        aba === "tabela"
                            ? "bg-[#01b0ef] text-white shadow-sm"
                            : "text-slate-600 hover:bg-[#f4fbff]"
                    }`}
                >
                    <FaBuildingColumns size={13} />
                    <span>Tabela de Valores por Exercício (2021–2026)</span>
                </button>

                <button
                    onClick={() => setAba("declaracoes")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        aba === "declaracoes"
                            ? "bg-[#01b0ef] text-white shadow-sm"
                            : "text-slate-600 hover:bg-[#f4fbff]"
                    }`}
                >
                    <FaStamp size={13} />
                    <span>Declarações Formais de Não Regulamentação ({HISTORICO_DIARIAS.length})</span>
                </button>
            </div>

            {/* CONTEÚDO DA ABA 1: CONCESSÕES */}
            {aba === "concessoes" && (
                <div className="space-y-4">
                    {rascunhosFemurnCount > 0 && (
                        <div
                            role="alert"
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-50 border border-red-300 text-red-900 px-5 py-4 rounded-2xl shadow-sm"
                        >
                            <div>
                                <p className="text-sm font-bold text-red-900">
                                    {rascunhosFemurnCount === 1
                                        ? "1 diária importada da FEMURN aguardando aprovação"
                                        : `${rascunhosFemurnCount} diárias importadas da FEMURN aguardando aprovação`}
                                </p>
                                <p className="text-xs text-red-700">
                                    Revise os dados extraídos da portaria antes de publicar no Portal da Transparência.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSomenteRascunhosFemurn((v) => !v)}
                                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shrink-0 shadow-sm cursor-pointer"
                            >
                                {somenteRascunhosFemurn ? "Mostrar Todas" : `Ver Rascunhos FEMURN (${rascunhosFemurnCount})`}
                            </button>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
                        <div className="p-4 border-b border-[#e2e8f0] bg-[#F8FAFC] flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                            <div className="relative max-w-md flex-1">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por servidor, destino, portaria ou código FEMURN..."
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-[#e2e8f0] rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-[#01b0ef]"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSomenteRascunhosFemurn(false)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                                        !somenteRascunhosFemurn ? "bg-[#01b0ef] text-white border-[#01b0ef]" : "bg-white text-slate-600 border-[#e2e8f0]"
                                    }`}
                                >
                                    Todas ({items.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSomenteRascunhosFemurn(true)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                                        somenteRascunhosFemurn
                                            ? "bg-red-600 text-white border-red-600"
                                            : rascunhosFemurnCount > 0
                                                ? "bg-red-50 text-red-700 border-red-300"
                                                : "bg-white text-slate-600 border-[#e2e8f0]"
                                    }`}
                                >
                                    Rascunhos FEMURN ({rascunhosFemurnCount})
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-[#F8FAFC] text-slate-600 text-[10px] font-black uppercase tracking-widest border-b border-[#e2e8f0]">
                                        <th className="px-6 py-4">Servidor / Cargo</th>
                                        <th className="px-6 py-4">Destino / Portaria</th>
                                        <th className="px-6 py-4">Ref. / Status</th>
                                        <th className="px-6 py-4 text-right">Valor</th>
                                        <th className="px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e2e8f0]">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-600">
                                                <FaSpinner className="animate-spin inline-block text-[#01b0ef] text-2xl" />
                                            </td>
                                        </tr>
                                    ) : filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-slate-600">
                                                Nenhuma concessão de diária localizada.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((item) => {
                                            const ehRascunho = item.situacaoPublicacao === "rascunho";
                                            return (
                                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-slate-900">
                                                        {item.servidor}
                                                        <div className="text-[10px] font-normal text-slate-600">{item.cargo}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-900 font-medium">
                                                        <div>{item.destino}</div>
                                                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                                                            {item.numeroPortaria && <span>Portaria {item.numeroPortaria}</span>}
                                                            {(item.femurn?.codigo || item.codigoPermanente) && (
                                                                <span>FEMURN: {item.femurn?.codigo || item.codigoPermanente}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        <div>{item.mes}/{item.ano}</div>
                                                        <span
                                                            className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                                ehRascunho
                                                                    ? "bg-red-100 text-red-700"
                                                                    : "bg-emerald-100 text-emerald-700"
                                                            }`}
                                                        >
                                                            {ehRascunho ? "Rascunho" : "Publicado"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-black text-[#01b0ef]">
                                                        {formatCurrency(item.valor)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="inline-flex items-center gap-1.5">
                                                            {item.portariaUrl && (
                                                                <a
                                                                    href={item.portariaUrl}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                                    title="Abrir PDF da portaria"
                                                                >
                                                                    <FaFilePdf size={12} />
                                                                </a>
                                                            )}
                                                            <Link
                                                                href={`/admin/diarias/editar/${item.id}`}
                                                                className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                                                title="Revisar e editar diária"
                                                            >
                                                                <FaEdit size={12} />
                                                            </Link>
                                                            {ehRascunho && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleTogglePublicacao(item)}
                                                                    className="px-2 py-1 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
                                                                    title="Aprovar e publicar no portal"
                                                                >
                                                                    Publicar
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete(item.id)}
                                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                                title="Excluir diária"
                                                            >
                                                                <FaTrash size={12} />
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
            )}

            {/* CONTEÚDO DA ABA 2: TABELAS DE VALORES HISTÓRICOS */}
            {aba === "tabela" && (
                <div className="space-y-6">
                    {/* Seletor de Anos */}
                    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="text-xs font-black uppercase tracking-wider text-[#01b0ef]">
                                Exercício Selecionado
                            </div>
                            <div className="text-base font-bold text-slate-900">
                                Tabela e Legislação do Ano {tabelaAtual.ano}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {HISTORICO_DIARIAS.map((h) => (
                                <button
                                    key={h.ano}
                                    onClick={() => setAnoTabelaSelecionado(h.ano)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        h.ano === anoTabelaSelecionado
                                            ? "bg-[#01b0ef] text-white shadow-sm"
                                            : "bg-[#f4fbff] text-slate-900 hover:bg-slate-200 border border-[#e2e8f0]"
                                    }`}
                                >
                                    {h.ano} {h.vigente && "(Vigente)"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Resumo da Norma */}
                    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <span className="text-[10px] font-black uppercase text-[#01b0ef] block mb-1">
                                Base Legal Aplicável
                            </span>
                            <h3 className="text-base font-black text-slate-900">{tabelaAtual.normaLegal}</h3>
                            <p className="text-xs text-slate-600 mt-0.5">{tabelaAtual.ementaNorma}</p>
                        </div>
                        <Link
                            href={tabelaAtual.linkNorma}
                            target="_blank"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#01b0ef] hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors"
                        >
                            <span>Ver Ato Normativo</span>
                            <FaExternalLinkAlt size={10} />
                        </Link>
                    </div>

                    {/* Tabela de Valores */}
                    <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-[#01b0ef] text-white font-extrabold uppercase text-[10px] tracking-wider">
                                        <th className="py-3 px-6">Cargo / Função</th>
                                        <th className="py-3 px-4 text-center">Natal / Caicó / Mossoró</th>
                                        <th className="py-3 px-4 text-center">Demais Cidades (RN)</th>
                                        <th className="py-3 px-4 text-center">Outros Estados</th>
                                        <th className="py-3 px-4 text-center">Brasília / DF</th>
                                        <th className="py-3 px-4 text-center bg-[#01b0ef]">Internacional</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e2e8f0]">
                                    {tabelaAtual.valores.map((v, i) => (
                                        <tr key={v.cargo} className={i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}>
                                            <td className="py-3 px-6 font-bold text-slate-900">{v.cargo}</td>
                                            <td className="py-3 px-4 text-center font-bold text-[#01b0ef]">{formatCurrency(v.estadual)}</td>
                                            <td className="py-3 px-4 text-center font-medium text-slate-900">{formatCurrency(v.interior)}</td>
                                            <td className="py-3 px-4 text-center font-medium text-slate-900">{formatCurrency(v.outrosEstados)}</td>
                                            <td className="py-3 px-4 text-center font-black text-emerald-700 bg-emerald-50/30">{formatCurrency(v.brasilia)}</td>
                                            <td className="py-3 px-4 text-center text-[10px] text-amber-800 font-bold bg-amber-50/40">{v.internacional}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTEÚDO DA ABA 3: DECLARAÇÕES FORMAIS */}
            {aba === "declaracoes" && (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                                <FaStamp size={16} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900">
                                Registro de Declarações Oficiais de Não Ocorrência & Inexistência de Norma
                            </h2>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Conforme preceitua a Cartilha PNTP 2026 (Critério 7.2), o município deve declarar formalmente a inexistência de regulamentação para viagens ao exterior e a não ocorrência de pagamentos de diárias internacionais em cada exercício fiscal.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {HISTORICO_DIARIAS.map((h) => {
                            const d = h.declaracaoNaoRegulamentacao;
                            return (
                                <div key={h.ano} className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-1 rounded-md bg-[#01b0ef] text-white font-black text-xs">
                                                Ano {h.ano}
                                            </span>
                                            <span className="text-[11px] font-bold text-slate-600">
                                                {d.protocolo}
                                            </span>
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                            <FaCheckCircle size={10} /> {d.status}
                                        </span>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 mb-1">{d.titulo}</h4>
                                        <p className="text-xs text-slate-600 leading-relaxed">{d.texto}</p>
                                    </div>

                                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-[11px] text-amber-950 font-bold">
                                        {d.declaracaoNaoOcorrencia}
                                    </div>

                                    <div className="pt-2 text-[10px] text-slate-600 flex flex-col gap-0.5 border-t border-slate-100">
                                        <span><strong>Emissor:</strong> {d.orgaoEmissor}</span>
                                        <span><strong>Responsável:</strong> {d.responsavel} ({d.cargoResponsavel})</span>
                                        <span><strong>Data:</strong> {d.dataEmissao} · Fundamento: {d.fundamentoLegal}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
