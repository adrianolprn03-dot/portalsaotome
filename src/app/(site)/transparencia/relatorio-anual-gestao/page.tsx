import type { Metadata } from "next";
import PlanoSaudeClientPage from "@/components/transparencia/PlanoSaudeClientPage";

export const revalidate = 300;

export const metadata: Metadata = {
    title: "Relatório Anual de Gestão (RAG) | Prefeitura de São Tomé – RN",
    description:
        "Relatório Anual de Gestão (RAG) da Saúde do município de São Tomé – RN.",
};

export default function RelatorioAnualGestaoPage() {
    return (
        <PlanoSaudeClientPage
            categoriaInicial="rag"
            pageTitle="Relatório Anual de Gestão (RAG)"
            pageSubtitle="Prestação de contas anual comprobatória da execução da Programação Anual de Saúde e parecer do CMS."
            breadcrumbLabel="Relatório Anual de Gestão"
        />
    );
}
