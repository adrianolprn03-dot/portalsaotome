import type { Metadata } from "next";
import LegislacaoPageShell from "@/components/transparencia/LegislacaoPageShell";

export const revalidate = 300;

export const metadata: Metadata = {
    title: "Lei Orgânica do Município | Prefeitura de São Tomé – RN",
    description:
        "Consulta ao texto oficial da Lei Orgânica Municipal e suas emendas da Prefeitura de São Tomé – RN.",
};

export default async function LeiOrganicaPage() {
    return (
        <LegislacaoPageShell
            initialTipo="lei-organica"
            hideTipoFilter={true}
            pageTitle="Lei Orgânica do Município"
            pageSubtitle="Norma fundamental que rege a organização política, administrativa e financeira de São Tomé/RN."
            breadcrumbLabel="Lei Orgânica"
            iconKey="scroll"
            yearSubtitle="Lei Orgânica e Emendas"
        />
    );
}
