import Link from "next/link";
import {
    Receipt,
    HeartPulse,
    BookOpenCheck,
    FileSearch,
    Headset,
    Search,
    ArrowRight,
    ExternalLink,
    Wallet,
    Mail,
    UserCheck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
    FEMURN_SAO_TOME_INSTRUCTION,
    FEMURN_STABLE_SEARCH_URL,
    isValidPublicUrl,
    sanitizeDiarioOficialUrl,
} from "@/lib/portal-links";

interface TaskShortcut {
    id: string;
    label: string;
    desc: string;
    note?: string;
    defaultHref: string;
    icon: any;
    defaultOrder: number;
}

const PRIORITY_SHORTCUTS: TaskShortcut[] = [
    {
        id: "home-contribuinte",
        label: "Emitir guia ou certidão",
        desc: "IPTU, DAM, certidão negativa de débitos, alvarás e nota fiscal eletrônica.",
        defaultHref:
            "https://www.tinus.com.br/csp/SAOTOME/portal/index.csp?398ePKh0101MOVZE78365xmEw9088og=xbCN41Noq203lgm19139rlZlh569ZevDU2955S1071625bJbX145",
        icon: Receipt,
        defaultOrder: 1,
    },
    {
        id: "home-saude",
        label: "Encontrar unidade de saúde",
        desc: "Endereços, horários de atendimento, especialidades e equipes das UBS.",
        defaultHref: "/unidades-de-saude",
        icon: HeartPulse,
        defaultOrder: 2,
    },
    {
        id: "home-diario",
        label: "Consultar Diário Oficial",
        desc: "Publicações legais, decretos, portarias e avisos oficiais na FEMURN.",
        note: FEMURN_SAO_TOME_INSTRUCTION,
        defaultHref: FEMURN_STABLE_SEARCH_URL,
        icon: BookOpenCheck,
        defaultOrder: 3,
    },
    {
        id: "home-esic",
        label: "Solicitar informação pública",
        desc: "Registre pedido de acesso à informação (e-SIC / LAI) com protocolo eletrônico.",
        defaultHref: "/servicos/esic",
        icon: FileSearch,
        defaultOrder: 4,
    },
    {
        id: "home-ouvidoria",
        label: "Registrar manifestação",
        desc: "Envie reclamações, denúncias, solicitações, sugestões ou elogios à Ouvidoria.",
        defaultHref: "/servicos/ouvidoria",
        icon: Headset,
        defaultOrder: 5,
    },
    {
        id: "home-protocolo",
        label: "Consultar protocolo",
        desc: "Acompanhe o andamento e a resposta de manifestações da Ouvidoria e pedidos do e-SIC.",
        defaultHref: "/servicos/consulta-protocolo",
        icon: Search,
        defaultOrder: 6,
    },
];

const SERVER_SHORTCUTS = [
    {
        id: "home-contracheque",
        label: "Contracheque online",
        desc: "Holerites e comprovantes de rendimentos",
        defaultHref: "https://app.topsolutionsrn.com.br/ContraCheque/pmsaotome/",
        icon: Wallet,
    },
    {
        id: "home-webmail",
        label: "Webmail institucional",
        desc: "Correio eletrônico oficial dos órgãos municipais",
        defaultHref: "https://titan.hostgator.com.br/login/",
        icon: Mail,
    },
];

