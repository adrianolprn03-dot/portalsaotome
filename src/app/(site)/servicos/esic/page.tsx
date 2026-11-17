"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import PageHeader from "@/components/PageHeader";
import {
    HelpCircle,
    BarChart3,
    ShieldCheck,
    Phone,
    MapPin,
    Clock,
    FileText,
    ArrowUpRight,
    Info,
    Scale,
    Lock,
    BookOpen,
    History,
    CheckCircle2,
    User,
    ArrowLeft,
    Home,
    FileSearch,
    Mail,
} from "lucide-react";
import Link from "next/link";

type UserType = {
    id: string;
    nome: string;
    email: string;
};

type Pedido = {
    id: string;
    protocolo: string;
    orgao: string;
    pedido: string;
    status: string;
    criadoEm: string;
    resposta?: string;
    respondidoEm?: string;
};

export default function ESICPage() {
    const [view, setView] = useState<"auth" | "dashboard" | "history" | "info">(
        "auth"
    );
    const [authTab, setAuthTab] = useState<"login" | "register">("login");
    const [infoTab, setInfoTab] = useState("sic");
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [protocolo, setProtocolo] = useState<string | null>(null);
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [tipoPessoa, setTipoPessoa] = useState<"Física" | "Jurídica">(
        "Física"
    );

    const [loginForm, setLoginForm] = useState({ email: "", senha: "" });
    const [registerForm, setRegisterForm] = useState({
        nome: "",
        email: "",
        confirmEmail: "",
        senha: "",
        confirmSenha: "",
        cpf: "",
        cnpj: "",
        razaoSocial: "",
        nomeFantasia: "",
        telefone: "",
        dataNascimento: "",
        sexo: "",
        escolaridade: "",
        profissao: "",
        rg: "",
        orgaoEmissor: "",
        ufEmissor: "",
        cep: "",
        endereco: "",
        numero: "",
        bairro: "",
        cidade: "São Tomé",
        uf: "RN",
        dataAbertura: "",
        concordo: false,
    });
    const [esicForm, setEsicForm] = useState({
        orgao: "",
        pedido: "",
        formaRetorno: "sistema",
    });

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        const token = localStorage.getItem("esic-token");
        if (token) {
            try {
                const res = await fetch("/api/esic/auth/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                    setView("dashboard");
                } else {
                    localStorage.removeItem("esic-token");
                }
            } catch (error) {
                console.error("Auth check error", error);
            }
        }
        setLoading(false);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/esic/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginForm),
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("esic-token", data.token);
                setUser(data.cidadao);
                toast.success(`Bem-vindo, ${data.cidadao.nome}!`);
                setView("dashboard");
            } else {
                toast.error(data.error || "Erro ao entrar.");
            }
        } catch {
            toast.error("Erro de conexão.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (registerForm.email !== registerForm.confirmEmail)
            return toast.error("Os e-mails não coincidem.");
        if (registerForm.senha !== registerForm.confirmSenha)
            return toast.error("As senhas não coincidem.");
        if (!registerForm.concordo)
            return toast.error("Você deve concordar com os termos.");

        setSubmitting(true);
        try {
            const res = await fetch("/api/esic/auth/cadastro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...registerForm,
                    tipoPessoa,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("esic-token", data.token);
                setUser(data.cidadao);
                toast.success("Conta criada com sucesso!");
                setView("dashboard");
            } else {
                toast.error(data.error || "Erro ao cadastrar.");
            }
        } catch {
            toast.error("Erro de conexão.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEsicSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const token = localStorage.getItem("esic-token");
        try {
            const res = await fetch("/api/esic", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(esicForm),
            });
            const data = await res.json();
            if (res.ok) {
                setProtocolo(data.protocolo);
                toast.success("Pedido registrado!");
                setEsicForm({ orgao: "", pedido: "", formaRetorno: "sistema" });
            } else {
                toast.error(data.error || "Erro ao enviar.");
            }
        } catch {
            toast.error("Erro de conexão.");
        } finally {
            setSubmitting(false);
        }
    };

    const fetchHistory = async () => {
        setView("history");
        setLoading(true);
        const token = localStorage.getItem("esic-token");
        try {
            const res = await fetch("/api/esic/meus-pedidos", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setPedidos(data);
            }
        } catch {
            toast.error("Erro ao carregar histórico.");
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("esic-token");
        setUser(null);
        setView("auth");
        toast.success("Sessão encerrada.");
    };

    if (loading && !user) {
        return (
            <div className="min-h-screen bg-[#f4fbff] flex items-center justify-center font-semibold text-sm text-slate-600">
                Carregando sistema e-SIC...
            </div>
        );
    }

    const sidebarItems = [
        { id: "sic", label: "Informações do SIC", icon: Info, internal: true },
        {
            id: "faq",
            label: "Perguntas e Respostas (FAQ)",
            icon: HelpCircle,
            href: "/transparencia/passiva/perguntas",
        },
        {
            id: "relatorios",
            label: "Relatório Estatístico Anual",
            icon: BarChart3,
            href: "/transparencia/passiva/relatorios/estatisticas",
        },
        {
            id: "sigilo",
            label: "Documentos Classificados",
            icon: Lock,
            href: "/transparencia/passiva/relatorios/com-sigilo",
        },
        {
            id: "nao-sigiloso",
            label: "Desclassificadas (12 Meses)",
            icon: BookOpen,
            href: "/transparencia/passiva/relatorios/sem-sigilo",
        },
        {
            id: "prazos",
            label: "Prazos de Resposta LAI",
            icon: Clock,
            internal: true,
        },
        {
            id: "regulamentacao",
            label: "Regulamentação da LAI",
            icon: Scale,
            href: "/transparencia/passiva/regulamentacao",
        },
    ];

    return (
        <div className="min-h-screen bg-[#f4fbff]">
            <PageHeader
                title="e-SIC • Serviço de Informação ao Cidadão"
                subtitle="Solicite informações públicas eletronicamente com garantia de protocolo, conforme a Lei Federal nº 12.527/2011 (LAI)."
                variant="premium"
                icon={<FileSearch className="w-8 h-8" />}
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Serviços", href: "/servicos/esic" },
                    { label: "e-SIC (LAI)" },
                ]}
            />

            <div className="max-w-[1240px] mx-auto px-6 py-14 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* SIDEBAR (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-3xl shadow-civic-sm border border-slate-200/80 overflow-hidden p-3 space-y-1">
                            <button
                                onClick={() => {
                                    setView(user ? "dashboard" : "auth");
                                    setInfoTab("none");
                                }}
                                className={`w-full text-left px-4 py-3.5 rounded-2xl flex items-center gap-3 text-xs font-bold transition-all ${
                                    view !== "info"
                                        ? "bg-[#01b0ef] text-white shadow-sm"
                                        : "text-slate-600 hover:bg-[#f4fbff]"
                                }`}
                            >
                                <Home size={16} className={view !== "info" ? "text-[#fdb913]" : "text-[#01b0ef]"} />
                                <span>Acesso ao Sistema Digital</span>
                            </button>

                            {sidebarItems.map((item) =>
                                item.internal ? (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setView("info");
                                            setInfoTab(item.id);
                                        }}
                                        className={`w-full text-left px-4 py-3.5 rounded-2xl flex items-center gap-3 text-xs font-bold transition-all ${
                                            infoTab === item.id && view === "info"
                                                ? "bg-[#01b0ef] text-white shadow-sm"
                                                : "text-slate-600 hover:bg-[#f4fbff]"
                                        }`}
                                    >
                                        <item.icon
                                            size={16}
                                            className={
                                                infoTab === item.id && view === "info"
                                                    ? "text-[#fdb913]"
                                                    : "text-[#01b0ef]"
                                            }
                                        />
                                        <span>{item.label}</span>
                                    </button>
                                ) : (
                                    <Link
                                        key={item.id}
                                        href={item.href || "#"}
                                        className="w-full text-left px-4 py-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold text-slate-600 hover:bg-[#f4fbff] hover:text-[#01b0ef] transition-all"
                                    >
                                        <span className="flex items-center gap-3">
                                            <item.icon size={16} className="text-[#01b0ef]" />
                                            <span>{item.label}</span>
                                        </span>
                                        <ArrowUpRight size={14} className="text-slate-300" />
                                    </Link>
                                )
                            )}
                        </div>

                        <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-civic-sm">
                            <h4 className="font-heading text-sm font-extrabold text-slate-900 mb-4">
                                Atendimento Presencial SIC
                            </h4>
                            <div className="space-y-3.5 text-xs">
                                <div className="flex items-start gap-3">
                                    <MapPin className="text-[#01b0ef] mt-0.5 shrink-0" size={15} />
                                    <p className="font-semibold text-slate-700 leading-snug">
                                        Praça Antônio Assunção, s/n – Centro
                                        <br />
                                        <span className="text-slate-500 font-normal">
                                            CEP: 59.400-000 • São Tomé/RN
                                        </span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="text-[#01b0ef] shrink-0" size={15} />
                                    <p className="font-mono font-bold text-slate-700">
                                        (84) 98748-0287
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="text-[#fdb913] shrink-0" size={15} />
                                    <p className="font-semibold text-slate-700">
                                        Segunda a Sexta: 07h às 13h
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ÁREA PRINCIPAL (8 cols) */}
                    <div className="lg:col-span-8">
                        {view === "info" && (
                            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-civic-sm border border-slate-200/80 animate-fade-in">
                                {infoTab === "sic" && (
                                    <div className="space-y-6">
                                        <h3 className="font-heading text-2xl font-extrabold text-slate-900 border-b border-slate-100 pb-5 flex items-center gap-3">
                                            <Info className="text-[#01b0ef]" size={24} />
                                            <span>Informações do SIC</span>
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed text-base">
                                            O Serviço de Informações ao Cidadão (SIC) permite que qualquer pessoa, física ou jurídica, encaminhe pedidos de acesso à informação aos órgãos e entidades do Poder Executivo Municipal.
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                            <div className="p-5 rounded-2xl bg-[#f4fbff] border border-[#01b0ef]/20 space-y-4">
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#01b0ef]">
                                                        Unidade Responsável
                                                    </p>
                                                    <p className="font-heading font-bold text-slate-800 text-base mt-0.5">
                                                        Ouvidoria Geral do Município
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#01b0ef]">
                                                        Canais de Atendimento
                                                    </p>
                                                    <p className="font-mono font-semibold text-slate-700 text-xs mt-1">
                                                        Telefone / WhatsApp: (84) 98748-0287
                                                    </p>
                                                    <p className="font-semibold text-slate-700 text-xs mt-0.5 break-all">
                                                        E-mail: ouvidoria@saotome.rn.gov.br
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="p-5 rounded-2xl bg-[#f4fbff] border border-[#01b0ef]/20 space-y-4">
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#01b0ef]">
                                                        Localização Física
                                                    </p>
                                                    <p className="font-semibold text-slate-700 text-xs mt-1">
                                                        Praça Antônio Assunção, s/n – Centro, CEP 59.400-000
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#01b0ef]">
                                                        Horário de Funcionamento
                                                    </p>
                                                    <p className="font-semibold text-slate-700 text-xs mt-1">
                                                        07h às 13h, de segunda a sexta-feira
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {infoTab === "prazos" && (
                                    <div className="space-y-6">
                                        <h3 className="font-heading text-2xl font-extrabold text-slate-900 border-b border-slate-100 pb-5 flex items-center gap-3">
                                            <Clock className="text-[#01b0ef]" size={24} />
                                            <span>Prazos Legais de Resposta (Lei nº 12.527/2011)</span>
                                        </h3>
                                        <div className="bg-[#eefaff] p-7 rounded-2xl border border-[#01b0ef]/25 space-y-4">
                                            <div className="flex items-start gap-3.5">
                                                <span className="w-7 h-7 bg-[#01b0ef] text-white rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-xs">
                                                    1
                                                </span>
                                                <p className="text-slate-700 text-sm pt-0.5">
                                                    O órgão público deve conceder o acesso imediato caso a informação já esteja disponível.
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-3.5">
                                                <span className="w-7 h-7 bg-[#fdb913] text-slate-900 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-xs">
                                                    2
                                                </span>
                                                <p className="text-slate-700 text-sm pt-0.5">
                                                    Não sendo possível o acesso imediato, o prazo máximo de resposta é de{" "}
                                                    <strong>20 (vinte) dias corridos</strong>.
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-3.5">
                                                <span className="w-7 h-7 bg-[#01b0ef] text-white rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-xs">
                                                    3
                                                </span>
                                                <p className="text-slate-700 text-sm pt-0.5">
                                                    O prazo pode ser prorrogado por mais{" "}
                                                    <strong>10 (dez) dias</strong>, mediante justificativa expressa ao requerente.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {view === "auth" && (
                            <div className="animate-fade-in space-y-6">
                                <div className="bg-white rounded-3xl shadow-civic-sm border border-slate-200/80 overflow-hidden relative">
                                    <div className="h-1.5 w-full heraldic-stripe" />
                                    <div className="bg-[#f4fbff] px-8 py-5 border-b border-slate-200/70">
                                        <h3 className="font-heading text-base font-extrabold text-slate-900 flex items-center gap-2.5">
                                            {authTab === "login" ? (
                                                <>
                                                    <ShieldCheck className="text-[#01b0ef]" size={20} />
                                                    <span>Identificação do Requerente</span>
                                                </>
                                            ) : (
                                                <>
                                                    <User className="text-[#01b0ef]" size={20} />
                                                    <span>Cadastro de Novo Requerente</span>
                                                </>
                                            )}
                                        </h3>
                                    </div>

                                    <div className="p-8">
                                        {authTab === "login" ? (
                                            <form onSubmit={handleLogin} className="space-y-5">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                        E-mail ou CPF/CNPJ
                                                    </label>
                                                    <div className="relative">
                                                        <Mail
                                                            size={17}
                                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#01b0ef]"
                                                        />
                                                        <input
                                                            type="text"
                                                            required
                                                            className="input-field pl-11"
                                                            placeholder="Digite seu identificador"
                                                            value={loginForm.email}
                                                            onChange={(e) =>
                                                                setLoginForm({
                                                                    ...loginForm,
                                                                    email: e.target.value,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                        Senha de Acesso
                                                    </label>
                                                    <div className="relative">
                                                        <Lock
                                                            size={17}
                                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#01b0ef]"
                                                        />
                                                        <input
                                                            type="password"
                                                            required
                                                            className="input-field pl-11"
                                                            placeholder="••••••••"
                                                            value={loginForm.senha}
                                                            onChange={(e) =>
                                                                setLoginForm({
                                                                    ...loginForm,
                                                                    senha: e.target.value,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={submitting}
                                                    className="btn-primary w-full py-3.5"
                                                >
                                                    {submitting && (
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    )}
                                                    <span>Entrar no Sistema e-SIC</span>
                                                </button>

                                                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setAuthTab("register")}
                                                        className="text-xs font-bold text-[#01b0ef] hover:underline"
                                                    >
                                                        Não possui conta? Cadastre-se aqui
                                                    </button>
                                                    <Link
                                                        href="/servicos/consulta-protocolo"
                                                        className="text-xs font-semibold text-slate-600 hover:text-[#01b0ef]"
                                                    >
                                                        Consultar protocolo rápido →
                                                    </Link>
                                                </div>
                                            </form>
                                        ) : (
                                            <form onSubmit={handleRegister} className="space-y-5">
                                                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setAuthTab("login")}
                                                        className="text-xs font-bold text-slate-600 flex items-center gap-1.5 hover:text-[#01b0ef] transition-colors"
                                                    >
                                                        <ArrowLeft size={14} />
                                                        <span>Voltar para o login</span>
                                                    </button>
                                                    <div className="flex gap-1.5 p-1 bg-[#eefaff] rounded-xl border border-[#01b0ef]/20">
                                                        <button
                                                            type="button"
                                                            onClick={() => setTipoPessoa("Física")}
                                                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                                tipoPessoa === "Física"
                                                                    ? "bg-[#01b0ef] text-white shadow-xs"
                                                                    : "text-slate-600"
                                                            }`}
                                                        >
                                                            Pessoa Física
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setTipoPessoa("Jurídica")
                                                            }
                                                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                                tipoPessoa === "Jurídica"
                                                                    ? "bg-[#01b0ef] text-white shadow-xs"
                                                                    : "text-slate-600"
                                                            }`}
                                                        >
                                                            Pessoa Jurídica
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                            Nome Completo / Responsável *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={registerForm.nome}
                                                            onChange={(e) =>
                                                                setRegisterForm({
                                                                    ...registerForm,
                                                                    nome: e.target.value,
                                                                })
                                                            }
                                                            className="input-field"
                                                        />
                                                    </div>

                                                    {tipoPessoa === "Física" ? (
                                                        <>
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                                    CPF *
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    required
                                                                    value={registerForm.cpf}
                                                                    onChange={(e) =>
                                                                        setRegisterForm({
                                                                            ...registerForm,
                                                                            cpf: e.target.value,
                                                                        })
                                                                    }
                                                                    className="input-field"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                                    RG (Opcional)
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={registerForm.rg}
                                                                    onChange={(e) =>
                                                                        setRegisterForm({
                                                                            ...registerForm,
                                                                            rg: e.target.value,
                                                                        })
                                                                    }
                                                                    className="input-field"
                                                                />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                                    CNPJ *
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    required
                                                                    value={registerForm.cnpj}
                                                                    onChange={(e) =>
                                                                        setRegisterForm({
                                                                            ...registerForm,
                                                                            cnpj: e.target.value,
                                                                        })
                                                                    }
                                                                    className="input-field"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                                    Razão Social *
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    required
                                                                    value={
                                                                        registerForm.razaoSocial
                                                                    }
                                                                    onChange={(e) =>
                                                                        setRegisterForm({
                                                                            ...registerForm,
                                                                            razaoSocial:
                                                                                e.target.value,
                                                                        })
                                                                    }
                                                                    className="input-field"
                                                                />
                                                            </div>
                                                        </>
                                                    )}

                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                            E-mail *
                                                        </label>
                                                        <input
                                                            type="email"
                                                            required
                                                            value={registerForm.email}
                                                            onChange={(e) =>
                                                                setRegisterForm({
                                                                    ...registerForm,
                                                                    email: e.target.value,
                                                                    confirmEmail: e.target.value,
                                                                })
                                                            }
                                                            className="input-field"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                            Senha *
                                                        </label>
                                                        <input
                                                            type="password"
                                                            required
                                                            value={registerForm.senha}
                                                            onChange={(e) =>
                                                                setRegisterForm({
                                                                    ...registerForm,
                                                                    senha: e.target.value,
                                                                    confirmSenha: e.target.value,
                                                                })
                                                            }
                                                            className="input-field"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3 p-4 bg-[#f4fbff] rounded-xl border border-[#01b0ef]/20 text-xs text-slate-600">
                                                    <input
                                                        type="checkbox"
                                                        checked={registerForm.concordo}
                                                        onChange={(e) =>
                                                            setRegisterForm({
                                                                ...registerForm,
                                                                concordo: e.target.checked,
                                                            })
                                                        }
                                                        className="mt-0.5 shrink-0 accent-[#01b0ef]"
                                                    />
                                                    <label>
                                                        Declaro que as informações fornecidas são verdadeiras e estou ciente da política de privacidade (LGPD).
                                                    </label>
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={submitting}
                                                    className="btn-primary w-full py-3.5"
                                                >
                                                    Confirmar Cadastro
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-[#eefaff] rounded-2xl p-5 border border-[#01b0ef]/25 flex items-start gap-3.5">
                                    <Info className="text-[#01b0ef] mt-0.5 shrink-0" size={18} />
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-900 mb-0.5">
                                            Direito Constitucional de Acesso à Informação
                                        </h4>
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            Qualquer cidadão pode solicitar dados e documentos públicos sem necessidade de apresentar justificativa, nos termos do art. 10, § 3º da Lei Federal nº 12.527/2011.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {view === "dashboard" && user && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-white rounded-3xl p-6 shadow-civic-sm border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-12 h-12 bg-[#01b0ef]/10 border border-[#01b0ef]/25 text-[#01b0ef] rounded-2xl flex items-center justify-center font-heading font-bold text-lg">
                                            {user.nome.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-500">
                                                Requerente autenticado
                                            </p>
                                            <p className="font-heading text-lg font-extrabold text-slate-900">
                                                {user.nome}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2.5">
                                        <button
                                            onClick={fetchHistory}
                                            className="btn-outline py-2.5 px-4 text-xs"
                                        >
                                            Meus Pedidos
                                        </button>
                                        <button
                                            onClick={logout}
                                            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors"
                                        >
                                            Sair
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl shadow-civic-sm p-8 border border-slate-200/80">
                                    <h3 className="font-heading text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2.5">
                                        <FileText className="text-[#01b0ef]" size={20} />
                                        <span>Novo Pedido de Acesso à Informação</span>
                                    </h3>
                                    {protocolo ? (
                                        <div className="text-center py-10">
                                            <CheckCircle2
                                                className="text-emerald-600 mx-auto mb-3"
                                                size={42}
                                            />
                                            <h4 className="font-heading text-2xl font-bold text-slate-900 mb-1">
                                                Pedido Registrado!
                                            </h4>
                                            <p className="text-slate-600 text-sm mb-6">
                                                Protocolo:{" "}
                                                <span className="font-mono font-bold text-[#01b0ef]">
                                                    {protocolo}
                                                </span>
                                            </p>
                                            <button
                                                onClick={() => setProtocolo(null)}
                                                className="btn-primary"
                                            >
                                                Novo Pedido
                                            </button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleEsicSubmit} className="space-y-5">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                    Órgão / Secretaria Destinatária *
                                                </label>
                                                <select
                                                    required
                                                    value={esicForm.orgao}
                                                    onChange={(e) =>
                                                        setEsicForm({
                                                            ...esicForm,
                                                            orgao: e.target.value,
                                                        })
                                                    }
                                                    className="input-field cursor-pointer"
                                                >
                                                    <option value="">Selecione...</option>
                                                    <option>Gabinete do Prefeito</option>
                                                    <option>Secretaria de Administração</option>
                                                    <option>Secretaria de Finanças</option>
                                                    <option>Secretaria de Saúde</option>
                                                    <option>Secretaria de Educação</option>
                                                    <option>Secretaria de Obras</option>
                                                    <option>Secretaria de Assistência Social</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                    Especificação da Informação Requerida *
                                                </label>
                                                <textarea
                                                    required
                                                    rows={6}
                                                    value={esicForm.pedido}
                                                    onChange={(e) =>
                                                        setEsicForm({
                                                            ...esicForm,
                                                            pedido: e.target.value,
                                                        })
                                                    }
                                                    placeholder="Especifique de forma clara e precisa a informação pública desejada..."
                                                    className="input-field resize-none"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="btn-primary w-full py-3.5"
                                            >
                                                Registrar Solicitação LAI
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        )}

                        {view === "history" && (
                            <div className="bg-white rounded-3xl shadow-civic-sm p-8 border border-slate-200/80 animate-fade-in">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                                    <h2 className="font-heading text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                                        <History className="text-[#01b0ef]" size={20} />
                                        <span>Histórico de Solicitações</span>
                                    </h2>
                                    <button
                                        onClick={() => setView("dashboard")}
                                        className="text-xs font-bold text-[#01b0ef] hover:underline"
                                    >
                                        ← Voltar
                                    </button>
                                </div>
                                {pedidos.length === 0 ? (
                                    <p className="text-center py-12 text-slate-500 text-sm">
                                        Nenhum pedido encontrado para esta conta.
                                    </p>
                                ) : (
                                    <div className="space-y-3.5">
                                        {pedidos.map((p) => (
                                            <div
                                                key={p.id}
                                                className="p-5 bg-[#f4fbff] rounded-2xl border border-[#01b0ef]/20"
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-mono font-bold text-[#01b0ef]">
                                                        #{p.protocolo}
                                                    </span>
                                                    <span className="text-[11px] font-bold uppercase bg-[#fdb913] text-slate-900 px-2.5 py-0.5 rounded-full">
                                                        {p.status}
                                                    </span>
                                                </div>
                                                <p className="font-heading font-bold text-slate-900 text-sm mb-1">
                                                    {p.orgao}
                                                </p>
                                                <p className="text-xs text-slate-600 line-clamp-2">
                                                    &ldquo;{p.pedido}&rdquo;
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
