"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { FaEye, FaEyeSlash, FaSpinner, FaExclamationCircle, FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";
import { MUNICIPIO } from "@/config/municipio";

function getSafeCallbackUrl(): string {
    if (typeof window === "undefined") return "/admin";
    const param = new URLSearchParams(window.location.search).get("callbackUrl");
    if (!param) return "/admin";
    if (param.startsWith("/") && !param.startsWith("//")) {
        return param === "/admin/login" ? "/admin" : param;
    }
    try {
        const parsed = new URL(param);
        if (parsed.origin === window.location.origin && parsed.pathname.startsWith("/admin")) {
            return parsed.pathname === "/admin/login" ? "/admin" : `${parsed.pathname}${parsed.search}`;
        }
    } catch {
        // Ignora callbackUrl inválida
    }
    return "/admin";
}

export default function AdminLoginPage() {
    const { status } = useSession();
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPass, setShowPass] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [erroLogin, setErroLogin] = useState<string | null>(null);
    const [brasaoSrc, setBrasaoSrc] = useState("/logo_oficial.png");

    useEffect(() => {
        if (status === "authenticated") {
            window.location.assign(getSafeCallbackUrl());
        }
    }, [status]);

    useEffect(() => {
        let active = true;
        fetch("/api/admin/configuracoes")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!active || !Array.isArray(data)) return;
                const brasao = data.find((c: { chave?: string; valor?: string }) => c.chave === "simbolo_brasao")?.valor;
                if (brasao && typeof brasao === "string" && brasao.trim()) {
                    setBrasaoSrc(brasao.trim());
                }
            })
            .catch(() => {
                // Mantém fallback /logo_oficial.png
            });
        return () => {
            active = false;
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErroLogin(null);

        const cleanEmail = form.email.trim().toLowerCase();
        if (!cleanEmail || !form.password) {
            setErroLogin("Informe seu e-mail institucional e senha para continuar.");
            return;
        }

        setCarregando(true);
        try {
            const targetUrl = getSafeCallbackUrl();
            const result = await signIn("credentials", {
                redirect: false,
                email: cleanEmail,
                password: form.password,
                callbackUrl: targetUrl,
            });

            if (result?.ok && !result?.error) {
                toast.success("Bem-vindo ao Painel Administrativo!");
                window.location.assign(targetUrl);
                return;
            }

            const mensagem = "E-mail institucional ou senha incorretos. Verifique os dados e tente novamente.";
            setErroLogin(mensagem);
            toast.error(mensagem);
        } catch {
            const mensagem = "Falha na comunicação com o servidor. Tente novamente em instantes.";
            setErroLogin(mensagem);
            toast.error(mensagem);
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#eefaff] font-sans py-8 px-4">
            {/* Imagem de fundo clara com desfoque suave */}
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-cover bg-center scale-105"
                style={{
                    backgroundImage: "url('/images/hero-bg.jpg')",
                }}
            />
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-br from-[#01b0ef]/35 via-[#f4fbff]/55 to-[#fdb913]/20 backdrop-blur-md z-0"
            />

            {/* Cartão de Login */}
            <div className="relative z-10 w-full max-w-4xl flex flex-col md:flex-row bg-white rounded-[2rem] overflow-hidden shadow-civic-xl border border-[#01b0ef]/25">
                {/* Lado Esquerdo: Painel Institucional com Brasão Oficial */}
                <div className="hidden md:flex md:w-[45%] bg-gradient-to-br from-[#01b0ef] via-[#1dc0fa] to-[#0098d4] p-10 flex-col justify-between relative overflow-hidden text-white border-r border-sky-100/30">
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_60%)] pointer-events-none"
                    />

                    {/* Topo: Card Branco Exclusivo com o Brasão Oficial de São Tomé */}
                    <div className="relative z-10">
                        <div className="bg-white rounded-2xl px-5 py-3.5 inline-flex items-center justify-center shadow-lg border border-white/90">
                            <img
                                src={brasaoSrc}
                                alt={`Brasão Oficial de ${MUNICIPIO.nome} – ${MUNICIPIO.uf}`}
                                onError={() => setBrasaoSrc("/logo_oficial.png")}
                                className="h-14 w-auto object-contain"
                            />
                        </div>
                    </div>

                    {/* Centro: Título e Descrição */}
                    <div className="relative z-10 my-auto py-8">
                        <div className="w-12 h-1.5 bg-[#fdb913] rounded-full mb-5" />
                        <h1 className="text-3xl font-black tracking-tight uppercase mb-4 leading-tight font-heading">
                            Painel <br />
                            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg bg-[#fdb913] text-slate-900">
                                Administrativo
                            </span>
                        </h1>
                        <p className="text-xs text-white/95 font-medium leading-relaxed">
                            Gestão municipal transparente, eficiente e integrada. Acesso exclusivo para servidores autorizados da Prefeitura de{" "}
                            {MUNICIPIO.nome} – {MUNICIPIO.uf}.
                        </p>
                    </div>

                    {/* Rodapé: Indicador de Ambiente Seguro */}
                    <div className="relative z-10 flex items-center justify-between gap-2">
                        <div className="bg-white/95 rounded-full px-3.5 py-1.5 inline-flex items-center gap-2 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-black tracking-wider uppercase text-slate-900">
                                Ambiente Seguro
                            </span>
                        </div>
                    </div>
                </div>

                {/* Lado Direito: Formulário */}
                <div className="w-full md:w-[55%] bg-white p-7 sm:p-8 md:p-12 flex flex-col justify-between min-h-[480px]">
                    {/* Brasão Mobile no topo do formulário */}
                    <div className="md:hidden flex items-center justify-center mb-6">
                        <div className="bg-white rounded-2xl px-5 py-3 inline-flex items-center justify-center border border-[#01b0ef]/25 shadow-civic-sm">
                            <img
                                src={brasaoSrc}
                                alt={`Brasão Oficial de ${MUNICIPIO.nome} – ${MUNICIPIO.uf}`}
                                onError={() => setBrasaoSrc("/logo_oficial.png")}
                                className="h-14 w-auto object-contain"
                            />
                        </div>
                    </div>

                    {/* Título e Subtítulo */}
                    <div className="mb-6 text-center md:text-left">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2 font-heading">
                            Acesse sua conta
                        </h2>
                        <p className="text-sm text-slate-600 font-semibold leading-snug">
                            Insira suas credenciais institucionais para continuar
                        </p>
                    </div>

                    {/* Mensagem inline de erro */}
                    {erroLogin && (
                        <div
                            role="alert"
                            className="mb-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700"
                        >
                            <FaExclamationCircle className="mt-0.5 shrink-0 text-red-600" size={14} />
                            <span>{erroLogin}</span>
                        </div>
                    )}

                    {/* Corpo do Formulário */}
                    <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col justify-center">
                        <div>
                            <label
                                htmlFor="email-login"
                                className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-2"
                            >
                                E-mail Institucional
                            </label>
                            <input
                                id="email-login"
                                type="email"
                                required
                                autoComplete="username"
                                value={form.email}
                                onChange={(e) => {
                                    setErroLogin(null);
                                    setForm({ ...form, email: e.target.value });
                                }}
                                placeholder="usuario@saotome.rn.gov.br"
                                className="w-full min-h-[46px] bg-[#f4fbff] border border-[#01b0ef]/25 focus:border-[#01b0ef] focus:bg-white focus:ring-4 focus:ring-[#01b0ef]/15 transition-all duration-200 rounded-2xl py-3 px-4 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="senha-login"
                                className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-2"
                            >
                                Senha de Acesso
                            </label>
                            <div className="relative">
                                <input
                                    id="senha-login"
                                    type={showPass ? "text" : "password"}
                                    required
                                    autoComplete="current-password"
                                    value={form.password}
                                    onChange={(e) => {
                                        setErroLogin(null);
                                        setForm({ ...form, password: e.target.value });
                                    }}
                                    placeholder="••••••••"
                                    className="w-full min-h-[46px] bg-[#f4fbff] border border-[#01b0ef]/25 focus:border-[#01b0ef] focus:bg-white focus:ring-4 focus:ring-[#01b0ef]/15 transition-all duration-200 rounded-2xl py-3 pl-4 pr-12 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-[#01b0ef] transition-colors cursor-pointer"
                                    aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                                >
                                    {showPass ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Botão de Envio */}
                        <button
                            type="submit"
                            disabled={carregando}
                            className="w-full min-h-[48px] bg-[#01b0ef] hover:bg-[#0098d4] active:bg-[#007eb0] text-white font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded-2xl shadow-lg shadow-[#01b0ef]/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01b0ef] focus-visible:ring-offset-2"
                        >
                            {carregando && <FaSpinner className="animate-spin" />}
                            {carregando ? "ENTRANDO NO SISTEMA..." : "ENTRAR NO SISTEMA"}
                        </button>
                    </form>

                    {/* Rodapé e Retorno ao Portal */}
                    <div className="mt-7 pt-5 border-t border-slate-100 flex flex-col items-center gap-2.5 text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#007bb0] hover:text-[#01b0ef] transition-colors"
                        >
                            <FaArrowLeft size={11} />
                            <span>Voltar ao Portal Público</span>
                        </Link>
                        <p className="text-[10px] font-semibold text-slate-500 tracking-wide uppercase leading-relaxed max-w-sm">
                            Sistema de uso exclusivo autorizado • Acesso monitorado.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
