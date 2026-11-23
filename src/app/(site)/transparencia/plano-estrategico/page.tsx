import type { Metadata } from "next";
import ListaDocumentosClient from "@/components/ListaDocumentosClient";

export const metadata: Metadata = {
    title: "Plano Estratégico | Prefeitura de São Tomé – RN",
    description: "Plano Estratégico Institucional do Município.",
};

export default function PlanoEstrategicoPage() {
    return (
        <ListaDocumentosClient
            tipoDocumento="plano-estrategico"
            pageTitle="Plano Estratégico Institucional"
            pageSubtitle="Diretrizes, metas e planejamento estratégico de longo prazo da gestão municipal."
            breadcrumbLabel="Plano Estratégico"
            yearSubtitle="Planejamento Estratégico Municipal"
            categoryTitle="Planos Estratégicos Institucionais"
            categorySubtitle="Instrumentos orientadores de gestão e resultados"
            tituloVazio="Nenhum Plano Estratégico publicado"
        />
    );
}
