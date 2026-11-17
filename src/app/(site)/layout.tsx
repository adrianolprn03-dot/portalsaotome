import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccessibilityProvider from "@/components/AccessibilityProvider";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <AccessibilityProvider>
            <Header />
            <main
                id="conteudo-principal"
                className="min-h-screen relative z-0 pt-[108px] md:pt-[116px]"
            >
                {children}
            </main>
            <Footer />
        </AccessibilityProvider>
    );
}
