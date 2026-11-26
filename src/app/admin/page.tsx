import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { canAccessAdminPath, getPerfilMeta } from "@/lib/rbac-routes";
import { CATALOGO_CRITERIOS_PNTP_2026 } from "@/lib/pntp-catalog";
import {
    FaNewspaper,
    FaGavel,
    FaUsers,
    FaBullhorn,
    FaFileContract,
    FaChartBar,
    FaHammer,
    FaBuilding,
    FaPlus,
    FaArrowRight,
    FaHeartbeat,
    FaShieldAlt,
    FaExclamationTriangle,
    FaClock,
    FaUpload,
    FaFileAlt,
    FaLink,
    FaClipboardCheck,
    FaLayerGroup,
} from "react-icons/fa";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role || "admin";
    const userName = session?.user?.name?.split(" ")[0] || "Gestor";

    const hour = new Date().getHours();
    let saudacao = "Bem-vindo(a)";
    if (hour >= 5 && hour < 12) saudacao = "Bom dia";
    else if (hour >= 12 && hour < 18) saudacao = "Boa tarde";
    else saudacao = "Boa noite";

    const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date());

    let counts = {
        noticia: 0,
        licitacao: 0,
        contrato: 0,
        convenio: 0,
        diaria: 0,
        servidor: 0,
        ouvidoria: 0,
        contato: 0,
        obra: 0,
        faq: 0,
        glossario: 0,
        legislacao: 0,
        unidades: 0,
        regulacao: 0,
    };

    // Indicadores operacionais PNTP (Seção 4)
    let aguardandoRevisaoCount = 0;
    let prazosVencidosCount = 0;
    let docsObrigatoriosPendentes = 0;
    let lacunasExerciciosCount = 0;
    let falhasImportacaoCount = 0;
    let linksComErroCount = 0;
    let esicPendentesCount = 0;
    let esicRecursosCount = 0;
    let femurnRascunhos = {
        decretos: 0,
        portarias: 0,
        outrosDocumentos: 0,
        totalLegislacao: 0,
        diarias: 0,
        totalGeral: 0,
    };
    let essenciaisPendentesCount = CATALOGO_CRITERIOS_PNTP_2026.filter(
        (c) => c.classificacao === "ESSENCIAL"
    ).length;
    let pendenciasPorSecretaria: Array<{ secretaria: string; pendentes: number }> = [];

    let ultimasNoticias: Array<{ id: string; titulo: string; criadoEm: Date; publicada: boolean }> = [];
    let ultimasObras: Array<{ id: string; titulo: string; criadoEm: Date; status: string }> = [];
    let ultimasImportacoes: Array<{
        id: string;
        tipo: string;
        nomeArquivo: string;
        status: string;
        registros: number;
        criadoEm: Date;
    }> = [];

    try {
        const [
            noticia,
            licitacao,
            contrato,
            convenio,
            diaria,
            servidor,
            ouvidoria,
            contato,
            obra,
            faq,
            glossario,
            legislacao,
            unidades,
            regulacao,
            esicAbertos,
            esicRecursos,
            importacoesFalha,
            docsSemArquivo,
            relatoriosFiscaisCount,
            criteriosDb,
            receitasAnos,
            despesasAnos,
            noticiasRecentes,
            obrasRecentes,
            importacoesRecentes,
            femurnLegislacaoGrupo,
            femurnDiariasCount,
        ] = await Promise.all([
            prisma.noticia.count(),
            prisma.licitacao.count(),
            prisma.contrato.count(),
            prisma.convenio.count(),
            prisma.diaria.count(),
            prisma.servidor.count(),
            prisma.ouvidoria.count({ where: { status: "aberto" } }),
            prisma.contato.count({ where: { respondido: false } }),
            prisma.obra.count(),
            prisma.fAQ.count(),
            prisma.glossario.count(),
            prisma.legislacao.count(),
            prisma.unidadeAtendimento.count(),
            prisma.centralRegulacaoItem.count(),
            prisma.esic.count({ where: { status: { in: ["aberto", "em_analise", "prorrogado"] } } }),
            prisma.esic.count({ where: { status: { in: ["recurso", "recurso_1", "recurso_2"] } } }),
            prisma.importacaoCSV.count({ where: { status: { in: ["erro", "parcial"] } } }),
            prisma.documento.count({ where: { OR: [{ arquivo: null }, { arquivo: "" }] } }),
            prisma.relatorioFiscal.count(),
            prisma.criterioPNTP.findMany(),
            prisma.receita.groupBy({ by: ["ano"] }),
            prisma.despesa.groupBy({ by: ["ano"] }),
            prisma.noticia.findMany({
                take: 4,
                orderBy: { criadoEm: "desc" },
                select: { id: true, titulo: true, criadoEm: true, publicada: true },
            }),
            prisma.obra.findMany({
                take: 4,
                orderBy: { criadoEm: "desc" },
                select: { id: true, titulo: true, criadoEm: true, status: true },
            }),
            prisma.importacaoCSV.findMany({
                take: 4,
                orderBy: { criadoEm: "desc" },
                select: { id: true, modulo: true, arquivo: true, status: true, total: true, criadoEm: true },
            }),
            prisma.legislacao.groupBy({
                by: ["tipo"],
                where: { ativo: false, femurn: { isNot: null } },
                _count: { _all: true },
            }),
            prisma.diaria.count({
                where: { situacaoPublicacao: "rascunho", femurn: { isNot: null } },
            }),
        ]);

        counts = {
            noticia,
            licitacao,
            contrato,
            convenio,
            diaria,
            servidor,
            ouvidoria,
            contato,
            obra,
            faq,
            glossario,
            legislacao,
            unidades,
            regulacao,
        };

        let decretosFemurn = 0;
        let portariasFemurn = 0;
        let outrosLegFemurn = 0;
        for (const grupo of femurnLegislacaoGrupo) {
            const qtd = grupo._count._all;
            const t = grupo.tipo.toLowerCase();
            if (t === "decreto") decretosFemurn += qtd;
            else if (t === "portaria" || t === "portaria_diaria") portariasFemurn += qtd;
            else outrosLegFemurn += qtd;
        }
        const totalLegislacaoFemurn = decretosFemurn + portariasFemurn + outrosLegFemurn;
        femurnRascunhos = {
            decretos: decretosFemurn,
            portarias: portariasFemurn,
            outrosDocumentos: outrosLegFemurn,
            totalLegislacao: totalLegislacaoFemurn,
            diarias: femurnDiariasCount,
            totalGeral: totalLegislacaoFemurn + femurnDiariasCount,
        };

        esicPendentesCount = esicAbertos;
        esicRecursosCount = esicRecursos;
        falhasImportacaoCount = importacoesFalha;
        linksComErroCount = docsSemArquivo;
        docsObrigatoriosPendentes = Math.max(0, 6 - relatoriosFiscaisCount); // PPA, LDO, LOA, RGF, RREO, Balanço

        const anosCiclo = [2023, 2024, 2025, 2026];
        const rSet = new Set(receitasAnos.map((r) => r.ano));
        const dSet = new Set(despesasAnos.map((d) => d.ano));
        lacunasExerciciosCount =
            anosCiclo.filter((a) => !rSet.has(a)).length +
            anosCiclo.filter((a) => !dSet.has(a)).length;

        const dbMap = new Map(criteriosDb.map((c) => [c.codigo, c]));
        const now = Date.now();
        const secMap = new Map<string, number>();

        let rev = 0;
        let venc = 0;
        let essPend = 0;

        for (const cat of CATALOGO_CRITERIOS_PNTP_2026) {
            const saved = dbMap.get(cat.codigo);
            const stVal = saved?.statusValidacao || "pendente";
            const stCont = saved?.statusConteudo || "pendente";
            const sec = saved?.secretariaResponsavel || cat.secretariaResponsavel;

            if (stVal === "aguardando_revisao") rev++;

            const refDate = saved?.dataUltimaVerificacao || saved?.atualizadoEm;
            const dias = refDate
                ? Math.floor((now - new Date(refDate).getTime()) / (1000 * 60 * 60 * 24))
                : null;
            if (cat.periodicidadeDias > 0 && (dias === null || dias > cat.periodicidadeDias)) {
                venc++;
            }

            const validado =
                ["atualizado", "nao_ocorrencia", "nao_aplicavel"].includes(stCont) &&
                stVal === "validado";

            if (!validado) {
                secMap.set(sec, (secMap.get(sec) || 0) + 1);
                if (cat.classificacao === "ESSENCIAL") essPend++;
            }
        }

        aguardandoRevisaoCount = rev;
        prazosVencidosCount = venc;
        essenciaisPendentesCount = essPend;
        pendenciasPorSecretaria = Array.from(secMap.entries())
            .map(([secretaria, pendentes]) => ({ secretaria, pendentes }))
            .sort((a, b) => b.pendentes - a.pendentes);

        ultimasNoticias = noticiasRecentes;
        ultimasObras = obrasRecentes;
        ultimasImportacoes = importacoesRecentes.map((imp) => ({
            id: imp.id,
            tipo: imp.modulo,
            nomeArquivo: imp.arquivo,
            status: imp.status,
            registros: imp.total,
            criadoEm: imp.criadoEm,
        }));
    } catch {
        // Fallback seguro quando o banco está offline no ambiente de teste
        const secMap = new Map<string, number>();
        for (const cat of CATALOGO_CRITERIOS_PNTP_2026) {
            secMap.set(cat.secretariaResponsavel, (secMap.get(cat.secretariaResponsavel) || 0) + 1);
        }
        pendenciasPorSecretaria = Array.from(secMap.entries()).map(([secretaria, pendentes]) => ({
            secretaria,
            pendentes,
        }));
        prazosVencidosCount = CATALOGO_CRITERIOS_PNTP_2026.length;
    }

    const operationalAlerts = [
        {
            title: "1. Conteúdos Aguardando Revisão",
            value: aguardandoRevisaoCount,
            subtitle: "Encaminhados para homologação da Controladoria",
            href: "/admin/pntp?filtro=aguardando_revisao",
            icon: FaClipboardCheck,
            color: "text-indigo-700 bg-indigo-50 border-indigo-200",
        },
        {
            title: "2. Prazos de Atualização Vencidos/Próximos",
            value: prazosVencidosCount,
            subtitle: "Critérios sem conferência dentro da periodicidade PNTP",
            href: "/admin/pntp?filtro=vencidos",
            icon: FaClock,
            color: "text-amber-800 bg-amber-50 border-amber-200",
        },
        {
            title: "3. Documentos Obrigatórios Pendentes",
            value: docsObrigatoriosPendentes,
            subtitle: "Instrumentos de planejamento e relatórios LRF",
            href: "/admin/relatorios-fiscais",
            icon: FaFileAlt,
            color: "text-blue-700 bg-blue-50 border-blue-200",
        },
        {
            title: "4. Lacunas de Exercícios (2023–2026)",
            value: lacunasExerciciosCount,
            subtitle: "Exercícios sem registros em Receitas ou Despesas",
            href: "/admin/receitas",
            icon: FaLayerGroup,
            color: "text-orange-700 bg-orange-50 border-orange-200",
        },
        {
            title: "5. Últimas Importações e Falhas",
            value: falhasImportacaoCount,
            subtitle: "Execuções CSV com alerta ou falha parcial",
            href: "/admin/importacao",
            icon: FaUpload,
            color: "text-purple-700 bg-purple-50 border-purple-200",
        },
        {
            title: "6. Links e Arquivos com Erro Detectado",
            value: linksComErroCount,
            subtitle: "Documentos com URL ausente ou falha de integridade",
            href: "/admin/documentos",
            icon: FaLink,
            color: "text-rose-700 bg-rose-50 border-rose-200",
        },
        {
            title: "7. Pedidos e-SIC e Recursos Pendentes",
            value: esicPendentesCount + esicRecursosCount,
            subtitle: `${esicPendentesCount} pedidos abertos · ${esicRecursosCount} recursos em instância`,
            href: "/admin/esic",
            icon: FaBullhorn,
            color: "text-cyan-800 bg-cyan-50 border-cyan-200",
        },
        {
            title: "8. Pendências dos Critérios Essenciais",
            value: essenciaisPendentesCount,
            subtitle: "Critérios eliminatórios (100% exigidos p/ certificação)",
            href: "/admin/pntp?filtro=essenciais_pendentes",
            icon: FaShieldAlt,
            color: "text-red-800 bg-red-50 border-red-200",
        },
    ];

    const metrics = [
        { icon: FaNewspaper, bgLight: "bg-blue-50/80", text: "text-blue-600", border: "border-blue-100", href: "/admin/noticias", label: "Notícias", value: counts.noticia, subtext: "Cadastradas", roles: ["admin", "controladoria", "editor", "comunicacao"] },
        { icon: FaHammer, bgLight: "bg-orange-50/80", text: "text-orange-600", border: "border-orange-100", href: "/admin/obras", label: "Obras", value: counts.obra, subtext: "Acompanhamento", roles: ["admin", "controladoria", "editor"] },
        { icon: FaBuilding, bgLight: "bg-teal-50/80", text: "text-teal-600", border: "border-teal-100", href: "/admin/unidades", label: "Unidades", value: counts.unidades, subtext: "Atendimento", roles: ["admin", "controladoria", "editor"] },
        { icon: FaHeartbeat, bgLight: "bg-rose-50/80", text: "text-rose-600", border: "border-rose-100", href: "/admin/central-regulacao", label: "Regulação", value: counts.regulacao, subtext: "Filas de Saúde", roles: ["admin", "controladoria", "editor"] },
        { icon: FaGavel, bgLight: "bg-amber-50/80", text: "text-amber-600", border: "border-amber-100", href: "/admin/licitacoes", label: "Licitações", value: counts.licitacao, subtext: "Processos", roles: ["admin", "controladoria", "editor"] },
        { icon: FaFileContract, bgLight: "bg-indigo-50/80", text: "text-indigo-600", border: "border-indigo-100", href: "/admin/contratos", label: "Contratos", value: counts.contrato, subtext: "Vigentes/Registrados", roles: ["admin", "controladoria", "editor"] },
        { icon: FaUsers, bgLight: "bg-cyan-50/80", text: "text-cyan-600", border: "border-cyan-100", href: "/admin/servidores", label: "Servidores", value: counts.servidor, subtext: "Quadro de Pessoal", roles: ["admin", "controladoria", "editor"] },
        { icon: FaBullhorn, bgLight: "bg-purple-50/80", text: "text-purple-600", border: "border-purple-100", href: "/admin/ouvidoria", label: "Ouvidoria", value: counts.ouvidoria, subtext: "Manifestações Abertas", roles: ["admin", "controladoria", "esic", "editor"] },
    ].filter((c) => c.roles.includes(role));

    const quickActions = [
        { label: "Painel PNTP 2026", href: "/admin/pntp", icon: FaShieldAlt, bg: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20" },
        { label: "Importar CSV", href: "/admin/importacao", icon: FaUpload, bg: "bg-white hover:bg-[#f4fbff] text-[#01b0ef] shadow-md" },
        { label: "Nova Licitação", href: "/admin/licitacoes/nova", icon: FaGavel, bg: "bg-[#fdb913] hover:bg-[#e5a60d] text-slate-900 shadow-[#fdb913]/25" },
        { label: "Novo Contrato", href: "/admin/contratos/novo", icon: FaFileContract, bg: "bg-[#01b0ef] hover:bg-[#0098d4] text-white shadow-[#01b0ef]/20" },
        { label: "Nova Notícia", href: "/admin/noticias/nova", icon: FaNewspaper, bg: "bg-white hover:bg-[#f4fbff] text-[#01b0ef] shadow-md" },
        { label: "Gerenciar Agenda", href: "/admin/agenda", icon: FaBullhorn, bg: "bg-[#fdb913] hover:bg-[#e5a60d] text-slate-900 shadow-[#fdb913]/25" },
        { label: "Medicamentos SUS", href: "/admin/medicamentos", icon: FaHeartbeat, bg: "bg-white hover:bg-[#f4fbff] text-rose-600 shadow-md" },
        { label: "Regulação SUS", href: "/admin/central-regulacao", icon: FaBuilding, bg: "bg-[#fdb913] hover:bg-[#e5a60d] text-slate-900 shadow-[#fdb913]/25" },
        { label: "Fila de Creches", href: "/admin/creches", icon: FaUsers, bg: "bg-white hover:bg-[#f4fbff] text-[#01b0ef] shadow-md" },
        { label: "Painel Educação", href: "/admin/educacao", icon: FaBuilding, bg: "bg-[#fdb913] hover:bg-[#e5a60d] text-slate-900 shadow-[#fdb913]/25" },
        { label: "Obras Públicas", href: "/admin/obras", icon: FaHammer, bg: "bg-white hover:bg-[#f4fbff] text-orange-600 shadow-md" },
        { label: "Frota Municipal", href: "/admin/frota", icon: FaBuilding, bg: "bg-[#fdb913] hover:bg-[#e5a60d] text-slate-900 shadow-[#fdb913]/25" },
        { label: "Servidores e Folha", href: "/admin/servidores", icon: FaUsers, bg: "bg-white hover:bg-[#f4fbff] text-[#01b0ef] shadow-md" },
        { label: "Diárias de Viagem", href: "/admin/diarias", icon: FaFileContract, bg: "bg-[#fdb913] hover:bg-[#e5a60d] text-slate-900 shadow-[#fdb913]/25" },
        { label: "Atender e-SIC", href: "/admin/esic", icon: FaBullhorn, bg: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20" },
        { label: "Ouvidoria", href: "/admin/ouvidoria", icon: FaUsers, bg: "bg-white hover:bg-[#f4fbff] text-[#01b0ef] shadow-md" },
    ];

    return (
        <div className="max-w-[1440px] mx-auto space-y-8 pb-12">
            {/* HERO WELCOME BANNER */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#01b0ef] via-[#1dc0fa] to-[#0098d4] p-8 sm:p-10 text-white shadow-2xl shadow-[#01b0ef]/20 border-b-4 border-[#fdb913]">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fdb913] text-slate-900 text-xs font-extrabold mb-4 shadow-sm uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse"></span>
                            {dataFormatada} · {getPerfilMeta(role).label}
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3 text-white">
                            {saudacao},{" "}
                            <span className="inline-block px-2.5 py-0.5 rounded-xl bg-white text-[#01b0ef] shadow-sm">
                                {userName}!
                            </span>
                        </h1>

                        <p className="text-white/95 text-sm sm:text-base max-w-2xl font-medium leading-relaxed">
                            {getPerfilMeta(role).shortDesc} Utilize os atalhos e cartões abaixo para atualizar os módulos liberados ao seu perfil.
                        </p>
                    </div>

                    <div className="shrink-0 flex flex-wrap items-center gap-3">
                        {quickActions
                            .filter((act) => act.href === "/" || canAccessAdminPath(role, act.href))
                            .slice(0, 3)
                            .map((act, idx) => (
                            <Link
                                key={idx}
                                href={act.href}
                                className={`px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all flex items-center gap-2 ${act.bg}`}
                            >
                                <act.icon size={13} /> {act.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* ALERTA PRINCIPAL: RASCUNHOS DA FEMURN AGUARDANDO APROVAÇÃO */}
            {femurnRascunhos.totalGeral > 0 &&
                (canAccessAdminPath(role, "/admin/legislacao") || canAccessAdminPath(role, "/admin/diarias")) && (
                <section
                    aria-label="Rascunhos da FEMURN aguardando aprovação"
                    className="rounded-3xl bg-red-50 border-2 border-red-300 p-6 shadow-sm space-y-5"
                >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-4">
                            <span className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-600/30 animate-pulse">
                                <FaExclamationTriangle size={20} />
                            </span>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-base sm:text-lg font-black text-red-950 tracking-tight">
                                        Rascunhos da FEMURN Aguardando Aprovação
                                    </h2>
                                    <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-xs font-black">
                                        {femurnRascunhos.totalGeral} {femurnRascunhos.totalGeral === 1 ? "documento" : "documentos"}
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-red-800 mt-0.5">
                                    Existem atos importados do Diário Oficial (FEMURN) em rascunho aguardando conferência e publicação manual.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {canAccessAdminPath(role, "/admin/legislacao") && (
                                <Link
                                    href="/admin/legislacao"
                                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center gap-2"
                                >
                                    Revisar Legislação ({femurnRascunhos.totalLegislacao}) <FaArrowRight size={10} />
                                </Link>
                            )}
                            {canAccessAdminPath(role, "/admin/diarias") && (
                                <Link
                                    href="/admin/diarias"
                                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-red-100 text-red-700 border border-red-300 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center gap-2"
                                >
                                    Revisar Diárias ({femurnRascunhos.diarias}) <FaArrowRight size={10} />
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {canAccessAdminPath(role, "/admin/legislacao") && (
                            <Link
                                href="/admin/legislacao"
                                className="bg-white/95 hover:bg-white border border-red-200 rounded-2xl p-4 transition-all hover:shadow-sm flex items-center justify-between"
                            >
                                <div>
                                    <div className="text-[11px] font-bold uppercase tracking-wider text-red-700">Decretos</div>
                                    <div className="text-2xl font-black text-red-950 mt-0.5">{femurnRascunhos.decretos}</div>
                                    <div className="text-[11px] text-red-700/80">Em Legislação e Atos</div>
                                </div>
                                <FaGavel className="text-red-500" size={20} />
                            </Link>
                        )}
                        {canAccessAdminPath(role, "/admin/legislacao") && (
                            <Link
                                href="/admin/legislacao"
                                className="bg-white/95 hover:bg-white border border-red-200 rounded-2xl p-4 transition-all hover:shadow-sm flex items-center justify-between"
                            >
                                <div>
                                    <div className="text-[11px] font-bold uppercase tracking-wider text-red-700">Portarias</div>
                                    <div className="text-2xl font-black text-red-950 mt-0.5">{femurnRascunhos.portarias}</div>
                                    <div className="text-[11px] text-red-700/80">Em Legislação e Atos</div>
                                </div>
                                <FaFileContract className="text-red-500" size={20} />
                            </Link>
                        )}
                        {canAccessAdminPath(role, "/admin/diarias") && (
                            <Link
                                href="/admin/diarias"
                                className="bg-white/95 hover:bg-white border border-red-200 rounded-2xl p-4 transition-all hover:shadow-sm flex items-center justify-between"
                            >
                                <div>
                                    <div className="text-[11px] font-bold uppercase tracking-wider text-red-700">Diárias de Viagem</div>
                                    <div className="text-2xl font-black text-red-950 mt-0.5">{femurnRascunhos.diarias}</div>
                                    <div className="text-[11px] text-red-700/80">Portarias de deslocamento</div>
                                </div>
                                <FaFileAlt className="text-red-500" size={20} />
                            </Link>
                        )}
                        <div className="bg-red-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
                            <div>
                                <div className="text-[11px] font-bold uppercase tracking-wider text-red-100">Todos os Documentos</div>
                                <div className="text-2xl font-black mt-0.5">{femurnRascunhos.totalGeral}</div>
                                <div className="text-[11px] text-red-100">
                                    {femurnRascunhos.outrosDocumentos > 0
                                        ? `Inclui ${femurnRascunhos.outrosDocumentos} outro(s) ato(s)`
                                        : "Total pendente da FEMURN"}
                                </div>
                            </div>
                            <FaClipboardCheck className="text-red-100" size={22} />
                        </div>
                    </div>
                </section>
            )}

            {/* VISÃO GERAL ADMINISTRATIVA: 8 INDICADORES OPERACIONAIS + PENDÊNCIAS POR SECRETARIA */}
            {canAccessAdminPath(role, "/admin/pntp") && (
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                    <div>
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                            <FaShieldAlt className="text-primary-600" /> Indicadores Operacionais de Governança PNTP 2026
                        </h2>
                        <p className="text-xs text-slate-500">
                            Origem dos dados: cruzamento em tempo real entre o catálogo Executivo Municipal PNTP 2026 ({CATALOGO_CRITERIOS_PNTP_2026.length} critérios) e os registros publicados no banco.
                        </p>
                    </div>
                    <Link
                        href="/admin/pntp"
                        className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1"
                    >
                        Abrir Matriz Completa PNTP <FaArrowRight size={10} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {operationalAlerts.map((item) => (
                        <Link
                            key={item.title}
                            href={item.href}
                            className={`p-5 rounded-2xl border ${item.color} hover:shadow-md transition-all flex flex-col justify-between group`}
                        >
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <span className="text-xs font-black uppercase tracking-tight leading-snug">
                                    {item.title}
                                </span>
                                <item.icon className="shrink-0 opacity-80 group-hover:scale-110 transition-transform" size={18} />
                            </div>
                            <div>
                                <div className="text-3xl font-black leading-none mb-1">{item.value}</div>
                                <div className="text-[11px] font-medium opacity-85 flex items-center justify-between">
                                    <span>{item.subtitle}</span>
                                    <span className="font-bold underline ml-2">Filtrar →</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* 9. Pendências por Secretaria (Clicáveis) */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <FaExclamationTriangle className="text-amber-500" /> 9. Pendências de Validação por Secretaria / Unidade Responsável
                        </h3>
                        <span className="text-[11px] text-slate-400">
                            Clique na secretaria para abrir seus critérios pendentes
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {pendenciasPorSecretaria.map((sec) => (
                            <Link
                                key={sec.secretaria}
                                href={`/admin/pntp?secretaria=${encodeURIComponent(sec.secretaria)}`}
                                className="p-3.5 rounded-xl bg-slate-50 hover:bg-primary-50 border border-slate-200/80 hover:border-primary-200 transition-all flex items-center justify-between gap-2"
                            >
                                <span className="text-xs font-bold text-slate-700 truncate" title={sec.secretaria}>
                                    {sec.secretaria}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 shrink-0">
                                    {sec.pendentes} pend.
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            )}

            {/* METRICS & KPIS GRID */}
            <div>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                        <FaChartBar className="text-primary-600" /> Cadastros por Assunto
                    </h2>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total de Registros no Banco</span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {metrics.filter((m) => canAccessAdminPath(role, m.href)).map((m) => (
                        <Link
                            key={m.href}
                            href={m.href}
                            className={`group relative bg-white p-6 rounded-[2rem] shadow-sm border ${m.border} hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden isolate flex flex-col justify-between`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-2xl ${m.bgLight} ${m.text} flex items-center justify-center shrink-0`}>
                                    <m.icon size={20} />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-primary-600 transition-colors flex items-center gap-1">
                                    Acessar <FaArrowRight size={8} />
                                </span>
                            </div>

                            <div>
                                <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none mb-1.5 group-hover:text-primary-600 transition-colors">
                                    {m.value.toLocaleString()}
                                </div>
                                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">{m.label}</div>
                                <div className="text-[11px] font-medium text-slate-400 mt-0.5">{m.subtext}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* FEED DE ATIVIDADES E IMPORTAÇÕES RECENTES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Notícias Recentes */}
                {canAccessAdminPath(role, "/admin/noticias") && (
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                                <FaNewspaper className="text-blue-600" /> Publicações Recentes
                            </h3>
                            <Link href="/admin/noticias" className="text-xs font-bold text-primary-600 hover:underline">
                                Ver todas
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {ultimasNoticias.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">Nenhuma notícia cadastrada.</p>
                            ) : (
                                ultimasNoticias.map((n) => (
                                    <Link
                                        key={n.id}
                                        href={`/admin/noticias/editar/${n.id}`}
                                        className="group flex items-start justify-between p-3.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all gap-3"
                                    >
                                        <div className="space-y-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-700 line-clamp-1 group-hover:text-primary-700">
                                                {n.titulo}
                                            </p>
                                            <span className="text-[10px] font-medium text-slate-400 block">
                                                {new Date(n.criadoEm).toLocaleDateString("pt-BR")}
                                            </span>
                                        </div>
                                        <span
                                            className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md shrink-0 ${n.publicada
                                                ? "bg-emerald-100 text-emerald-800"
                                                : "bg-amber-100 text-amber-800"
                                                }`}
                                        >
                                            {n.publicada ? "Publicada" : "Rascunho"}
                                        </span>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Obras Recentes */}
                {canAccessAdminPath(role, "/admin/obras") && (
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                                <FaHammer className="text-orange-600" /> Obras Públicas
                            </h3>
                            <Link href="/admin/obras" className="text-xs font-bold text-primary-600 hover:underline">
                                Ver todas
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {ultimasObras.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">Nenhuma obra cadastrada.</p>
                            ) : (
                                ultimasObras.map((o) => (
                                    <Link
                                        key={o.id}
                                        href={`/admin/obras/editar/${o.id}`}
                                        className="group flex items-start justify-between p-3.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all gap-3"
                                    >
                                        <div className="space-y-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-700 line-clamp-1 group-hover:text-primary-700">
                                                {o.titulo}
                                            </p>
                                            <span className="text-[10px] font-medium text-slate-400 block">
                                                {new Date(o.criadoEm).toLocaleDateString("pt-BR")}
                                            </span>
                                        </div>
                                        <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-md bg-blue-100 text-blue-800 shrink-0">
                                            {o.status || "Em Andamento"}
                                        </span>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Últimas Importações CSV */}
                {canAccessAdminPath(role, "/admin/importacao") && (
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                                <FaUpload className="text-purple-600" /> Últimas Importações
                            </h3>
                            <Link href="/admin/importacao" className="text-xs font-bold text-primary-600 hover:underline">
                                Gerenciar
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {ultimasImportacoes.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">Nenhuma importação registrada.</p>
                            ) : (
                                ultimasImportacoes.map((imp) => (
                                    <Link
                                        key={imp.id}
                                        href="/admin/importacao"
                                        className="group flex items-start justify-between p-3.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all gap-3"
                                    >
                                        <div className="space-y-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-700 line-clamp-1 group-hover:text-primary-700">
                                                {imp.tipo.toUpperCase()} — {imp.nomeArquivo}
                                            </p>
                                            <span className="text-[10px] font-medium text-slate-400 block">
                                                {imp.registros} registros · {new Date(imp.criadoEm).toLocaleDateString("pt-BR")}
                                            </span>
                                        </div>
                                        <span
                                            className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md shrink-0 ${imp.status === "concluido"
                                                ? "bg-emerald-100 text-emerald-800"
                                                : "bg-rose-100 text-rose-800"
                                                }`}
                                        >
                                            {imp.status}
                                        </span>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
