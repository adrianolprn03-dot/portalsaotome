"use client";
import RelatoriosFiscaisTemplate from "@/components/transparencia/RelatoriosFiscaisTemplate";
import { FaBalanceScale } from "react-icons/fa";

export default function ParecerTCEPage() {
    return (
        <RelatoriosFiscaisTemplate
            title="Pareceres Prévios do TCE"
            subtitle="Acompanhe a apreciação das contas anuais pelo Tribunal de Contas do Estado (TCE-RN)."
            icon={<FaBalanceScale />}
            tipo="PARECER_TCE"
            breadcrumbLabel="Parecer TCE"
            declaracao={{
                exercicios: "EXERCÍCIOS DE 2023 A 2025",
                textoInicial: "A PREFEITURA MUNICIPAL DE SÃO TOMÉ/RN, após consulta aos registros administrativos internos e ao portal oficial do Tribunal de Contas do Estado do Rio Grande do Norte (TCE/RN).",
                declaracao: "DECLARA, para fins de transparência pública, controle social e atendimento ao critério do Programa Nacional de Transparência Pública – PNTP, que as Contas Anuais de Governo da Prefeitura Municipal de São Tomé/RN, referentes aos exercícios de 2023, 2024 e 2025 encontram-se em tramitação e análise técnica junto ao Tribunal de Contas do Estado (TCE/RN), aguardando emissão de Parecer Prévio definitivo.",
                dataAtualizacao: "11/08/2026"
            }}
        />
    );
}
