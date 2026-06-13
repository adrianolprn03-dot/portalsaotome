import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Iniciando seeding completo para São Tomé/RN...");

    // --- Usuário Admin ---
    const senhaHash = await bcrypt.hash("Admin123!", 10);
    await prisma.usuario.upsert({
        where: { email: "admin@saotome.rn.gov.br" },
        update: { senha: senhaHash },
        create: {
            nome: "Administrador São Tomé",
            email: "admin@saotome.rn.gov.br",
            senha: senhaHash,
            perfil: "admin",
        },
    });

    // --- Secretarias ---
    const secretarias = [
        { nome: "Gabinete do Prefeito", slug: "gabinete-prefeito", secretario: "José Miguel de Menezes Junior", email: "gabinete@saotome.rn.gov.br", telefone: "(84) 99169-3066", endereco: "Praça Antônio Assunção, s/n, Centro", horarioFuncionamento: "07h30 às 13h30" },
        { nome: "Controladoria Municipal", slug: "controladoria-municipal", secretario: "Lindomar Pereira da Silva", email: "controladoria@saotome.rn.gov.br", telefone: "(84) 99421-3736", endereco: "Praça Antônio Assunção, s/n, Centro", horarioFuncionamento: "07h30 às 13h30" },
        { nome: "Procuradoria Municipal", slug: "procuradoria-municipal", secretario: "Débora Vieira Fonseca", email: "procuradoria@saotome.rn.gov.br", telefone: "(84) 99417-1690", endereco: "Praça Antônio Assunção, s/n, Centro", horarioFuncionamento: "07h30 às 13h30" },
        { nome: "Secretaria de Administração e Planejamento", slug: "administracao-planejamento", secretario: "Teresa Cristina da Silva", email: "administracao@saotome.rn.gov.br", telefone: "(84) 99452-4900", endereco: "Praça Antônio Assunção, s/n, Centro", horarioFuncionamento: "07h30 às 13h30" },
        { nome: "Secretaria de Finanças e Tributação", slug: "financas-tributacao", secretario: "Jorge César Silva Ribeiro", email: "financas@saotome.rn.gov.br", telefone: "(84) 99467-3609", endereco: "Praça Antônio Assunção, s/n, Centro", horarioFuncionamento: "07h30 às 13h30" },
        { nome: "Secretaria de Educação, Cultura e Desporto", slug: "educacao-cultura-desporto", secretario: "Ana Edileuza Dantas", email: "educacao@saotome.rn.gov.br", telefone: "(84) 99415-8614", endereco: "Rua Coronel João Rodrigues, s/n", horarioFuncionamento: "07h30 às 17h00" },
        { nome: "Secretaria de Saúde", slug: "saude", secretario: "Katia Cristina Câmara de Oliveira", email: "saude@saotome.rn.gov.br", telefone: "(84) 99112-9423", endereco: "Rua Felinto Elísio, s/n", horarioFuncionamento: "07h00 às 17h00" },
        { nome: "Secretaria de Trabalho, Habitação e Assistência Social", slug: "assistencia-social", secretario: "Lucicarla Pereira da Silva", email: "social@saotome.rn.gov.br", telefone: "(84) 99218-3838", endereco: "Rua Padre Ramiro Varela, 613, Alto de São Sebastião", horarioFuncionamento: "07h30 às 13h30" },
        { nome: "Secretaria de Obras, Transporte e Serviços Urbanos", slug: "obras-servicos-urbanos", secretario: "Marithon Macário Santos de Andrade", email: "obras@saotome.rn.gov.br", telefone: "(84) 99168-5300", endereco: "Praça Antônio Assunção, s/n, Centro", horarioFuncionamento: "07h00 às 13h00" },
        { nome: "Secretaria de Agricultura, Meio Ambiente e Turismo", slug: "agricultura-meio-ambiente", secretario: "Jadiel Esdras Andrade", email: "agricultura@saotome.rn.gov.br", telefone: "(84) 99229-3714", endereco: "Praça Antônio Assunção, s/n, Centro", horarioFuncionamento: "07h30 às 13h30" },
        { nome: "Ouvidoria Municipal", slug: "ouvidoria-municipal", secretario: "Thamara Xavier Dias", email: "ouvidoria@saotome.rn.gov.br", telefone: "(84) 99211-5922", endereco: "Praça Antônio Assunção, s/n, Centro", horarioFuncionamento: "07h30 às 13h30" },
    ];

    for (const s of secretarias) {
        await prisma.secretaria.upsert({ where: { slug: s.slug }, update: s, create: { ...s, descricao: "Responsável pela gestão e serviços da pasta municipal de São Tomé." } });
    }

    // --- Notícias ---
    const noticias = [
        { titulo: "São Tomé recebe Selo Diamante na Sala do Empreendedor", slug: "saotome-selo-diamante-2026", resumo: "Destaque nacional em atendimento pelo SEBRAE.", conteudo: "<p>A Prefeitura de São Tomé conquistou o Selo Diamante de Referência em Atendimento do SEBRAE.</p>", publicada: true, destaque: true, publicadoEm: new Date() },
        { titulo: "Obras de pavimentação avançam em São Tomé", slug: "obras-pavimentacao-2026", resumo: "Melhorias na infraestrutura urbana.", conteudo: "<p>Novas ruas recebem pavimentação asfáltica.</p>", publicada: true, destaque: false, publicadoEm: new Date() },
    ];

    for (const n of noticias) {
        await prisma.noticia.upsert({ where: { slug: n.slug }, update: n, create: n });
    }

    // --- Configurações Detalhadas ---
    const configuracoes = [
        { chave: "municipio_nome", valor: "São Tomé", grupo: "geral" },
        { chave: "municipio_cnpj", valor: "08.080.210/0001-49", grupo: "geral" },
        { chave: "prefeitura_endereco", valor: "Praça Antônio Assunção, s/n, Centro, São Tomé/RN", grupo: "geral" },
        { chave: "prefeitura_telefone", valor: "(84) 99211-5922", grupo: "geral" },
        { chave: "prefeitura_email", valor: "ouvidoria@saotome.rn.gov.br", grupo: "geral" },
        { chave: "prefeito_nome", valor: "Josinaldo Amaro de Lima (Gá)", grupo: "gestao" },
        { chave: "prefeito_descricao", valor: "Josinaldo Amaro de Lima, conhecido como Gá, é the actual prefeito de São Tomé/RN, focado em promover o desenvolvimento sustentável e o bem-estar de toda a população são-tomeense.", grupo: "gestao" },
        { chave: "prefeito_mandato", valor: "2021 — 2024", grupo: "gestao" },
        { chave: "prefeito_partido", valor: "PSD", grupo: "gestao" },
        { chave: "prefeito_naturalidade", valor: "São Tomé/RN", grupo: "gestao" },
        { chave: "vice_nome", valor: "Lucinário Félix de Carvalho (Naro)", grupo: "gestao" },
        { chave: "vice_descricao", valor: "Lucinário Félix de Carvalho, o Naro, atua como vice-prefeito ao lado de Gá, trabalhando intensamente pelas melhorias estruturais e sociais do município.", grupo: "gestao" },
        { chave: "vice_mandato", valor: "2021 — 2024", grupo: "gestao" },
        { chave: "gestao_slogan", valor: "O TRABALHO SEGUE EM FRENTE", grupo: "gestao" },
        { chave: "contato_email", valor: "ouvidoria@saotome.rn.gov.br", grupo: "geral" },
        { chave: "contato_telefone", valor: "(84) 99211-5922", grupo: "geral" },
        
        // Símbolos
        { chave: "simbolo_brasao", valor: "/logo_oficial.png", grupo: "simbolos" },
        { chave: "simbolo_bandeira", valor: "/bandeira_oficial.png", grupo: "simbolos" },
        { chave: "simbolo_hino", valor: `I\nEntre matas, colinas e prados,\nSob um céu de anil e de luz,\nSurgiu São Tomé, abençoado,\nPela fé que ao progresso conduz.\n\nII\nTeu passado é de luta e glória,\nTeu presente é de paz e labor,\nEscrevemos com brio a história,\nDeste povo de imenso valor.\n\nREFRÃO\nSão Tomé, terra amada e querida,\nCoração deste solo potiguar,\nÉs a seiva que nutre a vida,\nOnde o sol vem primeiro brilhar.\n\nIII\nTua gente, herdeira da raça,\nTrabalha com fé e união,\nA justiça e a liberdade abraça,\nCom amor no fundo do coração.\n\nIV\nNo futuro que se descortina,\nVemos sempre a tua grandeza,\nTua estrela que nos ilumina,\nCom fartura e com muita beleza.`, grupo: "simbolos" },
        { chave: "simbolo_hino_audio", valor: "https://saotome.rn.gov.br/wp-content/uploads/2023/02/videoplayback.mp3", grupo: "simbolos" },
        
        // Dados Municipais
        { chave: "municipio_historia", valor: `O município de São Tomé, encravado no coração do Borborema Potiguar, possui uma trajetória marcada pelo pioneirismo de seus fundadores e pela resiliência de seu povo. A história oficial remonta ao final do século XIX, quando a região começou a se consolidar como um importante entreposto comercial e agropecuário.

O grande impulsionador do desenvolvimento local foi o senhor Tomás Barbosa de Moura, comerciante e fazendeiro que é reconhecido como o fundador oficial do município. Por volta de 1890, em torno de sua casa comercial, formou-se o povoado que atraía famílias de diversas regiões em busca de terras férteis e oportunidades no comércio de gado e algodão.

A emancipação política de São Tomé ocorreu através da Lei Estadual nº 698, de 29 de outubro de 1928, desmembrando-se de territórios que pertenciam a Santa Cruz, Currais Novos, Lajes e Macaíba. Poucos anos depois, em 29 de março de 1938, a localidade foi elevada à categoria de cidade, consolidando sua autonomia administrativa.

Uma das narrativas mais fascinantes da cidade diz respeito à origem de seu nome. Embora o padroeiro seja São Tomé, a tradição popular conta que um viajante, ao saborear um mel de excelente qualidade produzido na região, exclamou satisfeito: "Santo Mé!" (Mel Santo). Com o tempo, a expressão teria se transformado no nome da fazenda e, posteriormente, do próspero município.

Hoje, São Tomé se destaca pela hospitalidade de sua gente e por manter vivas suas tradições culturais e religiosas, tendo a Igreja Matriz de Nossa Senhora da Conceição como um de seus maiores marcos arquitetônicos e espirituais, fruto da doação de terras feita por seu fundador.`, grupo: "geral" },
        { chave: "municipio_populacao", valor: "11.234 habitantes (Censo 2022)", grupo: "geral" },
        { chave: "municipio_gentilico", valor: "São-tomeense", grupo: "geral" },
        { chave: "municipio_distancia_capital", valor: "112 KM", grupo: "geral" },
        { chave: "municipio_aniversario", valor: "29 de Outubro", grupo: "geral" },
    ];

    for (const c of configuracoes) {
        await prisma.configuracao.upsert({ where: { chave: c.chave }, update: c, create: { ...c, descricao: "Configuração oficial de São Tomé" } });
    }

    console.log("🌱 São Tomé/RN Completamente Configurado com Símbolos!");
}

main().then(() => prisma.$disconnect());
