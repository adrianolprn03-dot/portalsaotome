"use client";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { User, LogOut, ExternalLink, ChevronDown, Shield, Bell } from "lucide-react";

interface AdminHeaderProps {
    session: any;
}

export default function AdminHeader({ session }: AdminHeaderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const userName = session?.user?.name || "Gestor";
    const userEmail = session?.user?.email || "admin@portalsaotome.rn.gov.br";
    const userRole = session?.user?.role || "admin";

    // Obter iniciais do nome para o avatar
    const getInitials = (name: string) => {
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const roleLabels: Record<string, string> = {
        admin: "Administrador",
        editor: "Editor Geral",
        comunicacao: "Comunicação",
    };

    const roleColors: Record<string, string> = {
        admin: "bg-red-50 text-red-600 border-red-100",
        editor: "bg-blue-50 text-blue-600 border-blue-100",
        comunicacao: "bg-purple-50 text-purple-600 border-purple-100",
    };

    return (
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
            <div className="flex-1 min-w-0">
                <Breadcrumbs />
            </div>

            <div className="flex items-center gap-4 shrink-0">
                {/* Notificações (Sutil decorativo ou funcionalidade futura) */}
                <button 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all relative"
                    title="Notificações"
                >
                    <Bell size={18} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary-500 rounded-full"></span>
                </button>

                <div className="w-px h-6 bg-slate-100" />

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-left"
                    >
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary-500/10">
                            {getInitials(userName)}
                        </div>

                        {/* Detalhes rápidos (Desktop) */}
                        <div className="hidden sm:block">
                            <div className="text-xs font-black text-slate-800 leading-tight flex items-center gap-1.5">
                                {userName.split(" ")[0]}
                                <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{roleLabels[userRole] || userRole}</span>
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-150 shadow-xl shadow-slate-100/80 p-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                            {/* Cabeçalho do Dropdown */}
                            <div className="p-3 border-b border-slate-50 flex flex-col gap-1.5">
                                <div className="text-xs font-black text-slate-800 line-clamp-1">{userName}</div>
                                <div className="text-[10px] text-slate-400 font-medium truncate">{userEmail}</div>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg border ${roleColors[userRole] || "bg-slate-50 text-slate-600 border-slate-100"}`}>
                                        {roleLabels[userRole] || userRole}
                                    </span>
                                </div>
                            </div>

                            {/* Ações */}
                            <div className="p-1.5 space-y-1">
                                <Link
                                    href="/"
                                    target="_blank"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                                >
                                    <ExternalLink size={14} className="text-slate-400" />
                                    Acessar Portal Livre
                                </Link>

                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        signOut({ callbackUrl: "/admin/login" });
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50/50 transition-all text-left"
                                >
                                    <LogOut size={14} />
                                    Encerrar Sessão
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
