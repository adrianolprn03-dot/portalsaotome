"use client";
import { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
} from "recharts";
import { PieChart as PieChartIcon, BarChart3, ShieldCheck } from "lucide-react";

type StatData = { name: string; value: number };

type StatisticsDashboardProps = {
    type: "ouvidoria" | "esic";
};

export default function StatisticsDashboard({ type }: StatisticsDashboardProps) {
    const [data, setData] = useState<{
        porTipo?: StatData[];
        porOrgao?: StatData[];
        porStatus?: StatData[];
        porSigilo?: StatData[];
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/transparencia/estatisticas");
                const stats = await res.json();
                setData(type === "ouvidoria" ? stats.ouvidoria : stats.esic);
            } catch (error) {
                console.error("Erro ao buscar estatísticas:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [type]);

    const COLORS = [
        "#01b0ef",
        "#fdb913",
        "#10B981",
        "#0098d4",
        "#EF4444",
        "#47c6ff",
        "#64748B",
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 bg-white rounded-3xl border border-slate-200/80 shadow-civic-sm">
                <div className="w-8 h-8 border-3 border-[#01b0ef] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const mainChartData = type === "ouvidoria" ? data?.porTipo : data?.porOrgao;
    const statusData = data?.porStatus;
    const sigiloData = data?.porSigilo;

    return (
        <section className="mt-12 space-y-8">
            <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 bg-[#01b0ef]/10 border border-[#01b0ef]/25 rounded-xl flex items-center justify-center text-[#01b0ef]">
                    <BarChart3 size={22} />
                </div>
                <div>
                    <h2 className="font-heading text-2xl font-extrabold text-slate-900">
                        Indicadores e Estatísticas
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                        Base de dados consolidada em tempo real
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico Principal (Órgão / Tipo) */}
                <div className="bg-white p-8 rounded-3xl shadow-civic-sm border border-slate-200/80">
                    <h3 className="font-heading text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <BarChart3 size={16} className="text-[#01b0ef]" />
                        <span>
                            {type === "ouvidoria"
                                ? "Manifestações por Natureza"
                                : "Pedidos de Informação por Órgão"}
                        </span>
                    </h3>
                    <div className="h-[320px] w-full">
                        {mainChartData && mainChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={mainChartData}
                                    layout="vertical"
                                    margin={{ left: 10, right: 30 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        horizontal={false}
                                        stroke="#E2E8F0"
                                    />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: "#475569",
                                            fontSize: 11,
                                            fontWeight: 600,
                                        }}
                                        width={120}
                                    />
                                    <Tooltip
                                        cursor={{ fill: "#eefaff" }}
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "1px solid #b5e9ff",
                                            boxShadow:
                                                "0 10px 25px -5px rgb(0 0 0 / 0.08)",
                                        }}
                                    />
                                    <Bar
                                        dataKey="value"
                                        radius={[0, 8, 8, 0]}
                                        barSize={26}
                                    >
                                        {mainChartData.map((_, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-2xl">
                                Sem registros estatísticos no momento
                            </div>
                        )}
                    </div>
                </div>

                {/* Gráfico de Status */}
                <div className="bg-white p-8 rounded-3xl shadow-civic-sm border border-slate-200/80">
                    <h3 className="font-heading text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <PieChartIcon size={16} className="text-[#fdb913]" />
                        <span>Situação Atual das Demandas</span>
                    </h3>
                    <div className="h-[320px] w-full flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 h-full w-full">
                            {statusData && statusData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            innerRadius={65}
                                            outerRadius={105}
                                            paddingAngle={6}
                                            dataKey="value"
                                        >
                                            {statusData.map((_, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        COLORS[
                                                            index % COLORS.length
                                                        ]
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-2xl w-full">
                                    Aguardando registros
                                </div>
                            )}
                        </div>
                        <div className="shrink-0 grid grid-cols-1 gap-4 pr-2">
                            {statusData?.map((item, index) => (
                                <div
                                    key={item.name}
                                    className="flex items-center gap-3"
                                >
                                    <div
                                        className="w-3.5 h-3.5 rounded-md shrink-0"
                                        style={{
                                            backgroundColor:
                                                COLORS[index % COLORS.length],
                                        }}
                                    />
                                    <div>
                                        <p className="text-[11px] font-semibold text-slate-500">
                                            {item.name}
                                        </p>
                                        <p className="text-xl font-mono font-bold text-slate-900 leading-none">
                                            {item.value}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Terceiro Gráfico (e-SIC: Grau de Sigilo) */}
                {type === "esic" && (
                    <div className="bg-white p-8 rounded-3xl shadow-civic-sm border border-slate-200/80 lg:col-span-2">
                        <h3 className="font-heading text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <ShieldCheck size={16} className="text-[#01b0ef]" />
                            <span>Distribuição por Grau de Sigilo (LAI)</span>
                        </h3>
                        <div className="h-[280px] w-full">
                            {sigiloData && sigiloData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={sigiloData} barGap={40}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="#E2E8F0"
                                        />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fill: "#475569",
                                                fontSize: 11,
                                                fontWeight: 600,
                                            }}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            cursor={{ fill: "transparent" }}
                                            contentStyle={{
                                                borderRadius: "12px",
                                                border: "1px solid #b5e9ff",
                                                boxShadow:
                                                    "0 10px 25px -5px rgb(0 0 0 / 0.08)",
                                            }}
                                        />
                                        <Bar
                                            dataKey="value"
                                            radius={[10, 10, 0, 0]}
                                            barSize={72}
                                        >
                                            {sigiloData.map((_, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        index === 0
                                                            ? "#01b0ef"
                                                            : "#fdb913"
                                                    }
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-2xl">
                                    Aguardando classificação de pedidos
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
