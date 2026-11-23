"use client";

import RelatoriosFiscaisTemplate from "@/components/transparencia/RelatoriosFiscaisTemplate";
import { FaScaleBalanced } from "react-icons/fa6";

export default function OrcamentoClient() {
    return (
        <RelatoriosFiscaisTemplate
            title="Planejamento e Orçamento"
            subtitle="Instrumentos que definem as prioridades e a aplicação dos recursos públicos municipais (LOA, LDO e PPA)."
            icon={<FaScaleBalanced />}
            tipo="ORCAMENTO"
            breadcrumbLabel="Planejamento e Orçamento"
            showTabs={["LOA", "LDO", "PPA"]}
            yearSubtitle="Instrumentos Orçamentários (LOA, LDO e PPA)"
            orderByPeriod={false}
            sortAscLabel="Exercício crescente"
            sortDescLabel="Mais atuais primeiro"
        />
    );
}
