import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    breadcrumbs: BreadcrumbItem[];
    variant?: "default" | "premium";
    icon?: React.ReactNode;
}

export default function PageHeader({
    title,
    subtitle,
    breadcrumbs,
    variant = "default",
    icon,
}: PageHeaderProps) {
    if (variant === "premium") {
        return (
            <div className="bg-gradient-to-r from-[#01b0ef] via-[#1dc0fa] to-[#019ad4] text-white relative overflow-hidden py-14 md:py-16 border-b-4 border-[#fdb913]">
                <div className="absolute inset-0 civic-grid-light opacity-60 pointer-events-none" />
                <div className="absolute -top-20 right-0 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 left-1/4 w-80 h-80 bg-[#fdb913]/20 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-[1240px] mx-auto px-6 relative z-10">
                    {/* Breadcrumbs */}
                    {breadcrumbs && breadcrumbs.length > 0 && (
                        <nav
                            className="flex items-center flex-wrap gap-2 text-xs font-medium text-white/90 mb-5"
                            aria-label="Breadcrumb"
                        >
                            {breadcrumbs.map((item, index) => {
                                const isLast = index === breadcrumbs.length - 1;
                                return (
                                    <React.Fragment key={index}>
                                        {index > 0 && (
                                            <ChevronRight size={13} className="text-white/70 shrink-0" />
                                        )}
                                        {isLast || !item.href ? (
                                            <span className="bg-[#fdb913] text-slate-900 font-bold px-2.5 py-0.5 rounded-full">
                                                {item.label}
                                            </span>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                className="hover:text-[#fdb913] transition-colors inline-flex items-center gap-1.5"
                                            >
                                                {index === 0 && <Home size={13} />}
                                                <span>{item.label}</span>
                                            </Link>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </nav>
                    )}

                    <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
                        {icon && (
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-[#fdb913] rounded-2xl flex items-center justify-center shadow-lg shrink-0 text-slate-900 text-3xl">
                                {icon}
                            </div>
                        )}

                        <div className="flex-1">
                            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-3 drop-shadow-xs">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-white/95 max-w-3xl text-base md:text-lg font-normal leading-relaxed">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-[#eefaff] via-white to-[#fff9eb] border-b-2 border-[#01b0ef]/20 py-12 md:py-16 relative overflow-hidden z-10">
            <div className="absolute top-0 left-0 right-0 h-1 heraldic-stripe" />
            <div className="absolute inset-0 civic-grid-pattern opacity-70 pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#01b0ef]/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />

            <div className="max-w-[1240px] mx-auto px-6 relative z-10 flex flex-col items-start text-left">
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <nav
                        className="flex items-center flex-wrap gap-2 text-xs font-medium text-slate-600 mb-5"
                        aria-label="Breadcrumb"
                    >
                        <ol className="inline-flex items-center flex-wrap gap-2">
                            {breadcrumbs.map((item, index) => {
                                const isLast = index === breadcrumbs.length - 1;
                                return (
                                    <li key={index} className="inline-flex items-center gap-2">
                                        {index > 0 && (
                                            <ChevronRight size={13} className="text-slate-400 shrink-0" />
                                        )}
                                        {isLast || !item.href ? (
                                            <span className="text-slate-900 font-bold bg-[#fdb913]/25 px-2.5 py-0.5 rounded-full border border-[#fdb913]/50">
                                                {item.label}
                                            </span>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                className="hover:text-[#01b0ef] transition-colors inline-flex items-center gap-1.5"
                                            >
                                                {index === 0 && <Home size={13} className="text-[#01b0ef]" />}
                                                <span>{item.label}</span>
                                            </Link>
                                        )}
                                    </li>
                                );
                            })}
                        </ol>
                    </nav>
                )}

                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {icon && (
                        <div className="w-14 h-14 bg-[#01b0ef] text-white rounded-2xl flex items-center justify-center shrink-0 text-2xl shadow-civic-sm">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-3">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-base md:text-lg text-slate-600 max-w-3xl leading-relaxed font-normal">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
