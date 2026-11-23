import type { Metadata } from "next";
import PlanoSaudeClientPage from "@/components/transparencia/PlanoSaudeClientPage";

export const revalidate = 300;

export const metadata: Metadata = {
    title: "Plano Municipal de Saúde | Prefeitura de São Tomé – RN",
    description:
        "Plano Municipal de Saúde (PMS), Programação Anual (PAS), Relatório Anual de Gestão (RAG) e Relatórios Quadrimestrais (RDQA).",
};

export default function PlanoSaudePage() {
    return (
        <PlanoSaudeClientPage
            pageTitle="Plano Municipal de Saúde"
            pageSubtitle="Planejamento quadrienal com diretrizes, metas e prestações de contas da saúde municipal (Lei nº 8.080/90 e LC 141/2012)."
            breadcrumbLabel="Plano de Saúde"
        />
    );
}
