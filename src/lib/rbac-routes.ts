export const TIPOS_LEGISLACAO = [
    { value: "lei", label: "Lei Ordinária / Municipal" },
    { value: "lei-complementar", label: "Lei Complementar" },
    { value: "decreto", label: "Decreto Executivo" },
    { value: "portaria", label: "Portaria" },
    { value: "portaria_diaria", label: "Portaria de Diária" },
    { value: "resolucao", label: "Resolução" },
    { value: "instrucao-normativa", label: "Instrução Normativa" },
    { value: "lei-organica", label: "Lei Orgânica Municipal" },
    { value: "loa", label: "LOA (Lei Orçamentária Anual)" },
    { value: "ldo", label: "LDO (Lei de Diretrizes Orçamentárias)" },
    { value: "ppa", label: "PPA (Plano Plurianual)" },
    { value: "ato-administrativo", label: "Ato Administrativo" },
    { value: "outros", label: "Legislação Diversa / Outros Atos" },
];

export type PerfilUsuario =
    | "admin"
    | "controladoria"
    | "legislacao"
    | "lrf_contas"
    | "comunicacao"
    | "financas"
    | "saude"
    | "educacao"
    | "obras"
    | "rh"
    | "esic"
    | "integracao"
    | "editor";

export interface PerfilMeta {
    value: PerfilUsuario;
    label: string;
    shortDesc: string;
    modulesSummary: string;
    badgeClass: string;
    cardAccent: string;
}

export const PERFIS_META: Record<PerfilUsuario, PerfilMeta> = {
    admin: {
        value: "admin",
        label: "Administrador Geral",
        shortDesc: "Acesso total a todos os módulos, usuários e configurações institucionais.",
        modulesSummary: "Todos os módulos, Usuários, Configurações e Símbolos Oficiais",
        badgeClass: "bg-red-50 text-red-700 border-red-200",
        cardAccent: "from-red-500 to-rose-600",
    },
    controladoria: {
        value: "controladoria",
        label: "Controladoria / Revisor PNTP",
        shortDesc: "Supervisão PNTP, aprovações, histórico de alterações e auditoria de dados.",
        modulesSummary: "Checklist PNTP, Histórico, Aprovações, Relatórios e Consulta de Equipe",
        badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
        cardAccent: "from-indigo-500 to-blue-600",
    },
    legislacao: {
        value: "legislacao",
        label: "Legislação, Decretos & Portarias",
        shortDesc: "Inclusão, edição, exclusão e gestão de Leis, Decretos, Portarias, Resoluções e Legislações Diversas.",
        modulesSummary: "Legislação Municipal (Leis, Decretos, Portarias e Atos Diversos), Documentos Oficiais, Editais, Declarações PNTP e Histórico",
        badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
        cardAccent: "from-purple-600 to-indigo-600",
    },
    lrf_contas: {
        value: "lrf_contas",
        label: "Transparência Fiscal, LRF & Contas Públicas",
        shortDesc: "Inclusão de relatórios da LRF (RREO, RGF, Balanços), Contas Públicas (TCE/Câmara), Planejamento e Transparência Fiscal.",
        modulesSummary: "Relatórios Fiscais (LRF/Contas/TCE/Câmara), Receitas, Despesas, Emendas, Renúncias Fiscais, Convênios, Dívida Ativa/Declarações, Documentos e Legislação Orçamentária",
        badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-300",
        cardAccent: "from-emerald-600 to-green-700",
    },
    comunicacao: {
        value: "comunicacao",
        label: "Comunicação & Imprensa",
        shortDesc: "Publicação de notícias, agenda oficial, galerias, secretarias e perguntas frequentes.",
        modulesSummary: "Notícias, Agenda de Eventos, Galeria de Fotos, Secretarias, FAQ, Glossário e Carta",
        badgeClass: "bg-sky-50 text-[#0284c7] border-[#01b0ef]/30",
        cardAccent: "from-[#01b0ef] to-sky-600",
    },
    financas: {
        value: "financas",
        label: "Finanças & Licitações",
        shortDesc: "Gestão orçamentária, fiscal, contratos, licitações, convênios e editais.",
        modulesSummary: "Receitas, Despesas, Licitações, Contratos, Convênios, Diárias, Emendas, Incentivos, LRF, Editais, Documentos e Legislação",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        cardAccent: "from-emerald-500 to-teal-600",
    },
    saude: {
        value: "saude",
        label: "Secretaria de Saúde",
        shortDesc: "Atualização de medicamentos SUS, regulação, indicadores 18.x, unidades e conselhos.",
        modulesSummary: "Medicamentos SUS, Regulação/Filas SUS, Painel Saúde 18.x, Unidades e Conselhos",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
        cardAccent: "from-rose-500 to-pink-600",
    },
    educacao: {
        value: "educacao",
        label: "Secretaria de Educação",
        shortDesc: "Gestão da fila de creches, metas do PME 19.1, escolas e conselhos educacionais.",
        modulesSummary: "Painel Educação/PME 19.1, Fila de Creches 19.2, Unidades e Conselhos",
        badgeClass: "bg-amber-50 text-amber-800 border-[#fdb913]/50",
        cardAccent: "from-[#fdb913] to-amber-600",
    },
    obras: {
        value: "obras",
        label: "Obras, Urbanismo & Frota",
        shortDesc: "Acompanhamento de obras públicas, frota de veículos municipais e equipamentos.",
        modulesSummary: "Obras Públicas, Frota Municipal e Unidades de Atendimento",
        badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
        cardAccent: "from-orange-500 to-amber-600",
    },
    rh: {
        value: "rh",
        label: "Recursos Humanos / Pessoal",
        shortDesc: "Folha de pagamento, servidores, diárias, estagiários, terceirizados e concursos.",
        modulesSummary: "Servidores e Folha, Diárias de Viagem, Estagiários, Terceirizados e Concursos",
        badgeClass: "bg-violet-50 text-violet-700 border-violet-200",
        cardAccent: "from-violet-500 to-purple-600",
    },
    esic: {
        value: "esic",
        label: "e-SIC & Ouvidoria",
        shortDesc: "Atendimento de pedidos LAI, manifestações da Ouvidoria, contatos e pesquisas.",
        modulesSummary: "Atendimento e-SIC (LAI), Ouvidoria, Pesquisas de Satisfação, Fale Conosco, Carta e FAQ",
        badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
        cardAccent: "from-teal-500 to-cyan-600",
    },
    integracao: {
        value: "integracao",
        label: "Operador de Integração (CSV/API)",
        shortDesc: "Carga em lote CSV/API de receitas, despesas, documentos e conferência PNTP.",
        modulesSummary: "Importação CSV/API, Receitas, Despesas, Documentos, Links Externos, PNTP e Histórico",
        badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-200",
        cardAccent: "from-cyan-500 to-sky-600",
    },
    editor: {
        value: "editor",
        label: "Editor de Secretaria (Geral)",
        shortDesc: "Perfil geral restrito às secretarias autorizadas no cadastro do usuário.",
        modulesSummary: "Módulos setoriais filtrados por Secretaria Autorizada",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
        cardAccent: "from-blue-500 to-indigo-600",
    },
};

