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
                                    São Tomé desmembrou-se do município de Santa Cruz – RN em 1928, quando passou a categoria de vila, mediante o requerimento de licença de “portas abertas”, solicitada pelo Senhor Tomás Barbosa de Moura, comerciante e fazendeiro de tradicional família latifundiária local, o qual foi reconhecido como fundador oficial deste município. O Senhor Tomás Barbosa de Moura doou também o terreno para a construção da Igreja matriz e o terreno no qual seria erguida a casa paroquial, cujo orago teve – ainda permanece – por invocação Nossa Senhora da Conceição, erguida pelos irmãos Inácio, Francisco, Julião e Romualdo Brasileiro de Andrade – os irmãos Andrade -, cuja ascendência era legitimamente portuguesa.
                                </p>
                                <p>
                                    Tomás Barbosa de Moura foi casado com a Senhora Maria Rosalinda de Moura, tendo como filhos Miguel Barbosa de Moura, Vicente Barbosa de Moura, Rafael Barbosa de Moura, José Amaro Barbosa de Moura, Domingas Barbosa de Moura e Máxima Barbosa de Moura. Tomás de Moura, como era vulgarmente conhecido em âmbito local, era originário da Fazenda Lagoa do Mato, na Ribeira do Jundiaí – atualmente município de Macaíba -, sendo o filho mais novo do sesmeiro Gonçalo Barbosa de Moura, citado acima, e de Joaquina Barbosa de Moura, e que teve como irmãos Maximiano Barbosa de Moura, fundador da Fazenda Caiçara dos Barbosas, atualmente localizada no município de Rui Barbosa, e Gonçalo Barbosa de Moura – chamado o novo – proprietário da Fazenda Carnaúba – que, posteriormente, viria à pertencer Domingos Cândido Lopes e sua esposa Aurita Lopes.
                                </p>
                                <p>
                                    O fundador do município de São Tomé, Tomás Barbosa de Moura, era senhor e possuidor das Fazendas Santa Luzia e Barreiros, onde se dedicava, juntamente com familiares, as lides com o algodão e o ao criatório de gado vacum e cavalar, dividindo seus afazeres do mundo rural com o comércio de pequena e média escala, pois, nos idos da década de 1910, estabeleceu uma casa comercial à margem direita do Rio Potengi, em terras que recebeu do espólio de herança de seu pai, Gonçalo Barbosa de Moura, onde passou a comprar e vender, dentre outras coisas, o algodão produzido pelos agricultores locais. A partir disso, Tomás Barbosa de Moura adquiriu uma propriedade (a Fazenda Santa Luzia) encravada na metade do caminho para Santa Cruz, principal destino do algodão que comprava nos arredores de sua “Bodega” – que durante anos serviu como topônimo para o povoado nascente -, cujo principal objetivo era servir de local “pouso”, ou seja, espaço de descanso, para as tropas que faziam o transporte daquele produto, em lombo de muares, que eram conduzidos por seus criados até Santa Cruz.
                                </p>
                                <p>
                                    Devido ao “vai-e-vem” não apenas no comércio, como também para fins de deveres cívicos e administrativos, bem como ao oneroso e desgastante trajeto realizado entre o povoado “Bodega” e a cidade de Santa Cruz, Tomás Barbosa de Moura escreve e escabeça uma representação – espécie de documento similar a um abaixo assinado -, no qual recolhe a assinatura de algumas figuras de proa do povoado Bodega e arredores, fazendeiros e comerciantes como ele, onde se destacavam os sobrenomes de integrantes das famílias Teixeira, Melo e Andrade, e entrega ao juiz de paz de Santa Cruz solicitando, por meio daquele documento, de licença de portas abertas, para poder comprar, vender, comerciar, assim como realizar seus deveres políticos e administrativos no próprio povoado que, naquela altura, 1928, já contava com três ruas – a saber as atuais Félix Medeiros, Barão do Rio Branco e Ladislau Galvão Pereira -, de casas de tijolos e devidamente enfileiradas. Apenas um ano depois, Tomás de Moura veio à óbito e, devido a todo o seu empenho e afinco para que o povoado que viria a constituir a cidade de São Tomé, tornar-se-ia, por honra, merecimento e reconhecimento, o fundador oficial da cidade de São Tomé, cujo primeiro prefeito viria a ser o Sr. Félix Gomes de Melo, filho secundogênito de tradicional família santa-cruzense, que através de sua rede familiar, do poder econômico e do sistema de alianças políticas de que dispunha, o habilitou a assumir e garantir a independência de São Tomé ante o julgo da elite política e econômica de Santa Cruz da qual fazia parte.
                                </p>
                                <p>
                                    Fato curioso, é que o nome atual do município e, anteriormente, da própria cidade, deve-se não a uma homenagem ao Apóstolo Tomé (São Tomé), mas sim a um fato, ocorrido entre os anos de 1924 e 1925, em meio a uma grande seca, na qual um homem faminto chegou a casa de um dos integrantes da família Andrade e pediu algo que pudesse saciar a sua fome; no entanto, naquele momento o dono da casa tinha apenas um pouco de mel em uma garrafa e o viajante, cansado e com fome, fez daquele mel uma garapa e o bebeu, após alguns instantes, saciado e reconfortado, disse: “Que santo Mé”” (em alusão ao mel que saciou sua fome e não ao apóstolo). Disso, resultou o topônimo.
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

