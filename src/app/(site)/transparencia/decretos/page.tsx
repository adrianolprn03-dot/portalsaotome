import type { Metadata } from "next";
import LegislacaoPageShell from "@/components/transparencia/LegislacaoPageShell";

export const revalidate = 300;

export const metadata: Metadata = {
    title: "Decretos do Executivo | Prefeitura de São Tomé – RN",
    description: "Consulta aos Decretos do Poder Executivo da Prefeitura de São Tomé – RN.",
};

export default async function DecretosPage() {
    return (
        <LegislacaoPageShell
            initialTipo="decreto"
            hideTipoFilter={true}
            pageTitle="Decretos do Executivo"
            pageSubtitle="Consulta aos decretos e atos normativos emitidos pelo Chefe do Poder Executivo Municipal."
            breadcrumbLabel="Decretos"
            iconKey="gavel"
            yearSubtitle="Decretos Municipais do Executivo"
        />
    );
}
