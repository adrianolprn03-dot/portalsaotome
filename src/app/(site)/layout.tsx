export const revalidate = 300;

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccessibilityProvider from "@/components/AccessibilityProvider";
import { prisma } from "@/lib/prisma";
import {
    FEMURN_STABLE_SEARCH_URL,
    isValidPublicUrl,
    sanitizeDiarioOficialUrl,
} from "@/lib/portal-links";

async function getHeaderExternalLinks() {
    let contribuinteUrl =
        "https://www.tinus.com.br/csp/SAOTOME/portal/index.csp?398ePKh0101MOVZE78365xmEw9088og=xbCN41Noq203lgm19139rlZlh569ZevDU2955S1071625bJbX145";
    let diarioUrl = FEMURN_STABLE_SEARCH_URL;

    try {
        const links = await prisma.linkExterno.findMany({
            where: {
                ativo: true,
                moduloAlvo: { in: ["home-contribuinte", "home-diario"] },
            },
            select: { moduloAlvo: true, url: true },
        });
        for (const l of links) {
            if (
                l.moduloAlvo?.toLowerCase() === "home-contribuinte" &&
                isValidPublicUrl(l.url)
            ) {
                contribuinteUrl = l.url.trim();
            }
            if (l.moduloAlvo?.toLowerCase() === "home-diario") {
                diarioUrl = sanitizeDiarioOficialUrl(l.url);
            }
        }
    } catch {
        // Mantém os padrões seguros caso o banco esteja indisponível
    }

    return { contribuinteUrl, diarioUrl };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
    const externalLinks = await getHeaderExternalLinks();

    return (
        <AccessibilityProvider>
            <Header externalLinks={externalLinks} />
            <main
                id="conteudo-principal"
                className="min-h-screen relative z-0 pt-[104px] md:pt-[110px]"
            >
                {children}
            </main>
            <Footer />
        </AccessibilityProvider>
    );
}
