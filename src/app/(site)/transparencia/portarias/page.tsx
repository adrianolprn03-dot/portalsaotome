import type { Metadata } from "next";
import LegislacaoPageShell from "@/components/transparencia/LegislacaoPageShell";

export const revalidate = 300;

export const metadata: Metadata = {
    title: "Portarias Municipais | Prefeitura de São Tomé – RN",
    description: "Consulta às Portarias da Prefeitura de São Tomé – RN.",
};

export default async function PortariasPage() {
    return (
        <LegislacaoPageShell
            initialTipo="portaria"
            hideTipoFilter={true}
            pageTitle="Portarias Municipais"
            pageSubtitle="Consulta aos atos administrativos e portarias oficiais do Poder Executivo."
            breadcrumbLabel="Portarias"
            iconKey="file-check"
            yearSubtitle="Portarias Administrativas"
        />
    );
}