export default async function ServicosRapidos() {
    let linksExternos: Array<{
        id: string;
        titulo: string;
        url: string;
        descricao: string | null;
        moduloAlvo: string | null;
        ordem: number;
        ativo: boolean;
    }> = [];

    try {
        linksExternos = await prisma.linkExterno.findMany({
            where: { ativo: true, moduloAlvo: { startsWith: "home-" } },
            orderBy: [{ ordem: "asc" }, { titulo: "asc" }],
        });
    } catch (e) {
        console.error("Erro ao carregar atalhos da home:", e);
    }

    const resolvedShortcuts = PRIORITY_SHORTCUTS.map((item) => {
        const override = linksExternos.find(
            (l) => l.moduloAlvo?.toLowerCase() === item.id.toLowerCase()
        );
        let href = item.defaultHref;
        if (override && isValidPublicUrl(override.url)) {
            href =
                item.id === "home-diario"
                    ? sanitizeDiarioOficialUrl(override.url)
                    : override.url.trim();
        }
        const order =
            override && typeof override.ordem === "number" && override.ordem > 0
                ? override.ordem
                : item.defaultOrder;
        const isExternal = href.startsWith("http");

        return {
            ...item,
            href,
            order,
            isExternal,
        };
    }).sort((a, b) => a.order - b.order);

    const resolvedServerLinks = SERVER_SHORTCUTS.map((srv) => {
        const override = linksExternos.find(
            (l) => l.moduloAlvo?.toLowerCase() === srv.id.toLowerCase()
        );
        const href =
            override && isValidPublicUrl(override.url)
                ? override.url.trim()
                : srv.defaultHref;
        return {
            ...srv,
            href,
            isExternal: href.startsWith("http"),
        };
    }).filter((s) => isValidPublicUrl(s.href));

    return (
        <section
            id="servicos-e-atendimento"
            aria-labelledby="servicos-atendimento-titulo"
            className="py-10 sm:py-12 bg-white border-b border-slate-200"
        >
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Cabeçalho da Seção */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h2
                            id="servicos-atendimento-titulo"
                            className="section-title"
                        >
                            Serviços e atendimento
                        </h2>
                        <p className="text-slate-700 text-base mt-1">
                            Acesso direto às tarefas e canais mais utilizados pelo cidadão em São Tomé.
                        </p>
                    </div>

                    <Link
                        href="/transparencia/carta-servicos"
                        className="btn-secondary self-start sm:self-auto shrink-0"
                    >
                        <span>Ver todos os serviços</span>
                        <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                </div>

                {/* Grade Compacta de 6 Atalhos Prioritários */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resolvedShortcuts.map((s) => {
                        const Icon = s.icon;
                        const cardContent = (
                            <>
                                <div className="w-11 h-11 rounded-xl bg-[#edf8ff] text-[#00557d] group-hover:bg-[#006494] group-hover:text-white border border-[#9fd8f5] flex items-center justify-center shrink-0 transition-colors mt-0.5">
                                    <Icon size={21} strokeWidth={2} aria-hidden="true" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="font-heading font-bold text-slate-900 group-hover:text-[#00557d] text-base leading-snug transition-colors">
                                            {s.label}
                                        </h3>
                                        {s.isExternal ? (
                                            <ExternalLink
                                                size={15}
                                                className="text-slate-500 group-hover:text-[#00557d] shrink-0"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <ArrowRight
                                                size={15}
                                                className="text-slate-500 group-hover:text-[#00557d] group-hover:translate-x-0.5 transition-transform shrink-0"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </div>
                                    <p className="text-slate-700 text-sm leading-relaxed mt-1">
                                        {s.desc}
                                    </p>
                                    {s.note && (
                                        <p className="mt-2 text-xs font-bold text-slate-900 bg-[#fff3c4] border border-[#fdb913]/50 px-2.5 py-1 rounded-lg">
                                            {s.note}
                                        </p>
                                    )}
                                </div>
                            </>
                        );

                        return s.isExternal ? (
                            <a
                                key={s.id}
                                href={s.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl bg-[#f8fcff] hover:bg-white border border-slate-200 hover:border-[#006494] shadow-civic-sm hover:shadow-civic transition-all"
                            >
                                {cardContent}
                            </a>
                        ) : (
                            <Link
                                key={s.id}
                                href={s.href}
                                className="group flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl bg-[#f8fcff] hover:bg-white border border-slate-200 hover:border-[#006494] shadow-civic-sm hover:shadow-civic transition-all"
                            >
                                {cardContent}
                            </Link>
                        );
                    })}
                </div>

                {/* Área Identificada para Servidores (Contracheque e Webmail) */}
                {resolvedServerLinks.length > 0 && (
                    <div
                        aria-labelledby="area-servidor-titulo"
                        className="rounded-2xl bg-[#f4fbff] border border-slate-200 p-4 sm:px-6 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#00557d] text-white flex items-center justify-center shrink-0">
                                <UserCheck size={18} aria-hidden="true" />
                            </div>
                            <div>
                                <h3
                                    id="area-servidor-titulo"
                                    className="font-heading text-sm font-extrabold text-slate-900"
                                >
                                    Área do Servidor Municipal
                                </h3>
                                <p className="text-xs text-slate-700">
                                    Sistemas administrativos de uso funcional dos servidores públicos de São Tomé.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            {resolvedServerLinks.map((srv) => {
                                const SrvIcon = srv.icon;
                                return srv.isExternal ? (
                                    <a
                                        key={srv.id}
                                        href={srv.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#006494] text-[#00557d] hover:text-white border border-slate-300 hover:border-[#006494] text-xs font-bold transition-colors shadow-xs"
                                    >
                                        <SrvIcon size={15} aria-hidden="true" />
                                        <span>{srv.label}</span>
                                        <ExternalLink size={12} aria-hidden="true" />
                                    </a>
                                ) : (
                                    <Link
                                        key={srv.id}
                                        href={srv.href}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#006494] text-[#00557d] hover:text-white border border-slate-300 hover:border-[#006494] text-xs font-bold transition-colors shadow-xs"
                                    >
                                        <SrvIcon size={15} aria-hidden="true" />
                                        <span>{srv.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
