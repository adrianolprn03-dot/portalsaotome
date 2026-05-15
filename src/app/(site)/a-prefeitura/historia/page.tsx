import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
    title: "Nossa História | Prefeitura de São Tomé",
    description: "Conheça a história, origens e o desenvolvimento do município de São Tomé – RN.",
};

async function getConfig(chave: string, padrao: string) {
    const config = await prisma.configuracao.findUnique({ where: { chave } });
    return config?.valor || padrao;
}

export default async function HistoriaPage() {
    const historiaDb = await getConfig("municipio_historia", "");
    const hinoDb = await getConfig("simbolo_hino", "");
    const paragrafos = historiaDb ? historiaDb.split('\n\n').filter(p => p.trim() !== '') : [];

    return (
        <div className="min-h-screen bg-white">
            <PageHeader
                title="História de São Tomé"
                subtitle="Um mergulho nas raízes e no desenvolvimento de nossa amada terra."
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "A Prefeitura", href: "/a-prefeitura" },
                    { label: "História" }
                ]}
            />

            <div className="max-w-[900px] mx-auto px-6 py-20">
                <div className="prose prose-blue max-w-none prose-p:text-gray-600 prose-p:leading-relaxed prose-headings:text-gray-800 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter">
                    <section className="mb-16">
                        <div className="relative w-full h-[400px] rounded-[3rem] overflow-hidden mb-12 shadow-2xl shadow-blue-900/10">
                            <Image
                                src="/images/historia-panoramica.jpg"
                                alt="Vista panorâmica histórica de São Tomé"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-12">
                                <p className="text-white font-bold text-lg">Um legado de força e tradição no sertão potiguar.</p>
                            </div>
                        </div>

                        <h2>Dados do Município</h2>
                        <ul className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <li><strong>Fundação:</strong> 29/10/1928</li>
                            <li><strong>Aniversário:</strong> 29 de Outubro</li>
                            <li><strong>Gentílico:</strong> São-tomeense</li>
                            <li><strong>Unidade Federativa:</strong> Rio Grande do Norte</li>
                            <li><strong>Mesorregião:</strong> Agreste Potiguar</li>
                            <li><strong>Microrregião:</strong> Borborema Potiguar</li>
                            <li><strong>Distância para a capital:</strong> 112 KM</li>
                            <li><strong>População:</strong> 11.234 (Censo 2022)</li>
                        </ul>

                        <h2>História e Fundação</h2>
                        {paragrafos.length > 0 ? (
                            paragrafos.map((p, idx) => (
                                <p key={idx}>{p}</p>
                            ))
                        ) : (
                            <>
                                <p>
                                    O município de São Tomé, encravado no coração do Borborema Potiguar, possui uma trajetória marcada pelo pioneirismo de seus fundadores e pela resiliência de seu povo. A história oficial remonta ao final do século XIX, quando a região começou a se consolidar como um importante entreposto comercial e agropecuário.
                                </p>
                                <p>
                                    O grande impulsionador do desenvolvimento local foi o senhor Tomás Barbosa de Moura, comerciante e fazendeiro que é reconhecido como o fundador oficial do município. Por volta de 1890, em torno de sua casa comercial, formou-se o povoado que atraía famílias de diversas regiões em busca de terras férteis e oportunidades no comércio de gado e algodão.
                                </p>
                                <p>
                                    A emancipação política de São Tomé ocorreu através da Lei Estadual nº 698, de 29 de outubro de 1928, desmembrando-se de territórios que pertenciam a Santa Cruz, Currais Novos, Lajes e Macaíba. Poucos anos depois, em 29 de março de 1938, a localidade foi elevada à categoria de cidade, consolidando sua autonomia administrativa.
                                </p>
                                <p>
                                    Uma das narrativas mais fascinantes da cidade diz respeito à origem de seu nome. Embora o padroeiro seja São Tomé, a tradição popular conta que um viajante, ao saborear um mel de excelente qualidade produzido na região, exclamou satisfeito: "Santo Mé!" (Mel Santo). Com o tempo, a expressão teria se transformado no nome da fazenda e, posteriormente, do próspero município.
                                </p>
                                <p>
                                    Hoje, São Tomé se destaca pela hospitalidade de sua gente e por manter vivas suas tradições culturais e religiosas, tendo a Igreja Matriz de Nossa Senhora da Conceição como um de seus maiores marcos arquitetônicos e espirituais, fruto da doação de terras feita por seu fundador.
                                </p>
                                <h2>Clima e Vegetação</h2>
                                <p>
                                    <strong>Clima:</strong> O clima de São Tomé é caracterizado como semiárido, com temperaturas elevadas durante a maior parte do ano. O período chuvoso concentra-se entre os meses de fevereiro e maio.
                                </p>
                                <p>
                                    <strong>Vegetação:</strong> A vegetação predominante é a Caatinga, composta por espécies adaptadas à escassez de água, como o juazeiro, a catingueira e diversos tipos de cactos.
                                </p>
                            </>
                        )}
                    </section>

                    {hinoDb ? (
                        <section className="mb-16 p-12 bg-blue-50 rounded-[3rem] border border-blue-100 text-center">
                            <h2 className="text-blue-900 font-black uppercase tracking-widest mb-6">Hino de São Tomé</h2>
                            <div className="whitespace-pre-line text-blue-800 font-medium italic text-lg leading-relaxed">
                                {hinoDb}
                            </div>
                        </section>
                    ) : (
                        <section className="mb-16 p-12 bg-gray-50 rounded-[3rem] border border-gray-100 italic font-medium text-lg leading-relaxed text-gray-700 text-center">
                            "São Tomé é mais que um ponto no mapa; é o lar de um povo acolhedor e trabalhador que transformou a paisagem com suor e esperança."
                        </section>
                    )}


                    <section>
                        <h2>Símbolos Municipais</h2>
                        <p>
                            A Bandeira, o Brasão e o Hino de São Tomé representam o orgulho de pertencer a esta terra. O brasão, em particular, destaca a força da agricultura e a beleza das paisagens naturais, unindo o passado de lutas ao presente de conquistas.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

