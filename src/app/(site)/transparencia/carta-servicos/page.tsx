import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import { FaBook } from "react-icons/fa";
import ExportButtons from "@/components/transparencia/ExportButtons";
import CartaServicosClient from "@/components/transparencia/CartaServicosClient";
import { isValidPublicUrl } from "@/lib/portal-links";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
    title: "Carta de Serviços ao Cidadão | Prefeitura de São Tomé",
    description:
        "Catálogo oficial de serviços públicos prestados pela Prefeitura Municipal de São Tomé/RN ao cidadão (Lei Federal nº 13.460/2017).",
};

function sanitizeServiceLink(url?: string | null): string {
    if (!isValidPublicUrl(url)) return "";
    const trimmed = String(url).trim();
    if (trimmed.includes("ouvidoria.saotome.rn.gov.br")) return "/servicos/ouvidoria";
    if (trimmed.includes("transparencia.saotome.rn.gov.br/esic")) return "/servicos/esic";
    if (trimmed.includes("transparencia.saotome.rn.gov.br/legislacao")) return "/transparencia/legislacao";
    if (trimmed.includes("transparencia.saotome.rn.gov.br")) return "/transparencia";
    if (trimmed.includes("saotome.rn.gov.br/portal-contribuinte")) {
        return "https://www.tinus.com.br/csp/SAOTOME/portal/index.csp?398ePKh0101MOVZE78365xmEw9088og=xbCN41Noq203lgm19139rlZlh569ZevDU2955S1071625bJbX145";
    }
    if (trimmed.includes("saotome.rn.gov.br/portal-servidor")) {
        return "https://app.topsolutionsrn.com.br/ContraCheque/pmsaotome/";
    }
    return trimmed;
}

export default async function CartaServicosTransparencyPage() {
    const rawServicos = await prisma.servicoCarta.findMany({
        where: { ativo: true },
        orderBy: [{ ordem: "asc" }, { categoria: "asc" }, { nome: "asc" }],
    });

    const servicos = rawServicos.map((s) => ({
        ...s,
        status: s.statusServico || (s.ativo ? "ATIVO" : "INATIVO"),
        prioridadesAtendimento: s.prioridades || "Prioridades legais (Lei Federal nº 10.048/2000)",
        linkAcesso: sanitizeServiceLink(s.linkAcesso),
    }));

    return (
        <div className="min-h-screen bg-[#f4fbff]">
            <PageHeader
                title="Carta de Serviços ao Cidadão"
                subtitle="Catálogo oficial para encontrar serviços públicos, documentos exigidos, locais de atendimento, horários e canais digitais."
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Serviços", href: "/transparencia/carta-servicos" },
                ]}
            />

            <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-12">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                    <h2 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">
                        Serviços Públicos Disponíveis ({servicos.length})
                    </h2>
                    <ExportButtons data={servicos} filename="carta_servicos_sao_tome" />
                </div>

                {/* Orientação Lei Federal nº 13.460/2017 */}
                <div className="mb-10 bg-white rounded-3xl p-6 sm:p-8 shadow-civic-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="w-16 h-16 bg-[#e8f6fd] text-[#00557d] rounded-2xl flex items-center justify-center shrink-0">
                        <FaBook size={28} aria-hidden="true" />
                    </div>
                    <div>
                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-1.5">
                            Carta de Serviços ao Usuário do Serviço Público
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Consulte abaixo os serviços prestados pela Prefeitura de São Tomé, os requisitos, etapas, prazos estimados e locais de atendimento presencial ou digital, nos termos da Lei Federal nº 13.460/2017.
                        </p>
                    </div>
                </div>

                {/* Componente Interativo com Filtros e Modal */}
                <CartaServicosClient servicos={JSON.parse(JSON.stringify(servicos))} />
            </div>
        </div>
    );
}
