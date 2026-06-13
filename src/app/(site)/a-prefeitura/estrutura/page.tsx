import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { getSecretariaIcon } from "@/lib/icons";
import { HiOutlineBuildingOffice2, HiOutlineDocumentArrowDown, HiOutlineArrowsRightLeft } from "react-icons/hi2";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Estrutura Administrativa (Organograma) | São Tomé – RN",
    description: "Conheça o organograma e a estrutura de governança da Prefeitura Municipal de São Tomé/RN.",
};

export default async function EstruturaPage() {
    // Busca as secretarias ativas diretamente do banco de dados
    const secretarias = await prisma.secretaria.findMany({
        orderBy: { nome: 'asc' }
    });

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <PageHeader
                title="Estrutura Administrativa"
                subtitle="Organograma hierárquico e distribuição das pastas que compõem a gestão do município."
                variant="premium"
                icon={<HiOutlineBuildingOffice2 className="w-8 h-8" />}
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "O Município", href: "/a-prefeitura" },
                    { label: "Estrutura Administrativa" }
                ]}
            />

            <div className="max-w-7xl mx-auto px-6 py-16 mb-20 relative z-10 w-full">
                
                {/* Organograma Visual (Imagem Oficial) */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-gray-200/50 border border-gray-100/50 mb-16 text-center">
                    <div className="flex flex-col items-center mb-8">
                        <span className="text-[10px] font-black text-[#0088b9] uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full mb-3 shadow-sm border border-blue-100/20">
                            Esquema Visual
                        </span>
                        <h3 className="font-black text-2xl md:text-3xl text-gray-800 tracking-tight leading-tight">
                            Organograma Oficial
                        </h3>
                        <p className="text-gray-400 text-sm mt-2 max-w-lg font-medium">
                            Representação gráfica da divisão hierárquica e das relações de coordenação entre os órgãos do município de São Tomé/RN.
                        </p>
                    </div>

                    {/* Contêiner da Imagem */}
                    <div className="relative rounded-3xl overflow-hidden border border-gray-100 bg-[#f8fafc] p-2 md:p-6 group/image">
                        <img 
                            src="/organograma.png" 
                            alt="Organograma Oficial da Prefeitura de São Tomé/RN" 
                            className="w-full h-auto object-contain rounded-2xl shadow-sm transition-transform duration-500 group-hover/image:scale-[1.01]"
                        />
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-wrap justify-center gap-4 mt-10">
                        <a 
                            href="/organograma.png" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-2.5 py-3.5 px-8 bg-[#0088b9] text-white rounded-full font-bold uppercase tracking-wider text-[10px] hover:bg-[#007099] transition-all hover:shadow-lg hover:shadow-blue-500/20"
                        >
                            <HiOutlineArrowsRightLeft className="w-4 h-4 rotate-45" />
                            Ampliar Organograma
                        </a>
                        <a 
                            href="/organograma.png" 
                            download="organograma-prefeitura-sao-tome.png" 
                            className="inline-flex items-center gap-2.5 py-3.5 px-8 bg-gray-100 text-gray-700 rounded-full font-bold uppercase tracking-wider text-[10px] hover:bg-gray-200 transition-all hover:shadow-sm"
                        >
                            <HiOutlineDocumentArrowDown className="w-4 h-4 text-gray-500" />
                            Baixar Imagem
                        </a>
                    </div>
                </div>

                {/* Secretarias e Setores Detalhados */}
                <div className="mt-8">
                    <div className="flex flex-col items-center mb-10 text-center">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full mb-3 shadow-sm border border-emerald-100/20">
                            Estrutura Detalhada
                        </span>
                        <h3 className="font-black text-2xl md:text-3xl text-gray-800 tracking-tight leading-tight">
                            Órgãos e Secretarias Ativas
                        </h3>
                        <p className="text-gray-400 text-sm mt-2 max-w-lg font-medium">
                            Acesse a página de cada secretaria para consultar as competências detalhadas, estrutura interna, contatos e gestor de cada pasta.
                        </p>
                    </div>

                    {secretarias.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                            <p className="text-gray-400 font-medium italic">Nenhuma secretaria cadastrada no momento.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {secretarias.map((sec: any) => {
                                const IconCard = getSecretariaIcon(sec.nome);

                                return (
                                    <Link 
                                        key={sec.id}
                                        href={`/secretarias/${sec.slug}`}
                                        className="group bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 p-6 hover:-translate-y-1 hover:border-primary-100 hover:shadow-primary-900/5 transition-all duration-300 flex items-start gap-4"
                                    >
                                        <div className="p-3 bg-blue-50 text-[#0088b9] rounded-xl group-hover:bg-[#0088b9] group-hover:text-white transition-colors shrink-0 shadow-inner">
                                            <IconCard size={22} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-extrabold text-gray-800 text-sm leading-snug group-hover:text-primary-600 transition-colors uppercase tracking-tight">
                                                {sec.nome}
                                            </h4>
                                            {sec.secretario && (
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 truncate">
                                                    Gestor: {sec.secretario}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Seção de Contatos Rápidos */}
                <div className="mt-16 text-center">
                    <Link 
                        href="/secretarias" 
                        className="inline-flex py-4 px-10 bg-gray-900 text-white rounded-full font-bold uppercase tracking-wider text-xs hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/10 hover:shadow-gray-900/20"
                    >
                        Ver Lista de Contatos dos Secretários
                    </Link>
                </div>

            </div>
        </div>
    );
}
