import type { Metadata } from "next";
import LegislacaoPageShell from "@/components/transparencia/LegislacaoPageShell";

export const revalidate = 300;

export const metadata: Metadata = {
    title: "Legislação Municipal | Prefeitura de São Tomé – RN",
    description:
        "Leis municipais, decretos, portarias, resoluções e Lei Orgânica da Prefeitura de São Tomé – RN.",
};

export default async function LegislacaoPage() {
    return (
        <LegislacaoPageShell
            pageTitle="Legislação Municipal"
            pageSubtitle="Atos normativos do Município de São Tomé — leis, decretos, portarias, resoluções e Lei Orgânica."
            breadcrumbLabel="Legislação"
            iconKey="scale"
            yearSubtitle="Atos Normativos e Legislação Municipal"
        />
    );
}
