import Link from "next/link";
import {
    Facebook,
    Instagram,
    Youtube,
    Mail,
    Phone,
    MapPin,
    Clock,
    MessageCircle,
    Lock,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buildWhatsAppHref, isValidPublicUrl } from "@/lib/portal-links";

const footerSections = [
    {
        title: "Institucional",
        links: [
            { label: "A Prefeitura", href: "/a-prefeitura" },
            { label: "Prefeito e Vice-Prefeito", href: "/a-prefeitura/prefeito" },
            { label: "Estrutura Administrativa", href: "/a-prefeitura/estrutura" },
            { label: "Secretarias Municipais", href: "/secretarias" },
            { label: "História de São Tomé", href: "/a-prefeitura/historia" },
            { label: "Símbolos Municipais", href: "/municipio/simbolos" },
        ],
    },
    {
        title: "Serviços",
        links: [
            { label: "Carta de Serviços", href: "/transparencia/carta-servicos" },
            { label: "Unidades de Saúde (UBS)", href: "/unidades-de-saude" },
            { label: "Unidades Escolares e Creches", href: "/unidades-escolares" },
            { label: "Assistência Social (CRAS)", href: "/socioassistencial" },
            { label: "Registrar manifestação (Ouvidoria)", href: "/servicos/ouvidoria" },
            { label: "Solicitar informação pública (e-SIC)", href: "/servicos/esic" },
            { label: "Consultar protocolo", href: "/servicos/consulta-protocolo" },
        ],
    },
    {
        title: "Transparência",
        links: [
            { label: "Portal da Transparência", href: "/transparencia" },
            { label: "Despesas Públicas", href: "/transparencia/despesas" },
            { label: "Receitas Públicas", href: "/transparencia/receitas" },
            { label: "Licitações e Editais", href: "/transparencia/licitacoes" },
            { label: "Contratos Administrativos", href: "/transparencia/contratos" },
            { label: "Obras Públicas", href: "/transparencia/obras" },
            { label: "Legislação Municipal", href: "/transparencia/legislacao" },
            { label: "Dados Abertos (CSV/JSON)", href: "/transparencia/dados-abertos" },
        ],
    },
];

const FOOTER_CONFIG_DEFAULTS: Record<string, string> = {
    cnpj: "08.080.210/0001-49",
    endereco_sede: "Praça Antônio Assunção, s/n, Centro",
    horario_funcionamento: "Segunda a Sexta, das 07h às 13h",
    contato_email: "ouvidoria@saotome.rn.gov.br",
    contato_telefone: "(84) 99211-5922",
    municipio_nome: "Prefeitura Municipal de São Tomé",
    contato_whatsapp: "",
    redes_facebook: "",
    redes_instagram: "",
    redes_youtube: "",
};

async function getFooterConfigs() {
    const map = new Map<string, string>();
    try {
        const rows = await prisma.configuracao.findMany({
            where: { chave: { in: Object.keys(FOOTER_CONFIG_DEFAULTS) } },
            select: { chave: true, valor: true },
        });
        for (const row of rows) {
            if (row.valor !== null && row.valor !== undefined) {
                map.set(row.chave, row.valor.trim());
            }
        }
    } catch {
        // Fallback seguro para padrões institucionais
    }
    return (chave: keyof typeof FOOTER_CONFIG_DEFAULTS) => {
        const val = map.get(chave);
        if (val !== undefined && val !== "") return val;
        return FOOTER_CONFIG_DEFAULTS[chave];
    };
}

