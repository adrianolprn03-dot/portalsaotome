import type { Metadata } from "next";
import ListaDocumentosClient from "@/components/ListaDocumentosClient";

export const metadata: Metadata = {
    title: "Associações e Parcerias | Prefeitura de São Tomé – RN",
    description: "Relação de associações municipais parceiras da prefeitura.",
};

export default function AssociacoesPage() {
    return (
        <ListaDocumentosClient
            tipoDocumento="associacoes"
            pageTitle="Associações e Terceiro Setor"
            pageSubtitle="Monitoramento e relação de termos de fomento, colaboração e repasses a associações (MROSC – Lei 13.019/2014)."
            breadcrumbLabel="Associações"
            yearSubtitle="Parcerias e Terceiro Setor"
            categoryTitle="Termos e Documentos de Parceria"
            categorySubtitle="Entidades sem fins lucrativos e convênios cadastrados"
            tituloVazio="Nenhuma parceria registrada no momento"
        />
    );
}