export const PERFIS_LABELS: Record<PerfilUsuario, string> = Object.fromEntries(
    Object.entries(PERFIS_META).map(([key, meta]) => [key, meta.label])
) as Record<PerfilUsuario, string>;

export const PERFIL_OPTIONS: PerfilMeta[] = [
    PERFIS_META.admin,
    PERFIS_META.controladoria,
    PERFIS_META.legislacao,
    PERFIS_META.lrf_contas,
    PERFIS_META.comunicacao,
    PERFIS_META.financas,
    PERFIS_META.saude,
    PERFIS_META.educacao,
    PERFIS_META.obras,
    PERFIS_META.rh,
    PERFIS_META.esic,
    PERFIS_META.integracao,
    PERFIS_META.editor,
];

export function isValidPerfilUsuario(role?: string | null): role is PerfilUsuario {
    return !!role && Object.prototype.hasOwnProperty.call(PERFIS_META, role);
}

export function getPerfilMeta(role?: string | null): PerfilMeta {
    if (isValidPerfilUsuario(role)) {
        return PERFIS_META[role];
    }
    return PERFIS_META.editor;
}

export interface AdminRouteRule {
    prefix: string;
    roles: readonly PerfilUsuario[];
}

export const ADMIN_ROUTE_RULES: readonly AdminRouteRule[] = [
    // Mais específicos primeiro
    { prefix: "/admin/usuarios/novo", roles: ["admin"] },
    { prefix: "/admin/usuarios/editar", roles: ["admin"] },
    { prefix: "/admin/usuarios", roles: ["admin", "controladoria"] },
    { prefix: "/admin/configuracoes", roles: ["admin"] },

    // Governança, PNTP e Integrações
    { prefix: "/admin/declaracoes", roles: ["admin", "controladoria", "legislacao", "lrf_contas", "financas", "rh", "obras", "saude", "educacao", "esic", "comunicacao", "integracao", "editor"] },
    { prefix: "/admin/pntp", roles: ["admin", "controladoria", "legislacao", "lrf_contas", "financas", "integracao", "editor"] },
    { prefix: "/admin/historico", roles: ["admin", "controladoria", "legislacao", "lrf_contas", "financas", "integracao", "editor"] },
    { prefix: "/admin/importacao", roles: ["admin", "controladoria", "lrf_contas", "financas", "integracao"] },
    { prefix: "/admin/links-externos", roles: ["admin", "controladoria", "lrf_contas", "financas", "integracao"] },

    // Publicações, Legislação, Finanças, Contas Públicas, Contratos e Editais
    { prefix: "/admin/documentos", roles: ["admin", "controladoria", "legislacao", "lrf_contas", "financas", "integracao", "editor"] },
    { prefix: "/admin/editais", roles: ["admin", "controladoria", "legislacao", "lrf_contas", "financas", "editor"] },
    { prefix: "/admin/legislacao", roles: ["admin", "controladoria", "legislacao", "lrf_contas", "financas", "editor"] },
    { prefix: "/admin/receitas", roles: ["admin", "controladoria", "lrf_contas", "financas", "integracao", "editor"] },
    { prefix: "/admin/despesas", roles: ["admin", "controladoria", "lrf_contas", "financas", "integracao", "editor"] },
    { prefix: "/admin/licitacoes", roles: ["admin", "controladoria", "lrf_contas", "financas", "editor"] },
    { prefix: "/admin/contratos", roles: ["admin", "controladoria", "lrf_contas", "financas", "editor"] },
    { prefix: "/admin/convenios", roles: ["admin", "controladoria", "lrf_contas", "financas", "editor"] },
    { prefix: "/admin/emendas-pix", roles: ["admin", "controladoria", "lrf_contas", "financas", "editor"] },
    { prefix: "/admin/emendas", roles: ["admin", "controladoria", "lrf_contas", "financas", "editor"] },
    { prefix: "/admin/incentivos-culturais", roles: ["admin", "controladoria", "lrf_contas", "financas", "editor"] },
    { prefix: "/admin/relatorios-fiscais", roles: ["admin", "controladoria", "lrf_contas", "financas", "editor"] },

    // Recursos Humanos / Pessoal
    { prefix: "/admin/servidores", roles: ["admin", "controladoria", "rh", "editor"] },
    { prefix: "/admin/diarias", roles: ["admin", "controladoria", "lrf_contas", "financas", "rh", "editor"] },
    { prefix: "/admin/estagiarios", roles: ["admin", "controladoria", "rh", "editor"] },
    { prefix: "/admin/terceirizados", roles: ["admin", "controladoria", "rh", "editor"] },
    { prefix: "/admin/concursos", roles: ["admin", "controladoria", "rh", "editor"] },

    // Saúde, Educação, Obras e Infraestrutura
    { prefix: "/admin/saude", roles: ["admin", "controladoria", "saude", "editor"] },
    { prefix: "/admin/medicamentos", roles: ["admin", "controladoria", "saude", "editor"] },
    { prefix: "/admin/central-regulacao", roles: ["admin", "controladoria", "saude", "editor"] },
    { prefix: "/admin/educacao", roles: ["admin", "controladoria", "educacao", "editor"] },
    { prefix: "/admin/creches", roles: ["admin", "controladoria", "educacao", "editor"] },
    { prefix: "/admin/obras", roles: ["admin", "controladoria", "obras", "editor"] },
    { prefix: "/admin/frota", roles: ["admin", "controladoria", "obras", "editor"] },
    { prefix: "/admin/unidades", roles: ["admin", "controladoria", "saude", "educacao", "obras", "editor"] },
    { prefix: "/admin/conselhos", roles: ["admin", "controladoria", "saude", "educacao", "editor"] },

    // Atendimento ao Cidadão (e-SIC & Ouvidoria)
    { prefix: "/admin/esic", roles: ["admin", "controladoria", "esic", "editor"] },
    { prefix: "/admin/ouvidoria", roles: ["admin", "controladoria", "esic", "editor"] },
    { prefix: "/admin/pesquisa-satisfacao", roles: ["admin", "controladoria", "esic", "editor"] },
    { prefix: "/admin/contatos", roles: ["admin", "controladoria", "esic", "comunicacao"] },
    { prefix: "/admin/carta-servicos", roles: ["admin", "controladoria", "esic", "comunicacao", "editor"] },

    // Institucional & Comunicação
    { prefix: "/admin/noticias", roles: ["admin", "controladoria", "comunicacao", "editor"] },
    { prefix: "/admin/agenda", roles: ["admin", "controladoria", "comunicacao", "editor"] },
    { prefix: "/admin/galeria", roles: ["admin", "controladoria", "comunicacao", "editor"] },
    { prefix: "/admin/secretarias", roles: ["admin", "controladoria", "comunicacao", "editor"] },
    { prefix: "/admin/faq", roles: ["admin", "controladoria", "comunicacao", "esic", "editor"] },
    { prefix: "/admin/glossario", roles: ["admin", "controladoria", "comunicacao", "editor"] },
];

export function canAccessAdminPath(role: string | undefined | null, pathname: string): boolean {
    if (!isValidPerfilUsuario(role)) return false;
    if (role === "admin") return true;
    if (pathname === "/admin" || pathname === "/admin/") return true;

    const matchedRule = ADMIN_ROUTE_RULES.find(
        (rule) => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)
    );
    if (!matchedRule) return false;

    return matchedRule.roles.includes(role);
}
