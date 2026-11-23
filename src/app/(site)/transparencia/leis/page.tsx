import type { Metadata } from "next";
import LegislacaoPageShell from "@/components/transparencia/LegislacaoPageShell";

export const revalidate = 300;

export const metadata: Metadata = {
    title: "Leis Municipais | Prefeitura de São Tomé – RN",
    description:
        "Consulta às Leis Municipais e legislação sancionada da Prefeitura de São Tomé – RN.",
};

export default async function LeisPage() {
    return (
        <LegislacaoPageShell
            initialTipo="lei"
            hideTipoFilter={true}
            pageTitle="Leis Municipais"
            pageSubtitle="Acesso integral à legislação aprovada pelo Poder Legislativo e sancionada pelo Executivo."
            breadcrumbLabel="Leis"
            iconKey="gavel"
            yearSubtitle="Leis Ordinárias e Complementares"
        />
    );
}
