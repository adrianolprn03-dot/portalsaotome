"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumbs() {
    const pathname = usePathname();
    const segments = pathname ? pathname.split("/").filter(Boolean) : [];

    if (segments.length === 0) return null;

    const labels: Record<string, string> = {
        admin: "Painel",
        noticias: "Notícias",
        licitacoes: "Licitações",
        contratos: "Contratos",
        servidores: "Servidores",
        receitas: "Receitas",
        despesas: "Despesas",
        secretarias: "Secretarias",
        ouvidoria: "Ouvidoria",
        contatos: "Contatos",
        galeria: "Galeria",
        agenda: "Agenda",
        documentos: "Documentos",
        editar: "Editar",
        nova: "Novo(a)",
        novo: "Novo(a)",
        historia: "História",
        prefeito: "Prefeito",
        estrutura: "Estrutura",
        transparencia: "Transparência",
        servicos: "Serviços",
    };

    return (
        <nav
            className="flex items-center gap-2 text-xs text-slate-500 mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide"
            aria-label="Breadcrumb"
        >
            <Link
                href={segments[0] === "admin" ? "/admin" : "/"}
                className="hover:text-primary-600 transition-colors flex items-center gap-1.5 font-medium"
            >
                <Home size={13} className="text-primary-600" />
                <span>Início</span>
            </Link>

            {segments.map((segment, index) => {
                const url = `/${segments.slice(0, index + 1).join("/")}`;
                const isLast = index === segments.length - 1;
                const label =
                    labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

                if (segment === "admin" && index === 0) return null;

                const clickable = !isLast && isNaN(Number(segment)) && segment.length > 5;

                return (
                    <div key={url} className="flex items-center gap-2">
                        <ChevronRight size={12} className="text-slate-300" />
                        {clickable ? (
                            <Link
                                href={url}
                                className="hover:text-primary-600 transition-colors font-medium"
                            >
                                {label}
                            </Link>
                        ) : (
                            <span
                                className={
                                    isLast
                                        ? "text-primary-700 font-semibold bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100"
                                        : ""
                                }
                            >
                                {label}
                            </span>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
