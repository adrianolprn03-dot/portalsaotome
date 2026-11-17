"use client";

import { useState, useEffect, useMemo } from "react";
import { 
    FaHammer, FaMapMarker, FaCalendar, FaBuilding, 
    FaSpinner, FaArrowRight, FaImage,
    FaCheckCircle, FaExclamationTriangle, FaHardHat, FaInfoCircle,
    FaTable, FaDownload, FaExternalLinkAlt, FaSearch,
    FaClock, FaCoins, FaBriefcase, FaChartPie, FaListOl, FaMoneyCheckAlt
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Cell,
    PieChart,
    Pie,
    Legend
} from "recharts";
import PageHeader from "@/components/PageHeader";
import TransparencyFilters from "@/components/transparencia/TransparencyFilters";
import { exportToCSV, exportToJSON, exportToPDF, exportToXLSX } from "@/lib/exportUtils";
import BannerPNTP from "@/components/transparencia/BannerPNTP";
import Image from "next/image";

const CHART_COLORS = ["#01b0ef", "#fdb913", "#10B981", "#01b0ef", "#8B5CF6", "#fdb913"];

type ItemPlanilha = {
    item: string;
    unidade: string;
    quantidade: string | number;
    precoUnitario: string | number;
    precoTotal: string | number;
};

type MedicaoItem = {
    numero: string;
    data: string;
    percentual: string | number;
    valorMedido: string | number;
    valorPago: string | number;
    ordemBancaria?: string;
};

type Obra = {
    id: string;
    titulo: string;
    descricao: string;
    local: string;
    valor: number;
    valorPago?: number | null;
    status: string;
    dataInicio: string | null;
    previsaoTermino: string | null;
    empresa: string | null;
    cnpjEmpresa?: string | null;
    numeroContrato?: string | null;
    percentual: number;
    imagem: string | null;
    quantitativosContratados?: string | null;
    medicoes?: string | null;
    motivoParalisacao?: string | null;
    responsavelParalisacao?: string | null;
    previsaoReinicio?: string | null;
    documentos: string;
    criadoEm: string;
};

const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
        case "concluida": return { label: "Concluída", color: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500", icon: <FaCheckCircle /> };
        case "em-andamento": return { label: "Em Andamento", color: "text-[#01b0ef] bg-blue-50 border-blue-200", dot: "bg-[#01b0ef]", icon: <FaHardHat /> };
        case "paralisada": return { label: "Paralisada", color: "text-rose-700 bg-rose-50 border-rose-200", dot: "bg-rose-500", icon: <FaExclamationTriangle /> };
        case "licitacao": return { label: "Licitação", color: "text-amber-700 bg-amber-50 border-amber-200", dot: "bg-amber-500", icon: <FaSpinner className="animate-spin" /> };
        default: return { label: status, color: "text-slate-600 bg-slate-50 border-slate-200", dot: "bg-slate-400", icon: <FaInfoCircle /> };
    }
};

const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const safeParseJson = <T,>(val: any, fallback: T): T => {
    if (!val) return fallback;
    if (typeof val === "object") return val as T;
    try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? (parsed as unknown as T) : fallback;
    } catch {
        return fallback;
    }
};

