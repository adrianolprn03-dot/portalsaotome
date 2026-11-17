"use client";
import { useState } from "react";
import {
    Search,
    HelpCircle,
    BarChart3,
    ShieldCheck,
    Phone,
    Mail,
    MapPin,
    Clock,
    ClipboardList,
    FileText,
    Smile,
    ArrowUpRight,
    Info,
    CheckCircle2,
    Headset,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";

const tipos = [
    { value: "reclamacao", label: "Reclamação" },
    { value: "denuncia", label: "Denúncia" },
    { value: "sugestao", label: "Sugestão" },
    { value: "elogio", label: "Elogio" },
    { value: "solicitacao", label: "Solicitação de Providência" },
];

const linksLaterais = [
    {
        label: "Perguntas Frequentes (FAQ)",
        href: "/transparencia/faq",
        icon: HelpCircle,
    },
    {
        label: "Estatísticas da Ouvidoria",
        href: "/transparencia/relatorios",
        icon: BarChart3,
    },
    {
        label: "Acompanhar Manifestação",
        href: "/servicos/consulta-protocolo",
        icon: Search,
    },
    {
        label: "Pesquisa de Satisfação",
        href: "/transparencia/pesquisa-satisfacao",
        icon: Smile,
    },
    {
        label: "Regulamentação Legal",
        href: "/transparencia/legislacao",
        icon: FileText,
    },
];

export default function OuvidoriaPage() {
    const [form, setForm] = useState({
        tipo: "",
        assunto: "",
        descricao: "",
        nome: "",
        email: "",
        anonimo: false,
    });
    const [enviando, setEnviando] = useState(false);
    const [protocolo, setProtocolo] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEnviando(true);
        try {
            const res = await fetch("/api/ouvidoria", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                setProtocolo(data.protocolo);
                toast.success("Manifestação registrada com sucesso!");
                setForm({
                    tipo: "",
                    assunto: "",
                    descricao: "",
                    nome: "",
                    email: "",
                    anonimo: false,
                });
            } else {
                toast.error("Erro ao enviar. Tente novamente.");
            }
        } catch {
            toast.error("Erro de conexão.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f4fbff]">
            <PageHeader
                title="Ouvidoria Municipal"
                subtitle="Canal oficial de participação social e comunicação direta do cidadão com a Prefeitura Municipal de São Tomé."
                variant="premium"
                icon={<Headset className="w-8 h-8" />}
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Serviços", href: "/servicos/ouvidoria" },
                    { label: "Ouvidoria" },
                ]}
            />

            <div className="max-w-[1240px] mx-auto px-6 py-14 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* COLUNA PRINCIPAL: Formulário (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between bg-white p-4 sm:px-6 rounded-2xl border border-[#01b0ef]/20 shadow-civic-sm">
                            <span className="text-xs font-semibold text-slate-600">
                                Já possui um protocolo aberto?
                            </span>
                            <Link
                                href="/servicos/consulta-protocolo"
                                className="btn-outline py-2 px-4 text-xs"
                            >
                                <Search size={14} className="text-[#01b0ef]" />
                                <span>Consultar Protocolo</span>
                            </Link>
                        </div>

                        {protocolo ? (
                            <div className="bg-white rounded-3xl shadow-civic-lg p-10 text-center border border-slate-200/80 animate-fade-in-up">
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h2 className="font-heading text-2xl font-extrabold text-slate-900 mb-2">
                                    Manifestação Registrada!
                                </h2>
                                <p className="text-slate-600 text-sm mb-6">
                                    Anote o número de protocolo abaixo para acompanhar o andamento:
                                </p>
                                <div className="bg-[#eefaff] border border-[#01b0ef]/30 rounded-2xl p-6 mb-6">
                                    <p className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider">
                                        Número de Protocolo Oficial
                                    </p>
                                    <p className="text-2xl font-mono font-bold text-[#01b0ef] tracking-wider break-all">
                                        {protocolo}
                                    </p>
                                </div>
                                <div className="bg-[#fdb913]/20 border border-[#fdb913]/50 rounded-xl p-4 mb-6 text-xs text-slate-900 font-medium">
                                    O prazo legal de resposta é de até{" "}
                                    <strong>30 dias corridos</strong>, prorrogáveis por mais 30 dias mediante justificativa (Lei Federal nº 13.460/2017).
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={() => setProtocolo(null)}
                                        className="flex-1 btn-primary py-3.5"
                                    >
                                        Nova Manifestação
                                    </button>
                                    <Link
                                        href="/servicos/consulta-protocolo"
                                        className="flex-1 btn-secondary py-3.5"
                                    >
                                        Consultar Protocolo
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl shadow-civic-sm p-8 md:p-10 border border-slate-200/80 relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-1.5 heraldic-stripe" />

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-[#01b0ef]/10 border border-[#01b0ef]/25 text-[#01b0ef] rounded-2xl flex items-center justify-center">
                                        <ClipboardList size={22} />
                                    </div>
                                    <div>
                                        <h2 className="font-heading text-xl font-extrabold text-slate-900">
                                            Formulário de Manifestação
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            Lei Federal nº 13.460/2017 (Código de Defesa do Usuário do Serviço Público)
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-[#eefaff] border border-[#01b0ef]/25 rounded-2xl p-4 mb-8 flex items-start gap-3">
                                    <Info className="text-[#01b0ef] mt-0.5 shrink-0" size={18} />
                                    <p className="text-xs text-slate-700 leading-relaxed">
                                        <strong>Prazo legal de atendimento:</strong> até 30 dias corridos (prorrogáveis por mais 30 dias). Seus dados pessoais são protegidos nos termos da LGPD (Lei nº 13.709/2018).
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Seção 1 */}
                                    <div className="border-b border-slate-100 pb-6">
                                        <h3 className="font-heading text-sm font-bold text-slate-900 mb-4 flex items-center gap-2.5">
                                            <span className="w-6 h-6 bg-[#01b0ef] text-white rounded-lg flex items-center justify-center text-xs font-mono font-bold">
                                                1
                                            </span>
                                            <span>Identificação do Manifestante</span>
                                        </h3>

                                        <div
                                            className="flex items-center gap-3 p-4 hover:bg-[#f4fbff] rounded-xl border border-slate-200/80 transition-colors cursor-pointer mb-4"
                                            onClick={() =>
                                                setForm({ ...form, anonimo: !form.anonimo })
                                            }
                                        >
                                            <input
                                                type="checkbox"
                                                id="anonimo"
                                                checked={form.anonimo}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        anonimo: e.target.checked,
                                                    })
                                                }
                                                className="w-4 h-4 accent-[#01b0ef] rounded cursor-pointer"
                                            />
                                            <label
                                                htmlFor="anonimo"
                                                className="text-xs font-semibold text-slate-700 cursor-pointer select-none flex items-center gap-2"
                                            >
                                                <ShieldCheck
                                                    size={15}
                                                    className="text-[#01b0ef]"
                                                />
                                                <span>
                                                    Desejo registrar uma manifestação anônima (Sigilo garantido)
                                                </span>
                                            </label>
                                        </div>

                                        {!form.anonimo && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                                                <div>
                                                    <label
                                                        htmlFor="nome-ouv"
                                                        className="block text-xs font-bold text-slate-700 mb-1.5"
                                                    >
                                                        Seu Nome
                                                    </label>
                                                    <input
                                                        id="nome-ouv"
                                                        type="text"
                                                        value={form.nome}
                                                        onChange={(e) =>
                                                            setForm({
                                                                ...form,
                                                                nome: e.target.value,
                                                            })
                                                        }
                                                        placeholder="Nome completo"
                                                        className="input-field"
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        htmlFor="email-ouv"
                                                        className="block text-xs font-bold text-slate-700 mb-1.5"
                                                    >
                                                        Seu E-mail
                                                    </label>
                                                    <input
                                                        id="email-ouv"
                                                        type="email"
                                                        value={form.email}
                                                        onChange={(e) =>
                                                            setForm({
                                                                ...form,
                                                                email: e.target.value,
                                                            })
                                                        }
                                                        placeholder="seu@email.com"
                                                        className="input-field"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Seção 2 */}
                                    <div>
                                        <h3 className="font-heading text-sm font-bold text-slate-900 mb-4 flex items-center gap-2.5">
                                            <span className="w-6 h-6 bg-[#fdb913] text-slate-900 rounded-lg flex items-center justify-center text-xs font-mono font-bold">
                                                2
                                            </span>
                                            <span>Detalhes da Manifestação</span>
                                        </h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label
                                                    htmlFor="tipo-ouv"
                                                    className="block text-xs font-bold text-slate-700 mb-1.5"
                                                >
                                                    Natureza da Manifestação *
                                                </label>
                                                <select
                                                    id="tipo-ouv"
                                                    required
                                                    value={form.tipo}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            tipo: e.target.value,
                                                        })
                                                    }
                                                    className="input-field cursor-pointer"
                                                >
                                                    <option value="">
                                                        Selecione a classificação...
                                                    </option>
                                                    {tipos.map((t) => (
                                                        <option
                                                            key={t.value}
                                                            value={t.value}
                                                        >
                                                            {t.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="assunto-ouv"
                                                    className="block text-xs font-bold text-slate-700 mb-1.5"
                                                >
                                                    Assunto / Órgão Relacionado *
                                                </label>
                                                <input
                                                    id="assunto-ouv"
                                                    type="text"
                                                    required
                                                    value={form.assunto}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            assunto: e.target.value,
                                                        })
                                                    }
                                                    placeholder="Resumo do assunto"
                                                    className="input-field"
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="descricao-ouv"
                                                    className="block text-xs font-bold text-slate-700 mb-1.5"
                                                >
                                                    Relato Detalhado *
                                                </label>
                                                <textarea
                                                    id="descricao-ouv"
                                                    required
                                                    rows={6}
                                                    value={form.descricao}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            descricao: e.target.value,
                                                        })
                                                    }
                                                    placeholder="Descreva com clareza os fatos, local e informações pertinentes..."
                                                    className="input-field resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={enviando}
                                        className="btn-primary w-full py-4 text-sm"
                                    >
                                        {enviando
                                            ? "Processando protocolo..."
                                            : "Registrar Manifestação Oficial"}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* SIDEBAR DIREITA (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-3xl shadow-civic-sm border border-slate-200/80 p-7">
                            <h3 className="font-heading text-base font-extrabold text-slate-900 mb-5 flex items-center gap-2">
                                <ShieldCheck className="text-[#01b0ef]" size={18} />
                                <span>Canais da Ouvidoria</span>
                            </h3>

                            <div className="space-y-4 text-xs">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 bg-[#01b0ef]/10 text-[#01b0ef] rounded-xl flex items-center justify-center shrink-0">
                                        <Phone size={15} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-400 uppercase text-[10px]">
                                            Telefone / WhatsApp
                                        </p>
                                        <p className="font-mono font-bold text-slate-800 mt-0.5">
                                            (84) 98748-0287
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 bg-[#01b0ef]/10 text-[#01b0ef] rounded-xl flex items-center justify-center shrink-0">
                                        <Mail size={15} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-400 uppercase text-[10px]">
                                            E-mail Oficial
                                        </p>
                                        <p className="font-bold text-slate-800 mt-0.5 break-all">
                                            ouvidoria@saotome.rn.gov.br
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 bg-[#01b0ef]/10 text-[#01b0ef] rounded-xl flex items-center justify-center shrink-0">
                                        <MapPin size={15} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-400 uppercase text-[10px]">
                                            Atendimento Presencial
                                        </p>
                                        <p className="font-bold text-slate-800 mt-0.5">
                                            Praça Antônio Assunção, s/n, Centro
                                        </p>
                                        <p className="text-slate-500">São Tomé/RN – 59400-000</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 bg-[#fdb913]/20 text-slate-900 rounded-xl flex items-center justify-center shrink-0">
                                        <Clock size={15} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-400 uppercase text-[10px]">
                                            Horário
                                        </p>
                                        <p className="font-bold text-slate-800 mt-0.5">
                                            Segunda a Sexta, 07h às 13h
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-civic-sm border border-slate-200/80 p-7">
                            <h3 className="font-heading text-base font-extrabold text-slate-900 mb-4">
                                Links Relacionados
                            </h3>
                            <div className="space-y-1.5">
                                {linksLaterais.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-center gap-3 text-xs font-semibold text-slate-700 hover:text-white hover:bg-[#01b0ef] px-3.5 py-2.5 rounded-xl transition-all group"
                                    >
                                        <link.icon
                                            size={15}
                                            className="text-[#01b0ef] group-hover:text-white transition-colors shrink-0"
                                        />
                                        <span className="flex-1">{link.label}</span>
                                        <ArrowUpRight
                                            size={13}
                                            className="text-slate-300 group-hover:text-[#fdb913] transition-colors"
                                        />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[#01b0ef] to-[#0096ce] rounded-3xl p-7 text-white shadow-civic-lg relative overflow-hidden border-b-4 border-[#fdb913]">
                            <h3 className="font-heading text-base font-extrabold mb-2 flex items-center gap-2">
                                <FileText size={17} className="text-[#fdb913]" />
                                <span>Pedido de Informação (e-SIC)</span>
                            </h3>
                            <p className="text-white/95 text-xs leading-relaxed mb-5">
                                Deseja solicitar documentos ou dados públicos com base na Lei de Acesso à Informação (LAI)?
                            </p>
                            <Link
                                href="/servicos/esic"
                                className="btn-secondary w-full py-3 text-xs"
                            >
                                Acessar Sistema e-SIC
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
