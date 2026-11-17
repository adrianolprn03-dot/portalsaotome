"use client";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import {
    Send,
    Phone,
    MapPin,
    Mail,
    Clock,
    CheckCircle2,
    Headset,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { MUNICIPIO } from "@/config/municipio";

export default function ContatoPage() {
    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        assunto: "",
        mensagem: "",
    });
    const [enviando, setEnviando] = useState(false);
    const [sucesso, setSucesso] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEnviando(true);
        try {
            const res = await fetch("/api/contato", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setSucesso(true);
                setFormData({ nome: "", email: "", assunto: "", mensagem: "" });
                setTimeout(() => setSucesso(false), 5000);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F9FC]">
            <PageHeader
                title="Fale Conosco"
                subtitle="Canais oficiais de atendimento presencial, telefônico e eletrônico da Prefeitura Municipal de São Tomé."
                variant="premium"
                icon={<Phone className="w-8 h-8" />}
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Contato" },
                ]}
            />

            <div className="max-w-[1240px] mx-auto px-6 py-14 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Informações de Contato Rápidas (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-civic-sm border border-slate-200/80">
                            <h3 className="font-heading text-lg font-extrabold text-[#071E3D] mb-6">
                                Sede Administrativa
                            </h3>

                            <div className="space-y-5">
                                <div className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 bg-primary-50 border border-primary-100 text-primary-600 rounded-xl flex items-center justify-center shrink-0">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Endereço
                                        </p>
                                        <p className="text-sm font-bold text-slate-800 mt-0.5">
                                            {MUNICIPIO.endereco}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            São Tomé/RN • CEP: {MUNICIPIO.cep}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 bg-primary-50 border border-primary-100 text-primary-600 rounded-xl flex items-center justify-center shrink-0">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Expediente ao Público
                                        </p>
                                        <p className="text-sm font-bold text-slate-800 mt-0.5">
                                            Segunda a Sexta-feira
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Das {MUNICIPIO.horario}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 bg-primary-50 border border-primary-100 text-primary-600 rounded-xl flex items-center justify-center shrink-0">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Telefone Central
                                        </p>
                                        <p className="text-sm font-mono font-bold text-slate-800 mt-0.5">
                                            {MUNICIPIO.telefone}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 bg-primary-50 border border-primary-100 text-primary-600 rounded-xl flex items-center justify-center shrink-0">
                                        <Mail size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            E-mail Oficial
                                        </p>
                                        <p className="text-sm font-bold text-slate-800 mt-0.5 break-all">
                                            {MUNICIPIO.email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#071E3D] rounded-3xl p-8 text-white shadow-civic-lg relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1.5 heraldic-stripe" />
                            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-secondary-400 mb-4">
                                <Headset size={20} />
                            </div>
                            <h3 className="font-heading text-lg font-extrabold mb-2">
                                Precisando da Ouvidoria?
                            </h3>
                            <p className="text-slate-300 text-xs leading-relaxed mb-6">
                                Para denúncias, reclamações, elogios ou sugestões formais com geração de protocolo oficial, utilize a Ouvidoria Municipal.
                            </p>
                            <Link
                                href="/servicos/ouvidoria"
                                className="inline-flex items-center gap-2 bg-secondary-500 hover:bg-secondary-400 text-[#071E3D] px-5 py-3 rounded-xl text-xs font-bold transition-all"
                            >
                                <span>Acessar Ouvidoria</span>
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>

                    {/* Formulário (8 cols) */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-civic-sm border border-slate-200/80">
                            <div className="mb-8 pb-6 border-b border-slate-100">
                                <h2 className="font-heading text-2xl font-extrabold text-[#071E3D] mb-1.5">
                                    Envie uma Mensagem
                                </h2>
                                <p className="text-slate-600 text-sm">
                                    Preencha os campos abaixo. Sua mensagem será encaminhada ao setor competente da administração municipal.
                                </p>
                            </div>

                            {sucesso && (
                                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-5 rounded-2xl mb-6 flex items-center gap-3.5 animate-fade-in">
                                    <CheckCircle2 className="text-emerald-600 shrink-0" size={22} />
                                    <div>
                                        <h4 className="font-bold text-sm">
                                            Mensagem enviada com sucesso!
                                        </h4>
                                        <p className="text-xs mt-0.5">
                                            Agradecemos seu contato. Nossa equipe responderá o mais breve possível.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-2">
                                            Nome Completo *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.nome}
                                            onChange={(e) =>
                                                setFormData({ ...formData, nome: e.target.value })
                                            }
                                            className="input-field"
                                            placeholder="Digite seu nome completo"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-2">
                                            E-mail para Retorno *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({ ...formData, email: e.target.value })
                                            }
                                            className="input-field"
                                            placeholder="seu@email.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-2">
                                        Assunto *
                                    </label>
                                    <select
                                        required
                                        value={formData.assunto}
                                        onChange={(e) =>
                                            setFormData({ ...formData, assunto: e.target.value })
                                        }
                                        className="input-field cursor-pointer"
                                    >
                                        <option value="">Selecione um assunto...</option>
                                        <option value="Dúvida Administrativa">
                                            Dúvida Administrativa
                                        </option>
                                        <option value="Solicitação de Serviço">
                                            Solicitação de Serviço
                                        </option>
                                        <option value="Tributário / IPTU">
                                            Tributário / IPTU / ISS
                                        </option>
                                        <option value="Recursos Humanos">
                                            Recursos Humanos / Servidores
                                        </option>
                                        <option value="Outros">Outros Assuntos</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-2">
                                        Mensagem *
                                    </label>
                                    <textarea
                                        required
                                        rows={6}
                                        value={formData.mensagem}
                                        onChange={(e) =>
                                            setFormData({ ...formData, mensagem: e.target.value })
                                        }
                                        className="input-field resize-none"
                                        placeholder="Descreva como podemos ajudar..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={enviando}
                                    className="btn-primary w-full sm:w-auto px-8 py-3.5 disabled:opacity-60"
                                >
                                    {enviando ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            <span>Enviar Mensagem</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
