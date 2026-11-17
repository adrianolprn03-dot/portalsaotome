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
            <div className="bg-[#071E3D] text-white relative overflow-hidden py-14 md:py-20 border-b border-white/10">
                <div className="absolute top-0 left-0 right-0 h-1.5 heraldic-stripe" />
                <div className="absolute inset-0 civic-grid-dark opacity-70 pointer-events-none" />
                <div className="absolute -top-24 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 left-1/4 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-[1240px] mx-auto px-6 relative z-10">
                    {/* Breadcrumbs */}
                    {breadcrumbs && breadcrumbs.length > 0 && (
                        <nav
                            className="flex items-center flex-wrap gap-2 text-xs font-medium text-slate-300 mb-6"
                            aria-label="Breadcrumb"
                        >
                            {breadcrumbs.map((item, index) => {
                                const isLast = index === breadcrumbs.length - 1;
                                return (
                                    <React.Fragment key={index}>
                                        {index > 0 && (
                                            <ChevronRight size={13} className="text-slate-500 shrink-0" />
                                        )}
                                        {isLast || !item.href ? (
                                            <span className="text-secondary-400 font-semibold">
                                                {item.label}
                                            </span>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                                            >
                                                {index === 0 && <Home size={13} className="text-primary-400" />}
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
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl flex items-center justify-center shadow-civic-lg shrink-0 text-secondary-400 text-3xl">
                                {icon}
                            </div>
                        )}

                        <div className="flex-1">
                            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-3">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-slate-300 max-w-3xl text-base md:text-lg font-normal leading-relaxed">
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
        <div className="bg-white border-b border-slate-200/80 py-12 md:py-16 relative overflow-hidden z-10">
            <div className="absolute top-0 left-0 right-0 h-1 heraldic-stripe" />
            <div className="absolute inset-0 civic-grid-pattern opacity-60 pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />

            <div className="max-w-[1240px] mx-auto px-6 relative z-10 flex flex-col items-start text-left">
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <nav
                        className="flex items-center flex-wrap gap-2 text-xs font-medium text-slate-500 mb-5"
                        aria-label="Breadcrumb"
                    >
                        <ol className="inline-flex items-center flex-wrap gap-2">
                            {breadcrumbs.map((item, index) => {
                                const isLast = index === breadcrumbs.length - 1;
                                return (
                                    <li key={index} className="inline-flex items-center gap-2">
                                        {index > 0 && (
                                            <ChevronRight size={13} className="text-slate-300 shrink-0" />
                                        )}
                                        {isLast || !item.href ? (
                                            <span className="text-primary-700 font-semibold bg-primary-50 px-2.5 py-0.5 rounded-md border border-primary-100">
                                                {item.label}
                                            </span>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                className="hover:text-primary-600 transition-colors inline-flex items-center gap-1.5"
                                            >
                                                {index === 0 && <Home size={13} className="text-primary-600" />}
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
                        <div className="w-14 h-14 bg-primary-50 border border-primary-100 text-primary-600 rounded-2xl flex items-center justify-center shrink-0 text-2xl shadow-civic-sm">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#071E3D] tracking-tight leading-[1.12] mb-3">
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
