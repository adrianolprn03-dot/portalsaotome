import type { Metadata } from "next";
import PlanoSaudeClientPage from "@/components/transparencia/PlanoSaudeClientPage";

export const revalidate = 300;

export const metadata: Metadata = {
    title: "Programação Anual de Saúde (PAS) | Prefeitura de São Tomé – RN",
    description:
        "Programação Anual de Saúde (PAS) com metas, ações e alocação de recursos do SUS no município de São Tomé – RN.",
};

export default function ProgramacaoAnualSaudePage() {
    return (
        <PlanoSaudeClientPage
            categoriaInicial="pas"
            pageTitle="Programação Anual de Saúde (PAS)"
            pageSubtitle="Instrumento de planejamento anual de metas, ações e alocação de recursos da Saúde pública municipal."
            breadcrumbLabel="Programação Anual de Saúde"
        />
    );
}
