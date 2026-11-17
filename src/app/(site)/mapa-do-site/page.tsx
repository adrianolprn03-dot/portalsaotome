"use client";
import Link from "next/link";
import {
    Network,
    ChevronRight,
    ShieldCheck,
    Landmark,
    Newspaper,
    Headset,
    Accessibility,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";

const sitemapData = [
    {
        secao: "Institucional",
        icon: Landmark,
        links: [
            { label: "A Prefeitura", href: "/a-prefeitura" },
            { label: "Prefeito e Vice-Prefeito", href: "/a-prefeitura/prefeito" },
            { label: "Secretarias Municipais", href: "/secretarias" },
            { label: "Estrutura Administrativa", href: "/a-prefeitura/estrutura" },
            { label: "História do Município", href: "/a-prefeitura/historia" },
            { label: "Símbolos Oficiais", href: "/municipio/simbolos" },
        ],
    },
    {
        secao: "Transparência Pública",
        icon: ShieldCheck,
        links: [
            { label: "Central da Transparência", href: "/transparencia" },
            { label: "Receitas Públicas", href: "/transparencia/receitas" },
            { label: "Despesas Públicas", href: "/transparencia/despesas" },
            { label: "Licitações e Editais", href: "/transparencia/licitacoes" },
            { label: "Contratos Administrativos", href: "/transparencia/contratos" },
            { label: "Obras Públicas", href: "/transparencia/obras" },
            { label: "Diárias e Passagens", href: "/transparencia/diarias" },
            { label: "Quadro de Servidores", href: "/transparencia/servidores" },
            { label: "Legislação Municipal", href: "/transparencia/legislacao" },
            { label: "Dados Abertos (CSV/JSON)", href: "/transparencia/dados-abertos" },
            { label: "Relatórios da LRF (RREO e RGF)", href: "/transparencia/lrf" },
            { label: "Ordem Cronológica de Pagamentos", href: "/transparencia/ordem-cronologica" },
        ],
    },
    {
        secao: "Cidadão, Ouvidoria & LAI",
        icon: Headset,
        links: [
            { label: "e-SIC (Pedido de Informação)", href: "/servicos/esic" },
            { label: "Ouvidoria Municipal", href: "/servicos/ouvidoria" },
            { label: "Consultar Protocolo", href: "/servicos/consulta-protocolo" },
            { label: "Carta de Serviços ao Cidadão", href: "/transparencia/carta-servicos" },
            { label: "FAQ (Perguntas Frequentes)", href: "/transparencia/faq" },
            { label: "Glossário de Termos", href: "/transparencia/glossario" },
        ],
    },
    {
        secao: "Serviços & Informativos",
        icon: Newspaper,
        links: [
            { label: "Notícias Municipais", href: "/noticias" },
            { label: "Agenda do Executivo", href: "/a-prefeitura/agenda" },
            { label: "Galeria de Fotos", href: "/galeria" },
            { label: "Unidades de Saúde (UBS)", href: "/unidades-de-saude" },
            { label: "Unidades Escolares", href: "/unidades-escolares" },
            { label: "Fale Conosco / Contatos", href: "/contato" },
        ],
    },
];

export default function MapaDoSitePage() {
    return (
        <div className="min-h-screen bg-[#F6F9FC]">
            <PageHeader
                title="Mapa do Site"
                subtitle="Índice completo para navegação estruturada por todas as seções do portal institucional de São Tomé."
                variant="premium"
                icon={<Network className="w-8 h-8" />}
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Mapa do Site" },
                ]}
            />

            <div className="max-w-[1240px] mx-auto px-6 py-14 pb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                    {sitemapData.map((secao) => (
                        <div
                            key={secao.secao}
                            className="bg-white rounded-3xl border border-slate-200/80 shadow-civic-sm p-8"
                        >
                            <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
                                <div className="w-11 h-11 bg-primary-50 border border-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                                    <secao.icon size={22} />
                                </div>
                                <h2 className="font-heading text-xl font-extrabold text-[#071E3D]">
                                    {secao.secao}
                                </h2>
                            </div>

                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {secao.links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="flex items-center justify-between px-4 py-3 bg-[#F6F9FC] rounded-xl border border-slate-200/60 hover:border-primary-300 hover:bg-primary-50/60 text-slate-700 hover:text-primary-700 transition-all group"
                                        >
                                            <span className="text-xs font-semibold">
                                                {link.label}
                                            </span>
                                            <ChevronRight
                                                size={14}
                                                className="text-slate-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all shrink-0"
                                            />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 bg-[#071E3D] rounded-3xl p-8 md:p-10 text-center text-white shadow-civic-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 heraldic-stripe" />
                    <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 text-secondary-400 flex items-center justify-center mx-auto mb-4">
                        <Accessibility size={24} />
                    </div>
                    <h3 className="font-heading text-xl font-extrabold mb-2">
                        Compromisso com a Acessibilidade Digital (e-MAG)
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed max-w-2xl mx-auto mb-6">
                        Utilize a barra superior de acessibilidade para alternar o alto contraste, redimensionar fontes ou navegar por atalhos de teclado.
                    </p>
                    <Link
                        href="/transparencia/acessibilidade"
                        className="btn-secondary"
                    >
                        <span>Declaração de Acessibilidade</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
