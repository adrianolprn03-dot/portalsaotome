import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import VLibras from "@/components/VLibras";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: {
        default: "Prefeitura Municipal de São Tomé – RN",
        template: "%s | Prefeitura de São Tomé",
    },
    description:
        "Portal Institucional e da Transparência da Prefeitura Municipal de São Tomé, Rio Grande do Norte. Serviços digitais ao cidadão, transparência ativa (PNTP), notícias e atos oficiais.",
    keywords: [
        "São Tomé",
        "Prefeitura",
        "Rio Grande do Norte",
        "Transparência",
        "Serviços Públicos",
        "PNTP",
        "e-SIC",
        "Ouvidoria",
    ],
    authors: [{ name: "Prefeitura Municipal de São Tomé" }],
    robots: "index, follow",
    openGraph: {
        type: "website",
        locale: "pt_BR",
        siteName: "Prefeitura de São Tomé – RN",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR" className="scroll-smooth">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="font-sans antialiased bg-[#f4fbff] text-slate-900 selection:bg-[#01b0ef] selection:text-white">
                <Providers>
                    <a href="#conteudo-principal" className="skip-link">
                        Ir para o conteúdo principal
                    </a>
                    {children}
                </Providers>

                {/* VLibras Widget */}
                <VLibras />
            </body>
        </html>
    );
}
