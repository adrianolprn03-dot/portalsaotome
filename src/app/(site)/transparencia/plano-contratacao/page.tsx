import type { Metadata } from "next";
import ListaDocumentosClient from "@/components/ListaDocumentosClient";

export const metadata: Metadata = {
    title: "Plano Anual de Contratação | Prefeitura de São Tomé – RN",
    description: "Plano Anual de Contratações (PAC) da Administração Municipal.",
};

export default function PlanoContratacaoPage() {
    return (
        <ListaDocumentosClient
            tipoDocumento="plano-contratacao"
            pageTitle="Plano Anual de Contratação"
            pageSubtitle="Documento que consolida as contratações e compras planejadas para o exercício (Lei nº 14.133/2021)."
            breadcrumbLabel="Plano de Contratação"
            yearSubtitle="Plano Anual de Contratações (PAC)"
            categoryTitle="PAC - Plano Anual de Contratação"
            categorySubtitle="Consolidado anual de compras e licitações planejadas"
            tituloVazio="Nenhum Plano Anual de Contratação encontrado"
        />
    );
}
