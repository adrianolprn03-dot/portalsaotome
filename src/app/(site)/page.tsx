import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import HeroSection from "@/components/home/HeroSection";
import ServicosRapidos from "@/components/home/ServicosRapidos";
import UltimasNoticias from "@/components/home/UltimasNoticias";
import TransparenciaCompactSection from "@/components/home/TransparenciaCompactSection";
import SecretariasUnidadesSection from "@/components/home/SecretariasUnidadesSection";
import VideoHero from "@/components/home/VideoHero";

export const revalidate = 60;

export const metadata: Metadata = {
    title: "Prefeitura de São Tomé – RN | Portal Oficial",
    description:
        "Portal Institucional da Prefeitura Municipal de São Tomé/RN. Atendimento ao cidadão, serviços públicos, notícias, transparência e legislação municipal.",
    keywords:
        "Prefeitura de São Tomé, São Tomé RN, Rio Grande do Norte, serviços públicos, transparência, ouvidoria, e-SIC, unidades de saúde, diário oficial",
    openGraph: {
        title: "Prefeitura de São Tomé – RN",
        description:
            "Portal Institucional da Prefeitura Municipal de São Tomé/RN. Serviços, atendimento, notícias e transparência pública.",
        locale: "pt_BR",
        type: "website",
    },
};

export default async function Home() {
    let slogan = "O Trabalho Segue em Frente";
    try {
        const cfg = await prisma.configuracao.findUnique({
            where: { chave: "gestao_slogan" },
        });
        if (cfg?.valor && cfg.valor.trim() && cfg.valor.trim() !== "#") {
            slogan = cfg.valor.trim();
        }
    } catch {
        // Fallback silencioso para o slogan padrão
    }

    return (
        <div>
            {/* A. Prefeitura de São Tomé (Identificação institucional, busca geral e fotografia local) */}
            <HeroSection />

            {/* B. Serviços e atendimento (Atalhos prioritários de tarefas e área do servidor) */}
            <ServicosRapidos />

            {/* C. Notícias e avisos (Destaque com foto, chamadas secundárias e avisos com prazo) */}
            <UltimasNoticias />

            {/* D. Transparência (Acessos diretos e dados verificáveis) */}
            <TransparenciaCompactSection />

            {/* E. Secretarias e unidades de atendimento (Diretório compacto por área) */}
            <SecretariasUnidadesSection />

            {/* F. Conheça São Tomé (História, cultura, símbolos, slogan e vídeo sob demanda) */}
            <VideoHero slogan={slogan} />
        </div>
    );
}
