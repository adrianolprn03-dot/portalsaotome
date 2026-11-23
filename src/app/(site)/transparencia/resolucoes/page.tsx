import type { Metadata } from "next";
import LegislacaoPageShell from "@/components/transparencia/LegislacaoPageShell";

export const revalidate = 300;

export const metadata: Metadata = {
    title: "Resoluções Municipais | Prefeitura de São Tomé – RN",
    description: "Consulta às Resoluções e deliberações oficiais da Prefeitura de São Tomé – RN.",
};

export default async function ResolucoesPage() {
    return (
        <LegislacaoPageShell
            initialTipo="resolucao"
            hideTipoFilter={true}
            pageTitle="Resoluções Municipais"
            pageSubtitle="Deliberações normativas, instruções e resoluções emitidas pelos órgãos e conselhos municipais."
            breadcrumbLabel="Resoluções"
            iconKey="file-lines"
            yearSubtitle="Resoluções e Atos Deliberativos"
        />
    );
}