export default async function Footer() {
    const cfg = await getFooterConfigs();
    const cnpj = cfg("cnpj");
    const enderecoRaw = cfg("endereco_sede");
    const endereco = enderecoRaw.toLowerCase().includes("são tomé")
        ? enderecoRaw
        : `${enderecoRaw}, São Tomé/RN – CEP 59.400-000`;
    const horarioRaw = cfg("horario_funcionamento");
    const horario = horarioRaw.toLowerCase().includes("segunda")
        ? horarioRaw
        : `Segunda a Sexta, ${horarioRaw}`;
    const email = cfg("contato_email");
    const telefone = cfg("contato_telefone");
    const razaoSocialRaw = cfg("municipio_nome");
    const razaoSocial = razaoSocialRaw.toLowerCase().includes("prefeitura")
        ? razaoSocialRaw
        : `Prefeitura Municipal de ${razaoSocialRaw}`;

    const whatsappConfirmedHref = buildWhatsAppHref(cfg("contato_whatsapp"));
    const facebook = cfg("redes_facebook");
    const instagram = cfg("redes_instagram");
    const youtube = cfg("redes_youtube");

    // Filtra estritamente canais confirmados e válidos (nunca exibe "#" ou links vazios)
    const confirmedSocialLinks = [
        ...(isValidPublicUrl(facebook)
            ? [{ Icon: Facebook, href: facebook, label: "Facebook oficial da Prefeitura" }]
            : []),
        ...(isValidPublicUrl(instagram)
            ? [{ Icon: Instagram, href: instagram, label: "Instagram oficial da Prefeitura" }]
            : []),
        ...(isValidPublicUrl(youtube)
            ? [{ Icon: Youtube, href: youtube, label: "YouTube oficial da Prefeitura" }]
            : []),
        ...(whatsappConfirmedHref
            ? [{ Icon: MessageCircle, href: whatsappConfirmedHref, label: "WhatsApp oficial da Prefeitura" }]
            : []),
    ];

    return (
        <footer className="bg-[#004666] text-white relative overflow-hidden" role="contentinfo">
            <div className="h-1.5 w-full heraldic-stripe" />

            <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-14 relative z-10">
                {/* Identidade Institucional no Topo do Rodapé */}
                <div className="pb-10 mb-10 border-b border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <Link
                        href="/"
                        className="flex items-center gap-3.5 group w-fit"
                        aria-label="Prefeitura Municipal de São Tomé — Página Inicial"
                    >
                        <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-xs">
                            <img
                                src="/brasao_oficial.png"
                                alt="Brasão Oficial de São Tomé"
                                width={40}
                                height={38}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div>
                            <span className="font-heading text-lg sm:text-xl font-extrabold text-white block leading-tight">
                                {razaoSocial}
                            </span>
                            <span className="text-xs text-sky-200 font-semibold block mt-0.5">
                                Estado do Rio Grande do Norte • CNPJ: {cnpj} • IBGE: 2412005
                            </span>
                        </div>
                    </Link>

                    {confirmedSocialLinks.length > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-sky-100">
                                Canais oficiais:
                            </span>
                            <div className="flex items-center gap-2">
                                {confirmedSocialLinks.map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.label}
                                        title={social.label}
                                        className="w-10 h-10 bg-white/10 hover:bg-[#fdb913] border border-white/20 rounded-xl flex items-center justify-center transition-colors text-white hover:text-slate-900"
                                    >
                                        <social.Icon size={17} aria-hidden="true" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Grade em 4 Colunas: Institucional, Serviços, Transparência e Contato */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">
                    {footerSections.map((section) => (
                        <div key={section.title} className="lg:col-span-3">
                            <h2 className="font-heading text-white font-extrabold text-sm uppercase tracking-wider mb-4 pb-2.5 border-b border-white/15 flex items-center gap-2">
                                <span
                                    className="w-1.5 h-4 rounded-full bg-[#fdb913]"
                                    aria-hidden="true"
                                />
                                <span>{section.title}</span>
                            </h2>
                            <ul className="space-y-2.5" role="list">
                                {section.links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-white/95 hover:text-[#fdb913] text-sm font-medium transition-colors inline-block"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* 4ª Coluna: Contato */}
                    <div className="lg:col-span-3">
                        <h2 className="font-heading text-white font-extrabold text-sm uppercase tracking-wider mb-4 pb-2.5 border-b border-white/15 flex items-center gap-2">
                            <span
                                className="w-1.5 h-4 rounded-full bg-[#fdb913]"
                                aria-hidden="true"
                            />
                            <span>Contato</span>
                        </h2>

                        <div className="space-y-3.5 text-sm">
                            <div className="flex items-start gap-3 text-white">
                                <div className="w-8 h-8 rounded-lg bg-[#fdb913] text-slate-900 flex items-center justify-center shrink-0 mt-0.5">
                                    <MapPin size={15} aria-hidden="true" />
                                </div>
                                <div>
                                    <span className="block text-[11px] font-bold uppercase tracking-wider text-sky-200">
                                        Endereço da Sede
                                    </span>
                                    <span className="leading-snug text-white font-medium">
                                        {endereco}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 text-white">
                                <div className="w-8 h-8 rounded-lg bg-[#fdb913] text-slate-900 flex items-center justify-center shrink-0 mt-0.5">
                                    <Clock size={15} aria-hidden="true" />
                                </div>
                                <div>
                                    <span className="block text-[11px] font-bold uppercase tracking-wider text-sky-200">
                                        Horário de Atendimento
                                    </span>
                                    <span className="text-white font-medium">{horario}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 text-white">
                                <div className="w-8 h-8 rounded-lg bg-[#fdb913] text-slate-900 flex items-center justify-center shrink-0 mt-0.5">
                                    <Phone size={15} aria-hidden="true" />
                                </div>
                                <div>
                                    <span className="block text-[11px] font-bold uppercase tracking-wider text-sky-200">
                                        Telefone
                                    </span>
                                    <a
                                        href={`tel:${telefone.replace(/\D/g, "")}`}
                                        className="font-mono font-bold text-white hover:text-[#fdb913] transition-colors"
                                    >
                                        {telefone}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 text-white">
                                <div className="w-8 h-8 rounded-lg bg-[#fdb913] text-slate-900 flex items-center justify-center shrink-0 mt-0.5">
                                    <Mail size={15} aria-hidden="true" />
                                </div>
                                <div className="min-w-0">
                                    <span className="block text-[11px] font-bold uppercase tracking-wider text-sky-200">
                                        E-mail Oficial
                                    </span>
                                    <a
                                        href={`mailto:${email}`}
                                        className="text-white hover:text-[#fdb913] hover:underline transition-colors font-medium break-all"
                                    >
                                        {email}
                                    </a>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Link
                                    href="/contato"
                                    className="inline-flex items-center gap-2 text-xs font-bold text-[#fdb913] hover:underline"
                                >
                                    <span>Abrir página de contato e atendimento →</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barra Inferior Única: Acessibilidade, Privacidade, Mapa do Site e Acesso Restrito */}
                <div className="mt-12 pt-6 border-t border-white/15 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-sky-100 text-center md:text-left">
                        © {new Date().getFullYear()} {razaoSocial} – RN. Em conformidade com a LAI (Lei nº 12.527/2011), LRF (LC nº 101/2000) e LGPD (Lei nº 13.709/2018).
                    </p>

                    <nav
                        aria-label="Links institucionais e acesso restrito"
                        className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-bold text-white"
                    >
                        <Link
                            href="/transparencia/acessibilidade"
                            className="hover:text-[#fdb913] transition-colors"
                        >
                            Acessibilidade
                        </Link>
                        <Link
                            href="/privacidade"
                            className="hover:text-[#fdb913] transition-colors"
                        >
                            Privacidade
                        </Link>
                        <Link
                            href="/mapa-do-site"
                            className="hover:text-[#fdb913] transition-colors"
                        >
                            Mapa do Site
                        </Link>
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#fdb913] hover:bg-[#e5a50a] text-slate-900 font-bold rounded-xl transition-colors shadow-xs"
                        >
                            <Lock size={13} aria-hidden="true" />
                            <span>Acesso restrito</span>
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
