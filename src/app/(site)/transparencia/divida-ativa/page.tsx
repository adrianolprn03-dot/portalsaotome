import PageHeader from "@/components/PageHeader";
import DeclaracaoInexistenciaCard, {
    type DeclaracaoPublica,
} from "@/components/transparencia/DeclaracaoInexistenciaCard";
import { prisma } from "@/lib/prisma";
import { resolverFiltroModuloDeclaracao } from "@/lib/declaracoes-catalogo";
import { Scale, Info, AlertCircle, ExternalLink, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Dívida Ativa | Portal da Transparência",
    description: "Informações sobre a Dívida Ativa do Município de São Tomé/RN, em conformidade com o PNTP 2026.",
};

interface DividaAtivaRow {
    tributo: string;
    totalFormatado: string;
    total: number;
    isTotal?: boolean;
}

interface DividaAtivaConfig {
    titulo?: string;
    subtitulo?: string;
    dataReferencia?: string;
    fonteUrl?: string;
    portalContribuinteUrl?: string;
    rows?: DividaAtivaRow[];
}

const DEFAULT_PORTAL_CONTRIBUINTE_URL =
    "https://tinus.com.br/csp/SAOTOME/portal/index.csp";

export default async function DividaAtivaPage() {
    let declaracaoInicial: DeclaracaoPublica | null = null;
    let parsedDivida: DividaAtivaConfig | null = null;
    let portalContribuinteUrl = DEFAULT_PORTAL_CONTRIBUINTE_URL;

    try {
        const { aliases, criterioEfetivo } = resolverFiltroModuloDeclaracao("divida_ativa", "3.2");
        const [found, configDivida, linkContribuinte] = await Promise.all([
            prisma.declaracaoTransparencia
                .findFirst({
                    where: {
                        ativa: true,
                        OR: [
                            { modulo: { in: aliases } },
                            ...(criterioEfetivo ? [{ criterioPntp: criterioEfetivo }] : []),
                        ],
                    },
                    orderBy: [{ exercicio: "desc" }, { dataEmissao: "desc" }],
                })
                .catch(() => null),
            prisma.configuracao
                .findUnique({
                    where: { chave: "divida_ativa_tabela_wp" },
                })
                .catch(() => null),
            prisma.linkExterno
                .findFirst({
                    where: { id: "home-contribuinte" },
                })
                .catch(() => null),
        ]);

        if (found) {
            declaracaoInicial = {
                ...found,
                dataEmissao: found.dataEmissao.toISOString(),
                dataConferencia: found.dataConferencia.toISOString(),
            };
        }

        if (configDivida?.valor) {
            try {
                parsedDivida = JSON.parse(configDivida.valor) as DividaAtivaConfig;
            } catch {
                parsedDivida = null;
            }
        }

        if (linkContribuinte?.url) {
            portalContribuinteUrl = linkContribuinte.url;
        } else if (parsedDivida?.portalContribuinteUrl) {
            portalContribuinteUrl = parsedDivida.portalContribuinteUrl;
        }
    } catch {
        declaracaoInicial = null;
    }

    const rows = parsedDivida?.rows || [];

    return (
        <div className="bg-[#f8fafc] min-h-screen">
            <PageHeader
                title="Dívida Ativa"
                subtitle="Consulte as informações sobre créditos tributários e não tributários inscritos em dívida ativa."
                variant="premium"
                icon={<Scale className="text-white" size={32} />}
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Transparência", href: "/transparencia" },
                    { label: "Dívida Ativa" }
                ]}
            />

            <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">
                {rows.length > 0 ? (
                    <div className="bg-white rounded-[2rem] border border-sky-100 shadow-xl overflow-hidden">
                        <div className="p-8 md:p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-sky-50/60 via-white to-emerald-50/40">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-widest mb-2">
                                    <CheckCircle2 size={13} /> Demonstrativo Consolidado Oficial
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                                    {parsedDivida?.titulo || "Demonstrativo da Dívida Ativa Municipal"}
                                </h2>
                                <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
                                    {parsedDivida?.subtitulo ||
                                        "Relação consolidada por natureza de crédito tributário e não tributário inscrito em Dívida Ativa."}
                                </p>
                            </div>
                            <a
                                href={portalContribuinteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-[#01b0ef] hover:bg-[#0098d4] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md"
                            >
                                <ExternalLink size={14} /> Portal do Contribuinte
                            </a>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-500">
                                        <th className="py-4 px-8">Natureza do Crédito / Tributo</th>
                                        <th className="py-4 px-8">Situação / Regime</th>
                                        <th className="py-4 px-8 text-right">Saldo Inscrito Consolidado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {rows.map((row, idx) => (
                                        <tr
                                            key={idx}
                                            className={
                                                row.isTotal
                                                    ? "bg-slate-900 text-white font-black"
                                                    : "hover:bg-slate-50/80 transition-colors"
                                            }
                                        >
                                            <td className="py-4 px-8 font-bold">{row.tributo}</td>
                                            <td className="py-4 px-8">
                                                {row.isTotal ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold">
                                                        Consolidado Geral
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold">
                                                        Inscrito em Dívida Ativa
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-8 text-right font-mono text-base font-black">
                                                {row.totalFormatado}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <DeclaracaoInexistenciaCard
                        modulo="divida_ativa"
                        criterioPntp="3.2"
                        declaracaoInicial={declaracaoInicial}
                        tituloFallback="Inexistência de Inscritos em Dívida Ativa"
                        textoFallback="O Município de São Tomé/RN informa que, após consulta aos registros tributários, contábeis e administrativos, não foram identificadas pessoas físicas ou jurídicas com débitos inscritos em dívida ativa municipal, tributária ou não tributária, nos exercícios de 2024, 2025 e 2026, até a presente data. Caso ocorram futuras inscrições, as informações serão publicadas nesta página conforme as diretrizes do PNTP 2026."
                    />
                )}

                <div className="bg-white rounded-[2rem] p-12 shadow-xl border border-sky-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Scale size={200} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-[#01b0ef] rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <Info size={24} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">O que é a Dívida Ativa?</h2>
                        </div>

                        <div className="space-y-6 text-slate-600 font-medium leading-relaxed mb-12">
                            <p>
                                A Dívida Ativa é o conjunto de créditos do Município (tributários ou não), que não foram pagos pelos contribuintes dentro do prazo de vencimento e que, após esgotadas as instâncias administrativas, são inscritos em um cadastro específico.
                            </p>
                            <p>
                                Esses valores podem ser referentes a IPTU, ISS, Taxas de Licenciamento, multas de trânsito, entre outros. A transparência desses dados é fundamental para o controle social e fiscal do município.
                            </p>
                        </div>

                        <div className="bg-[#fff4d4]/60 rounded-3xl p-8 border border-[#fdb913]/40 mb-12">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-[#fdb913] rounded-xl flex items-center justify-center text-slate-900 shrink-0 shadow-md">
                                    <AlertCircle size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-2">Consulta e Regularização</h3>
                                    <p className="text-sm text-slate-700 font-semibold leading-relaxed">
                                        Em cumprimento à Lei Geral de Proteção de Dados (LGPD) e ao sigilo fiscal (Art. 198 do CTN), a consulta detalhada de débitos por CPF/CNPJ e a emissão de guias para pagamento (DAM) ou parcelamento devem ser realizadas diretamente no Portal do Contribuinte.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6">
                            <a
                                href={portalContribuinteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-[#01b0ef] text-white text-center py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-[#0098d4] transition-all shadow-xl shadow-[#01b0ef]/20 active:scale-95 flex items-center justify-center gap-3"
                            >
                                <ExternalLink size={16} /> Acessar Portal do Contribuinte
                            </a>
                            <Link
                                href="/servicos/esic"
                                className="flex-1 bg-[#fdb913] text-slate-900 text-center py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-[#e5a60d] transition-all shadow-xl shadow-[#fdb913]/20 active:scale-95"
                            >
                                Solicitar Informações via e-SIC
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