export default function ObrasPublicasPage() {
    const [obras, setObras] = useState<Obra[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState("");
    const [status, setStatus] = useState("");
    const [selectedObra, setSelectedObra] = useState<Obra | null>(null);
    const [abaVisual, setAbaVisual] = useState<"lista" | "graficos">("lista");

    useEffect(() => {
        const fetchObras = async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams({ 
                    query: busca,
                    status 
                });
                const res = await fetch(`/api/obras?${query.toString()}`);
                const data = await res.json();
                setObras(data.items || []);
            } catch (error) {
                console.error("Erro ao buscar obras:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchObras();
    }, [busca, status]);

    const handleClearFilters = () => {
        setBusca("");
        setStatus("");
    };

    const handleExport = (format: "pdf" | "csv" | "json" | "xlsx") => {
        const payload = obras.map(o => ({
            "Título": o.titulo,
            "Local": o.local,
            "Contrato": o.numeroContrato || "N/I",
            "Valor Contratado": fmt(o.valor),
            "Valor Pago": fmt(o.valorPago || 0),
            "Empresa": o.empresa || "Não informada",
            "CNPJ": o.cnpjEmpresa || "-",
            "Progresso Físico": `${o.percentual}%`,
            "Status": o.status?.toUpperCase(),
            "Data Início": o.dataInicio ? new Date(o.dataInicio).toLocaleDateString("pt-BR") : "N/I",
            "Término / Conclusão": o.previsaoTermino ? new Date(o.previsaoTermino).toLocaleDateString("pt-BR") : "N/I",
            "Motivo Paralisação": o.status === "paralisada" ? (o.motivoParalisacao || "Registrado") : "-"
        }));

        const filename = `obras_publicas_lajes_pintadas`;
        const title = `Relatório de Acompanhamento de Obras Públicas – São Tomé/RN`;

        if (format === "csv") exportToCSV(payload, filename);
        else if (format === "json") exportToJSON(payload, filename);
        else if (format === "xlsx") exportToXLSX(payload, filename);
        else exportToPDF(payload, filename, title);
    };

    const totalInvestimento = useMemo(() => obras.reduce((acc, curr) => acc + (curr.valor || 0), 0), [obras]);
    const totalPago = useMemo(() => obras.reduce((acc, curr) => acc + (curr.valorPago || 0), 0), [obras]);
    const obrasConcluidas = useMemo(() => obras.filter(o => o.status?.toLowerCase() === "concluida").length, [obras]);
    const obrasEmAndamento = useMemo(() => obras.filter(o => o.status?.toLowerCase() === "em-andamento").length, [obras]);
    const obrasParalisadas = useMemo(() => obras.filter(o => o.status?.toLowerCase() === "paralisada").length, [obras]);

    // Dados agregados por Status para gráficos
    const dadosPorStatus = useMemo(() => {
        const map: Record<string, { status: string; label: string; quantidade: number; valor: number }> = {};
        obras.forEach((o) => {
            const st = o.status?.toLowerCase() || "outros";
            const label = getStatusInfo(st).label;
            if (!map[st]) {
                map[st] = { status: st, label, quantidade: 0, valor: 0 };
            }
            map[st].quantidade += 1;
            map[st].valor += o.valor || 0;
        });
        return Object.values(map);
    }, [obras]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    // Obra selecionada: parse das listas estruturadas dos critérios 10.2 e 10.3
    const itensContratadosModal = useMemo<ItemPlanilha[]>(() => {
        if (!selectedObra) return [];
        return safeParseJson<ItemPlanilha[]>(selectedObra.quantitativosContratados, []);
    }, [selectedObra]);

    const medicoesModal = useMemo<MedicaoItem[]>(() => {
        if (!selectedObra) return [];
        return safeParseJson<MedicaoItem[]>(selectedObra.medicoes, []);
    }, [selectedObra]);

    return (
        <div className="min-h-screen bg-[#f4fbff]">
            <PageHeader
                title="Acompanhamento de Obras Públicas"
                subtitle="Painel público de transparência sobre obras públicas, investimentos de infraestrutura, medições fiscais e quantitativos contratados."
                icon={<FaHammer />}
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Transparência", href: "/transparencia" },
                    { label: "Obras" }
                ]}
            />

            <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-7xl mx-auto px-4 sm:px-6 py-8"
            >
                {/* Visual Switcher & Exports */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-[#e2e8f0] shadow-sm">
                        <button
                            onClick={() => setAbaVisual("lista")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                abaVisual === "lista"
                                    ? "bg-[#01b0ef] text-white shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <FaTable size={13} /> Lista de Obras
                        </button>
                        <button
                            onClick={() => setAbaVisual("graficos")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                abaVisual === "graficos"
                                    ? "bg-[#01b0ef] text-white shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <FaChartPie size={13} /> Gráficos nos Resultados
                        </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-600 mr-1 hidden md:inline">Exportar Relatório:</span>
                        <button
                            onClick={() => handleExport("pdf")}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] text-slate-900 rounded-lg text-xs font-bold hover:border-[#01b0ef] hover:text-[#01b0ef] transition-all shadow-sm"
                        >
                            <FaDownload size={10} /> PDF
                        </button>
                        <button
                            onClick={() => handleExport("xlsx")}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] text-slate-900 rounded-lg text-xs font-bold hover:border-[#01b0ef] hover:text-[#01b0ef] transition-all shadow-sm"
                        >
                            <FaDownload size={10} /> Excel
                        </button>
                        <button
                            onClick={() => handleExport("csv")}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] text-slate-900 rounded-lg text-xs font-bold hover:border-[#01b0ef] hover:text-[#01b0ef] transition-all shadow-sm"
                        >
                            <FaDownload size={10} /> CSV
                        </button>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Investimento Total</span>
                            <span className="p-2 bg-blue-50 text-[#01b0ef] rounded-xl">
                                <FaCoins size={16} />
                            </span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{loading ? "..." : fmt(totalInvestimento)}</h3>
                        <p className="text-xs text-slate-600 mt-2 pt-2 border-t border-[#e2e8f0]">Contratos e convênios</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Pago Acumulado</span>
                            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                <FaMoneyCheckAlt size={16} />
                            </span>
                        </div>
                        <h3 className="text-2xl font-black text-emerald-600 tracking-tight">{loading ? "..." : fmt(totalPago)}</h3>
                        <p className="text-xs text-slate-600 mt-2 pt-2 border-t border-[#e2e8f0]">Medições liquidadas e pagas</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Obras Concluídas</span>
                            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                <FaCheckCircle size={16} />
                            </span>
                        </div>
                        <h3 className="text-2xl font-black text-emerald-600 tracking-tight">{loading ? "..." : obrasConcluidas}</h3>
                        <p className="text-xs text-slate-600 mt-2 pt-2 border-t border-[#e2e8f0]">Entregues com data efetiva</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] border-t-4 border-t-[#fdb913] shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Obras em Andamento / Paralisadas</span>
                            <span className="p-2 bg-[#fdb913] text-slate-900 rounded-xl shadow-xs">
                                <FaHardHat size={16} />
                            </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{loading ? "..." : obrasEmAndamento}</h3>
                            {obrasParalisadas > 0 && (
                                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                    {obrasParalisadas} paralisada(s)
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-600 mt-2 pt-2 border-t border-[#e2e8f0]">Critério PNTP (Obras e Medições)</p>
                    </div>
                </motion.div>

                {/* Filtros de Busca */}
                <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Buscar por Obra, Descrição, Bairro ou Empresa
                            </label>
                            <div className="relative">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    placeholder="Ex: Pavimentação, Creche, Reforma, Iluminação..."
                                    className="w-full bg-[#f4fbff] border border-[#e2e8f0] rounded-xl pl-11 pr-4 py-3 text-sm focus:border-[#01b0ef] focus:bg-white outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Filtrar por Situação
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full bg-[#f4fbff] border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm font-semibold focus:border-[#01b0ef] focus:bg-white outline-none transition-all text-slate-900"
                            >
                                <option value="">Todas as Situações</option>
                                <option value="em-andamento">Em Andamento</option>
                                <option value="concluida">Concluída</option>
                                <option value="paralisada">Paralisada</option>
                                <option value="planejada">Planejada</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Conteúdo: Gráficos ou Lista */}
                {abaVisual === "graficos" ? (
                    <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <FaChartPie className="text-[#01b0ef]" /> Distribuição por Situação da Obra
                            </h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={dadosPorStatus}
                                            dataKey="quantidade"
                                            nameKey="label"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={90}
                                            label={(entry) => `${entry.label}: ${entry.quantidade}`}
                                        >
                                            {dadosPorStatus.map((_, idx) => (
                                                <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <FaCoins className="text-emerald-600" /> Valores Orçados por Situação (R$)
                            </h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dadosPorStatus}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                        <YAxis tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
                                        <Tooltip formatter={(v: any) => fmt(Number(v))} />
                                        <Bar dataKey="valor" fill="#01b0ef" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div variants={itemVariants}>
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div 
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white rounded-2xl p-16 text-center border border-[#e2e8f0] shadow-sm"
                                >
                                    <FaSpinner className="animate-spin text-3xl text-[#01b0ef] mx-auto mb-3" />
                                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Carregando obras públicas...</p>
                                </motion.div>
                            ) : obras.length === 0 ? (
                                <motion.div 
                                    key="empty"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white rounded-2xl p-16 text-center border border-[#e2e8f0] shadow-sm"
                                >
                                    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                        <FaSearch size={28} />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 mb-1">Sem resultados para a busca</h4>
                                    <p className="text-xs text-slate-600 mb-4">Não encontramos nenhuma obra com os filtros selecionados.</p>
                                    <button onClick={handleClearFilters} className="px-5 py-2.5 bg-[#01b0ef] text-white rounded-xl text-xs font-bold hover:bg-[#0098d4] transition-all shadow-sm">Ver Todas as Obras</button>
                                </motion.div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {obras.map((o) => {
                                        const statusInfo = getStatusInfo(o.status);
                                        const isConcluida = o.status?.toLowerCase() === "concluida";
                                        const isParalisada = o.status?.toLowerCase() === "paralisada";

                                        return (
                                            <div 
                                                key={o.id}
                                                className={`bg-white rounded-2xl border transition-all p-5 flex flex-col lg:flex-row items-center gap-6 ${
                                                    isParalisada ? "border-rose-300 bg-rose-50/20" : "border-[#e2e8f0] hover:border-[#01b0ef]/40"
                                                } shadow-sm`}
                                            >
                                                {/* Preview / Thumbnail */}
                                                <div className="w-full lg:w-36 h-28 bg-[#f4fbff] rounded-xl shrink-0 overflow-hidden relative border border-[#e2e8f0]">
                                                    {o.imagem ? (
                                                        <Image 
                                                            src={o.imagem} 
                                                            alt={o.titulo} 
                                                            fill 
                                                            className="object-cover" 
                                                        />
                                                    ) : (
                                                        <div className="h-full flex items-center justify-center text-slate-300">
                                                            <FaImage size={28} />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Main Info */}
                                                <div className="flex-1 min-w-0 w-full lg:w-auto">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusInfo.color}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                                                            {statusInfo.label}
                                                        </span>
                                                        <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                                                            <FaMapMarker className="text-[#01b0ef]" size={11} /> {o.local}
                                                        </span>
                                                        {o.numeroContrato && (
                                                            <span className="text-[10px] font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                                                                {o.numeroContrato}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">
                                                        {o.titulo}
                                                    </h3>
                                                    <p className="text-xs text-slate-600 flex items-center gap-2 truncate">
                                                        <FaBriefcase className="text-slate-400" size={11} /> {o.empresa || "Licitação / Contratação em Aberto"}
                                                    </p>

                                                    {/* Detalhe inline para obras paralisadas (10.4) */}
                                                    {isParalisada && o.motivoParalisacao && (
                                                        <div className="mt-2 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-2 font-medium">
                                                            <span className="font-bold">Motivo da Paralisação:</span> {o.motivoParalisacao}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Investment & Timeline */}
                                                <div className="flex flex-row items-center gap-6 w-full lg:w-auto shrink-0 justify-between lg:justify-start">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Investimento</p>
                                                        <p className="text-base font-black text-slate-900">{fmt(o.valor)}</p>
                                                        {o.valorPago !== null && o.valorPago !== undefined && o.valorPago > 0 && (
                                                            <p className="text-[10px] font-bold text-emerald-700">Pago: {fmt(o.valorPago)}</p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-3 bg-[#f4fbff] px-3 py-2 rounded-xl border border-[#e2e8f0]">
                                                        <div>
                                                            <span className="text-[9px] font-semibold text-slate-600 block">Início</span>
                                                            <span className="text-xs font-bold text-slate-900">
                                                                {o.dataInicio ? new Date(o.dataInicio).toLocaleDateString("pt-BR") : "N/I"}
                                                            </span>
                                                        </div>
                                                        <div className="w-[1px] h-6 bg-[#e2e8f0]" />
                                                        <div>
                                                            <span className="text-[9px] font-semibold text-slate-600 block">
                                                                {isConcluida ? "Conclusão" : isParalisada ? "Prev. Reinício" : "Previsão"}
                                                            </span>
                                                            <span className="text-xs font-bold text-[#01b0ef]">
                                                                {isParalisada && o.previsaoReinicio 
                                                                    ? new Date(o.previsaoReinicio).toLocaleDateString("pt-BR")
                                                                    : o.previsaoTermino 
                                                                    ? new Date(o.previsaoTermino).toLocaleDateString("pt-BR") 
                                                                    : "N/I"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Progress & Action */}
                                                <div className="w-full lg:w-56 flex flex-col gap-2 shrink-0">
                                                    <div className="flex justify-between items-center text-xs font-bold">
                                                        <span className="text-slate-600">Execução Física</span>
                                                        <span className="text-[#01b0ef]">{o.percentual}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-[#e2e8f0] rounded-full overflow-hidden">
                                                        <div 
                                                            style={{ width: `${o.percentual}%` }}
                                                            className={`h-full rounded-full transition-all duration-500 ${
                                                                isParalisada ? "bg-rose-500" : isConcluida ? "bg-emerald-600" : "bg-[#01b0ef]"
                                                            }`}
                                                        />
                                                    </div>
                                                    <button 
                                                        onClick={() => setSelectedObra(o)}
                                                        className="mt-2 h-9 bg-[#01b0ef] text-white rounded-xl text-xs font-bold hover:bg-[#0098d4] transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 cursor-pointer"
                                                    >
                                                        Visualizar Detalhes
                                                        <FaArrowRight size={10} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* PNTP Compliance Footer */}
                <motion.div variants={itemVariants} className="mt-12 space-y-8">
                    <BannerPNTP />
                    <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#01b0ef] flex items-center justify-center shrink-0">
                                <FaInfoCircle size={22} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">Critérios PNTP de Obras</h4>
                                <p className="text-xs text-slate-600 leading-relaxed max-w-md">
                                    Disponibilização da data efetiva de conclusão, quantitativos e preços contratados, medições físicas, valores efetivamente pagos e justificativas de paralisação.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => handleExport('pdf')} className="px-4 py-2 bg-[#f4fbff] border border-[#e2e8f0] text-slate-900 rounded-xl text-xs font-bold hover:border-[#01b0ef] transition-all flex items-center gap-2">
                                <FaDownload size={11} /> Exportar PDF
                            </button>
                            <button onClick={() => handleExport('xlsx')} className="px-4 py-2 bg-[#f4fbff] border border-[#e2e8f0] text-slate-900 rounded-xl text-xs font-bold hover:border-[#01b0ef] transition-all flex items-center gap-2">
                                <FaDownload size={11} /> Planilha Excel
                            </button>
                        </div>
                    </div>

                    <div className="text-center pt-4">
                        <p className="text-xs text-slate-600">
                            PORTAL DA TRANSPARÊNCIA • PREFEITURA DE LAJES PINTADAS/RN <br/>
                            <span className="italic">Processamento de dados em conformidade com a Lei de Acesso à Informação (Lei 12.527/11) e Matriz PNTP 2026.</span>
                        </p>
                    </div>
                </motion.div>
            </motion.div>

            {/* Modal de Detalhes Completo */}
            <AnimatePresence>
                {selectedObra && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedObra(null)}
                            className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-sm"
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] border border-[#e2e8f0]"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-[#e2e8f0] flex items-start justify-between bg-[#f4fbff]">
                                <div className="flex-1 pr-4">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusInfo(selectedObra.status).color}`}>
                                            <span className={`w-2 h-2 rounded-full ${getStatusInfo(selectedObra.status).dot}`} />
                                            {getStatusInfo(selectedObra.status).label}
                                        </span>
                                        <span className="text-xs text-slate-600 bg-white px-3 py-1 rounded-lg border border-[#e2e8f0] flex items-center gap-1.5">
                                            <FaClock className="text-[#01b0ef]" size={11} /> Registro em {new Date(selectedObra.criadoEm).toLocaleDateString("pt-BR")}
                                        </span>
                                        {selectedObra.numeroContrato && (
                                            <span className="text-xs font-mono font-bold text-slate-700 bg-white px-3 py-1 rounded-lg border border-[#e2e8f0]">
                                                {selectedObra.numeroContrato}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900">
                                        {selectedObra.titulo}
                                    </h2>
                                </div>
                                <button 
                                    onClick={() => setSelectedObra(null)}
                                    className="w-9 h-9 bg-white border border-[#e2e8f0] rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Destaque de Paralisação (Critério 10.4) */}
                                {selectedObra.status?.toLowerCase() === "paralisada" && (
                                    <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center text-base">
                                                <FaExclamationTriangle />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 bg-rose-200/80 px-2 py-0.5 rounded-full">
                                                    Critério PNTP
                                                </span>
                                                <h4 className="text-sm font-black text-rose-900 uppercase">
                                                    Detalhamento Oficial da Inexecução Temporária
                                                </h4>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                                            <div className="md:col-span-3 bg-white p-3 rounded-xl border border-rose-200">
                                                <span className="text-[10px] font-bold text-rose-800 uppercase block mb-1">Motivo da Paralisação:</span>
                                                <p className="font-semibold text-rose-950">{selectedObra.motivoParalisacao || "Em adequação técnica orçamentária pela gestão municipal."}</p>
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border border-rose-200">
                                                <span className="text-[10px] font-bold text-rose-800 uppercase block mb-1">Responsável pela Inexecução:</span>
                                                <p className="font-bold text-rose-950">{selectedObra.responsavelParalisacao || "Empresa Contratada / Em Processo"}</p>
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border border-rose-200">
                                                <span className="text-[10px] font-bold text-rose-800 uppercase block mb-1">Previsão Oficial de Reinício:</span>
                                                <p className="font-bold text-rose-950">
                                                    {selectedObra.previsaoReinicio ? new Date(selectedObra.previsaoReinicio).toLocaleDateString("pt-BR") : "Aguardando homologação"}
                                                </p>
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border border-rose-200">
                                                <span className="text-[10px] font-bold text-rose-800 uppercase block mb-1">Status Técnico:</span>
                                                <p className="font-bold text-rose-950">Notificação expedida / Vistoria</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="aspect-video relative rounded-xl overflow-hidden border border-[#e2e8f0] bg-slate-100">
                                        {selectedObra.imagem ? (
                                            <Image src={selectedObra.imagem} alt={selectedObra.titulo} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <FaImage size={48} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-[#f4fbff] rounded-xl p-5 border border-[#e2e8f0] flex flex-col justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Execução Física</p>
                                            <p className="text-3xl font-black text-[#01b0ef] mb-3">{selectedObra.percentual}% executado</p>
                                            <div className="h-3 w-full bg-[#e2e8f0] rounded-full overflow-hidden">
                                                <div 
                                                    style={{ width: `${selectedObra.percentual}%` }}
                                                    className="h-full bg-[#01b0ef] rounded-full"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-[#e2e8f0] grid grid-cols-2 gap-3 text-xs">
                                            <div>
                                                <span className="text-slate-600 block">Data de Início:</span>
                                                <span className="font-bold text-slate-900">
                                                    {selectedObra.dataInicio ? new Date(selectedObra.dataInicio).toLocaleDateString("pt-BR") : "N/I"}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-600 block">
                                                    {selectedObra.status?.toLowerCase() === "concluida" 
                                                        ? "Data Efetiva de Conclusão:" 
                                                        : "Previsão de Término:"}
                                                </span>
                                                <span className="font-bold text-[#01b0ef]">
                                                    {selectedObra.previsaoTermino ? new Date(selectedObra.previsaoTermino).toLocaleDateString("pt-BR") : "N/I"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Descrição e Finalidade Social</h3>
                                    <p className="text-sm text-slate-900 bg-[#f4fbff] p-4 rounded-xl border border-[#e2e8f0] leading-relaxed">
                                        {selectedObra.descricao}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                    <div className="bg-white p-4 rounded-xl border border-[#e2e8f0]">
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Valor Contratado</span>
                                        <p className="text-base font-black text-slate-900">{fmt(selectedObra.valor)}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-[#e2e8f0]">
                                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">Valor Efetivamente Pago</span>
                                        <p className="text-base font-black text-emerald-700">{fmt(selectedObra.valorPago || 0)}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-[#e2e8f0]">
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Empresa Contratada</span>
                                        <p className="text-xs font-bold text-slate-900 truncate">{selectedObra.empresa || "Licitação em Aberto"}</p>
                                        {selectedObra.cnpjEmpresa && (
                                            <p className="text-[10px] font-mono text-slate-600">{selectedObra.cnpjEmpresa}</p>
                                        )}
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-[#e2e8f0]">
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Localização</span>
                                        <p className="text-xs font-bold text-slate-900">{selectedObra.local}</p>
                                    </div>
                                </div>

                                {/* CRITÉRIO 10.2: QUANTITATIVOS E PREÇOS CONTRATADOS */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                            <FaListOl className="text-indigo-600" />
                                            Itens da Planilha Orçamentária Contratada
                                        </h3>
                                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                                            Quantitativos e Preços Unitários
                                        </span>
                                    </div>

                                    {itensContratadosModal.length > 0 ? (
                                        <div className="overflow-x-auto border border-[#e2e8f0] rounded-xl">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-[#f4fbff] text-slate-700 font-bold uppercase text-[10px]">
                                                    <tr>
                                                        <th className="p-3">#</th>
                                                        <th className="p-3">Item / Serviço</th>
                                                        <th className="p-3">Unid.</th>
                                                        <th className="p-3 text-right">Qtd Contratada</th>
                                                        <th className="p-3 text-right">Preço Unitário</th>
                                                        <th className="p-3 text-right">Preço Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#e2e8f0]">
                                                    {itensContratadosModal.map((it, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50">
                                                            <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                                                            <td className="p-3 font-semibold text-slate-900">{it.item}</td>
                                                            <td className="p-3 uppercase text-slate-600">{it.unidade}</td>
                                                            <td className="p-3 text-right font-mono">{Number(it.quantidade || 0).toLocaleString("pt-BR")}</td>
                                                            <td className="p-3 text-right font-mono">
                                                                R$ {Number(it.precoUnitario || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                            </td>
                                                            <td className="p-3 text-right font-mono font-bold text-slate-900">
                                                                R$ {Number(it.precoTotal || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 p-4 rounded-xl border border-[#e2e8f0] text-center text-xs text-slate-600">
                                            Planilha detalhada em processamento pela Engenharia Municipal. O inteiro teor da proposta orçamentária contratada encontra-se disponível no Processo Licitatório de Origem.
                                        </div>
                                    )}
                                </div>

                                {/* CRITÉRIO 10.3: BOLETINS DE MEDIÇÃO E VALORES PAGOS */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                            <FaMoneyCheckAlt className="text-emerald-600" />
                                            Boletins de Medição e Pagamentos Realizados
                                        </h3>
                                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                            Quantitativos Executados e Pagos
                                        </span>
                                    </div>

                                    {medicoesModal.length > 0 ? (
                                        <div className="overflow-x-auto border border-[#e2e8f0] rounded-xl">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-[#f4fbff] text-slate-700 font-bold uppercase text-[10px]">
                                                    <tr>
                                                        <th className="p-3">Boletim / Medição</th>
                                                        <th className="p-3">Data</th>
                                                        <th className="p-3 text-center">% Medido</th>
                                                        <th className="p-3 text-right">Valor Medido</th>
                                                        <th className="p-3 text-right">Valor Pago</th>
                                                        <th className="p-3">Documento Financeiro</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#e2e8f0]">
                                                    {medicoesModal.map((m, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50">
                                                            <td className="p-3 font-bold text-slate-900">{m.numero}</td>
                                                            <td className="p-3 text-slate-600">
                                                                {m.data ? new Date(m.data + "T00:00:00").toLocaleDateString("pt-BR") : "-"}
                                                            </td>
                                                            <td className="p-3 text-center font-mono font-bold text-[#01b0ef]">{m.percentual}%</td>
                                                            <td className="p-3 text-right font-mono font-bold text-slate-900">
                                                                R$ {Number(m.valorMedido || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                            </td>
                                                            <td className="p-3 text-right font-mono font-bold text-emerald-700">
                                                                R$ {Number(m.valorPago || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                            </td>
                                                            <td className="p-3 font-mono text-[11px] text-slate-500">
                                                                {m.ordemBancaria || "Ordem Bancária Liquidada"}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 p-4 rounded-xl border border-[#e2e8f0] text-center text-xs text-slate-600">
                                            Boletins de medição em fase de atesto fiscal e liquidação orçamentária pelo fiscal da obra designado.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 bg-[#f4fbff] border-t border-[#e2e8f0] flex items-center justify-end">
                                <button 
                                    onClick={() => setSelectedObra(null)}
                                    className="px-6 py-2 bg-[#01b0ef] text-white rounded-xl text-xs font-bold hover:bg-[#0098d4] transition-all shadow-sm cursor-pointer"
                                >
                                    Fechar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
