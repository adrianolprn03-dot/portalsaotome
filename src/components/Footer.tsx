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
    ShieldCheck,
    Headset,
    ArrowUpRight,
    ChevronRight,
    Lock,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

const footerLinks = [
    {
        title: "Institucional",
        links: [
            { label: "História da Cidade", href: "/a-prefeitura/historia" },
            { label: "Prefeito e Vice", href: "/a-prefeitura/prefeito" },
            { label: "Secretarias Municipais", href: "/secretarias" },
            { label: "Estrutura Administrativa", href: "/a-prefeitura/estrutura" },
            { label: "Agenda do Executivo", href: "/a-prefeitura/agenda" },
            { label: "Símbolos Municipais", href: "/municipio/simbolos" },
        ],
    },
    {
        title: "Transparência Ativa",
        links: [
            { label: "Portal da Transparência", href: "/transparencia" },
            { label: "Receitas Públicas", href: "/transparencia/receitas" },
            { label: "Despesas Públicas", href: "/transparencia/despesas" },
            { label: "Licitações e Editais", href: "/transparencia/licitacoes" },
            { label: "Contratos Administrativos", href: "/transparencia/contratos" },
            { label: "Obras Públicas", href: "/transparencia/obras" },
            { label: "Servidores e Folha", href: "/transparencia/servidores" },
            { label: "Legislação Municipal", href: "/transparencia/legislacao" },
            { label: "Dados Abertos (CSV/JSON)", href: "/transparencia/dados-abertos" },
            { label: "Radar PNTP 2026", href: "/transparencia/radar" },
        ],
    },
    {
        title: "Cidadão & Serviços",
        links: [
            { label: "Ouvidoria Municipal", href: "/servicos/ouvidoria" },
            { label: "e-SIC (Acesso à Informação)", href: "/servicos/esic" },
            { label: "Carta de Serviços", href: "/transparencia/carta-servicos" },
            { label: "Unidades de Saúde e SUS", href: "/unidades-de-saude" },
            { label: "Unidades Escolares", href: "/unidades-escolares" },
            { label: "Rede Socioassistencial", href: "/socioassistencial" },
            { label: "FAQ / Perguntas Frequentes", href: "/transparencia/faq" },
            { label: "Acessibilidade Digital", href: "/transparencia/acessibilidade" },
            { label: "Política de Privacidade (LGPD)", href: "/privacidade" },
            { label: "Mapa do Site", href: "/mapa-do-site" },
        ],
    },
];

async function getConfig(chave: string, padrao: string) {
    try {
        const config = await prisma.configuracao.findUnique({ where: { chave } });
        return config?.valor || padrao;
    } catch {
        return padrao;
    }
}

