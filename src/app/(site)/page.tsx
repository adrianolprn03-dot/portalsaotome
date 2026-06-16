import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import HeroSection from "@/components/home/HeroSection";
import ServicosRapidos from "@/components/home/ServicosRapidos";
import AcessoRapido from "@/components/home/AcessoRapido";
import UltimasNoticias from "@/components/home/UltimasNoticias";
import AgendaSection from "@/components/home/AgendaSection";
import SecretariasSlider from "@/components/home/SecretariasSlider";
import UnidadesAtendimento from "@/components/home/UnidadesAtendimento";
import RadarTransparencia from "@/components/home/RadarTransparencia";
import VideoHero from "@/components/home/VideoHero";

export const metadata: Metadata = {
    title: "Prefeitura Municipal de São Tomé – RN | Página Inicial",
    description: "Site oficial da Prefeitura Municipal de São Tomé – RN. Transparência, serviços ao cidadão, notícias e informações institucionais.",
    keywords: "São Tomé, prefeitura, RN, Rio Grande do Norte, transparência, serviços públicos",
    openGraph: {
        title: "Prefeitura Municipal de São Tomé – RN",
        description: "Site oficial da Prefeitura Municipal de São Tomé. Transparência, serviços e informações institucionais.",
        locale: "pt_BR",
        type: "website",
    },
};

export default function Home() {
    return (
        <main>
            <HeroSection />
            <ServicosRapidos />
            <UltimasNoticias />
            <AgendaSection />
            <AcessoRapido />
            <UnidadesAtendimento />
            <VideoHero />
            <RadarTransparencia />
            <SecretariasSlider />
        </main>
    );
}

