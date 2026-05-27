"use client";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPass, setShowPass] = useState(false);
    const [carregando, setCarregando] = useState(false);

    useEffect(() => {
        if (status === "authenticated") {
            window.location.href = "/admin";
        }
    }, [status, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCarregando(true);
        try {
            const result = await signIn("credentials", {
                redirect: false,
                email: form.email,
                password: form.password,
            });
            if (result?.ok) {
                toast.success("Bem-vindo ao Painel Administrativo!");
                window.location.href = "/admin";
            } else {
                toast.error("E-mail ou senha inválidos.");
            }
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img src="/images/hero-bg.jpg" alt="Background São Tomé" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm" />
            </div>

            <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
                {/* Branding Side */}
                <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-primary-700 to-primary-950 p-12 flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl -ml-20 -mb-20" />
                    
                    <div className="relative z-10">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl inline-block shadow-xl">
                            <img 
                                src="/logo_oficial.png" 
                                alt="Prefeitura Municipal de São Tomé" 
                                className="h-14 w-auto object-contain drop-shadow-xl" 
                            />
                        </div>
                    </div>
                    
                    <div className="relative z-10 mt-12">
                        <h1 className="text-white font-black text-4xl mb-6 tracking-tighter leading-[1.1]">
                            Painel <br />Administrativo
                        </h1>
                        <p className="text-primary-100 text-sm leading-relaxed font-medium opacity-80">
                            Gestão municipal transparente, eficiente e integrada. 
                            Acesso exclusivo para servidores autorizados da Prefeitura de São Tomé – RN.
                        </p>
                    </div>
                    
                    <div className="relative z-10 mt-16">
                        <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full border border-white/10 w-max">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-white/80 text-[9px] font-black uppercase tracking-widest">Ambiente Seguro</span>
                        </div>
                    </div>
                </div>

                {/* Login Form Side */}
                <div className="w-full md:w-7/12 bg-white p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                    <div className="md:hidden mb-10 flex justify-center">
                        <img 
                            src="/logo_oficial.png" 
                            alt="Prefeitura Municipal de São Tomé" 
                            className="h-16 w-auto object-contain" 
                        />
                    </div>

                    <div className="mb-10 text-center md:text-left">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Acesse sua conta</h2>
                        <p className="text-slate-500 text-sm mt-2 font-medium">Insira suas credenciais institucionais para continuar</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email-login" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                                E-mail Institucional
                            </label>
                            <input
                                id="email-login"
                                type="email"
                                required
                                autoComplete="username"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="usuario@saotome.rn.gov.br"
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="senha-login" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                                Senha de Acesso
                            </label>
                            <div className="relative">
                                <input
                                    id="senha-login"
                                    type={showPass ? "text" : "password"}
                                    required
                                    autoComplete="current-password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-6 pr-14 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all"
                                >
                                    {showPass ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={carregando}
                            className="w-full bg-slate-900 hover:bg-primary-600 text-white rounded-2xl px-6 py-5 text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-900/20 hover:shadow-primary-600/30 hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:translate-y-0 mt-4"
                        >
                            {carregando && <FaSpinner className="animate-spin" size={16} />}
                            {carregando ? "Autenticando..." : "Entrar no Sistema"}
                        </button>

                        <div className="pt-8 mt-8 border-t border-slate-100">
                            <p className="text-center text-[10px] leading-relaxed font-bold text-slate-400 uppercase tracking-widest opacity-60">
                                Sistema de uso exclusivo autorizado.<br/>
                                Acesso indevido sujeito às penalidades da Lei.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