export default async function Footer() {
    const cnpj = await getConfig("cnpj", "08.080.210/0001-49");
    const endereco = await getConfig(
        "endereco_sede",
        "Praça Antônio Assunção, s/n, Centro, São Tomé/RN – CEP 59.400-000"
    );
    const email = await getConfig("contato_email", "ouvidoria@saotome.rn.gov.br");
    const telefone = await getConfig("contato_telefone", "(84) 99211-5922");
    const razaoSocial = await getConfig("municipio_nome", "Prefeitura Municipal de São Tomé");
    const whatsapp = await getConfig("contato_whatsapp", "");
    const brasao = await getConfig("simbolo_brasao", "/logo_v2_white.png");
    const facebook = await getConfig("redes_facebook", "#");
    const instagram = await getConfig("redes_instagram", "#");
    const youtube = await getConfig("redes_youtube", "#");

    const whatsappHref = whatsapp
        ? `https://wa.me/55${whatsapp.replace(/\D/g, "")}`
        : "#";

    const socialLinks = [
        { Icon: Facebook, href: facebook, label: "Facebook" },
        { Icon: Instagram, href: instagram, label: "Instagram" },
        { Icon: Youtube, href: youtube, label: "YouTube" },
        { Icon: MessageCircle, href: whatsappHref, label: "WhatsApp" },
    ];

    return (
        <footer className="bg-[#01b0ef] text-white relative overflow-hidden" role="contentinfo">
            {/* Top Luminous CTA Strip */}
            <div className="bg-[#eefaff] border-y-4 border-[#fdb913] relative">
                <div className="max-w-[1280px] mx-auto px-6 py-10 md:py-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div className="space-y-2 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fdb913]/20 border border-[#fdb913]/50 text-xs font-bold uppercase tracking-wider text-slate-900">
                            <span className="w-2 h-2 rounded-full bg-[#fdb913]" />
                            <span>Atendimento Oficial ao Cidadão</span>
                        </div>
                        <h3 className="font-heading text-slate-900 font-extrabold text-2xl md:text-3xl tracking-tight">
                            Precisa solicitar informações ou registrar uma manifestação?
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Utilize os canais digitais regulamentados pela Lei de Acesso à Informação (Lei nº 12.527/2011) e pelo Código de Defesa do Usuário do Serviço Público.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3.5 w-full lg:w-auto">
                        <Link
                            href="/servicos/ouvidoria"
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2.5 bg-[#fdb913] hover:brightness-105 text-slate-900 font-bold px-6 py-3.5 rounded-xl transition-all text-sm shadow-civic-sm"
                        >
                            <Headset size={17} />
                            <span>Ouvidoria Municipal</span>
                        </Link>
                        <Link
                            href="/servicos/esic"
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2.5 bg-[#01b0ef] hover:bg-[#0098d4] text-white font-bold px-6 py-3.5 rounded-xl transition-all text-sm shadow-civic-sm"
                        >
                            <ShieldCheck size={17} className="text-[#fdb913]" />
                            <span>Pedido e-SIC (LAI)</span>
                        </Link>
                        <Link
                            href="/transparencia"
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 border-2 border-[#01b0ef] bg-white hover:bg-[#01b0ef] text-[#01b0ef] hover:text-white font-bold px-6 py-3.5 rounded-xl transition-all text-sm"
                        >
                            <span>Portal da Transparência</span>
                            <ArrowUpRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Architectural Grid */}
            <div className="max-w-[1280px] mx-auto px-6 py-16 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10">
                    {/* Institutional Identity Column (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center gap-4">
                            <img
                                src={brasao}
                                alt="Brasão Oficial de São Tomé"
                                className="h-14 md:h-16 w-auto object-contain max-w-[190px] drop-shadow-sm"
                            />
                        </div>

                        <p className="text-white/90 text-sm leading-relaxed">
                            Gestão pública comprometida com a transparência ativa, eficiência administrativa e qualidade de vida para todos os cidadãos são-tomeenses.
                        </p>

                        <div className="space-y-3 text-sm pt-1">
                            <div className="flex items-start gap-3 text-white">
                                <div className="w-8 h-8 rounded-lg bg-[#fdb913] text-slate-900 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                                    <MapPin size={15} />
                                </div>
                                <span className="leading-snug text-xs sm:text-sm font-medium">{endereco}</span>
                            </div>
                            <div className="flex items-center gap-3 text-white">
                                <div className="w-8 h-8 rounded-lg bg-[#fdb913] text-slate-900 flex items-center justify-center shrink-0 shadow-xs">
                                    <Clock size={15} />
                                </div>
                                <span className="text-xs sm:text-sm font-medium">
                                    Atendimento: Segunda a Sexta, das 07h às 13h
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-white">
                                <div className="w-8 h-8 rounded-lg bg-[#fdb913] text-slate-900 flex items-center justify-center shrink-0 shadow-xs">
                                    <Phone size={15} />
                                </div>
                                <span className="font-mono text-xs sm:text-sm font-bold">{telefone}</span>
                            </div>
                            <div className="flex items-center gap-3 text-white">
                                <div className="w-8 h-8 rounded-lg bg-[#fdb913] text-slate-900 flex items-center justify-center shrink-0 shadow-xs">
                                    <Mail size={15} />
                                </div>
                                <a
                                    href={`mailto:${email}`}
                                    className="hover:underline transition-colors text-xs sm:text-sm font-medium break-all"
                                >
                                    {email}
                                </a>
                            </div>
                        </div>

                        {/* Metadata Pills */}
                        <div className="flex flex-wrap gap-2 pt-2">
                            <span className="px-3 py-1 rounded-lg bg-white/20 border border-white/30 text-[11px] font-mono font-bold text-white">
                                CNPJ: {cnpj}
                            </span>
                            <span className="px-3 py-1 rounded-lg bg-white/20 border border-white/30 text-[11px] font-mono font-bold text-white">
                                IBGE: 2412005
                            </span>
                        </div>
                    </div>

                    {/* Navigation Columns (8 cols) */}
                    <div className="lg:col-span-8">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                            {footerLinks.map((section) => (
                                <div key={section.title}>
                                    <h4 className="font-heading text-white font-extrabold text-sm tracking-wide mb-5 pb-3 border-b border-white/25 flex items-center gap-2">
                                        <span className="w-1.5 h-4 rounded-full bg-[#fdb913]" />
                                        {section.title}
                                    </h4>
                                    <ul className="space-y-2.5">
                                        {section.links.map((link) => (
                                            <li key={link.href}>
                                                <Link
                                                    href={link.href}
                                                    className="group flex items-center gap-1.5 text-white/90 text-[13px] font-medium hover:text-[#fdb913] transition-colors"
                                                >
                                                    <ChevronRight
                                                        size={13}
                                                        className="text-[#fdb913] opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all"
                                                    />
                                                    <span>{link.label}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Social & Quick Bottom Bar */}
                <div className="mt-14 pt-8 border-t border-white/25 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-white/90">Canais Oficiais:</span>
                        <div className="flex gap-2.5">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target={social.href !== "#" ? "_blank" : undefined}
                                    rel={social.href !== "#" ? "noopener noreferrer" : undefined}
                                    aria-label={social.label}
                                    title={social.label}
                                    className={`w-9 h-9 bg-white/15 hover:bg-[#fdb913] border border-white/25 rounded-xl flex items-center justify-center transition-all text-white hover:text-slate-900 ${
                                        social.href === "#" ? "opacity-40 cursor-default pointer-events-none" : ""
                                    }`}
                                >
                                    <social.Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-white/95">
                        <Link href="/mapa-do-site" className="hover:text-[#fdb913] transition-colors">
                            Mapa do Site
                        </Link>
                        <Link href="/privacidade" className="hover:text-[#fdb913] transition-colors">
                            Privacidade e LGPD
                        </Link>
                        <Link
                            href="/transparencia/acessibilidade"
                            className="hover:text-[#fdb913] transition-colors"
                        >
                            Acessibilidade (e-MAG)
                        </Link>
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#fdb913] hover:brightness-105 text-slate-900 font-bold rounded-xl transition-all shadow-sm"
                        >
                            <Lock size={13} />
                            <span>Acesso Restrito</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Legal & LGPD Bottom Strip */}
            <div className="bg-[#0096ce] py-4 px-6 border-t border-white/20">
                <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/95 text-center sm:text-left font-medium">
                    <p>
                        © {new Date().getFullYear()} {razaoSocial} – RN. Todos os direitos reservados.
                    </p>
                    <p>
                        Em conformidade com a LAI (Lei nº 12.527/2011), LRF (LC nº 101/2000) e LGPD (Lei nº 13.709/2018).
                    </p>
                </div>
            </div>
        </footer>
    );
}
