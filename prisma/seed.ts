import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

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
        {
            nome: "Secretaria de Governo",
            slug: "secretaria-governo",
            secretario: "José Miguel de Menezes Junior",
            email: "governo@saotome.rn.gov.br",
            telefone: "(84) 99169-3066",
            endereco: "Praça Antônio Assunção, 276, Centro",
            horarioFuncionamento: "07h30 às 11h30 e 13h00 às 17h00",
            descricao: `A Secretaria Municipal de Governo é uma unidade de apoio imediato ao Chefe do Executivo Municipal, em suas atividades administrativas, de relações públicas e representação jurídica, social e política.

Das competências:
- Assessorar direta e indiretamente, ao Prefeito no desempenho de suas atribuições, especialmente na coordenação e na integração das ações de governo;
- Coordenar, acompanhar e executar as atividades administrativas do Gabinete do Prefeito;
- Exercer as atividades de representação civil e social do Prefeito;
- Acompanhar as atividades relacionadas com a tramitação de matérias na Câmara Municipal;
- Articular e coordenar as ações do governo, tanto em relação aos órgãos públicos e às instituições privadas;
- Controlar o cumprimento dos prazos de atos de competência do Prefeito, orientando quanto às providências necessárias e demais informações sobre os assuntos de sua alçada;
- Organizar e preparar as correspondências do Prefeito, bem como elaborar mensagens e outros documentos do chefe do poder executivo (projetos de lei, mensagens, leis, ofícios, memorandos), bem como promover e acompanhar a publicação dos atos oficiais, quando couber;
- Agendar as audiências e os compromissos do Chefe do Poder Executivo;
- Receber, acomodar e encaminhar autoridades e outras pessoas em espera por audiência com o Prefeito;
- Realizar outras atividades compatíveis com a destinação institucional do órgão;
- Instruir processos e outros documentos a serem submetidos ao Chefe do Executivo Municipal;
- Apoiar as Secretarias e Órgãos que compõem a estrutura administrativa, na operacionalização das atividades, projetos e ações;
- Dar suporte técnico na área de Planejamento, tais como: PPA, LDO e LOA, execução orçamentária e financeira;
- Elaborar minuta de Projeto de Lei, Decreto, Portarias entre outros atos do executivo;
- Assessorar o Prefeito nos despachos dos processos administrativos.

Estrutura básica:
- Secretário Municipal de Governo;
- Secretaria Adjunta;
- Coordenadoria Administrativa e Institucional;
- Assessoria Especial.`
        },
        {
            nome: "Controladoria Municipal",
            slug: "controladoria-municipal",
            secretario: "Lindomar Pereira da Silva",
            email: "controladoria@saotome.rn.gov.br",
            telefone: "(84) 99421-3736",
            endereco: "Praça Antônio Assunção, 276, Centro",
            horarioFuncionamento: "07h30 às 11h30 e 13h00 às 17h00",
            descricao: `O Sistema de Controle Interno do Poder Executivo tem por objetivo as fiscalizações contábeis, financeiras, orçamentária, bem como, a verificação e avaliação dos resultados obtidos pelos órgãos da administração municipal em geral.

Das competências administrativas:
- Examinar e fiscalizar previamente todos os atos da gestão municipal, quanto à legalidade dos processos administrativos, financeiros, licitatórios, de recursos humanos e operacionais, pelas administrações direta e indireta;
- Realizar o controle contábil, financeiro, orçamentário, operacional e patrimonial das entidades da Administração Direta, Indireta e fundacional, quanto à legalidade, legitimidade, economicidade, razoabilidade, aplicação das subvenções e renúncias de receitas;
- Acompanhar e orientar de forma contínua as aplicações constitucionais na área de educação, saúde, assistência social e outras, além dos limites estabelecidos na lei de responsabilidade fiscal, realizando as respectivas prestações de contas dos convênios, quando couber;
- Fiscalizar previamente a aplicação dos recursos públicos municipais recebidos de órgãos externos e/ou repassados aos órgãos internos ou às entidades dotadas de personalidade jurídica de direito privado;
- Acompanhar a aplicação dos créditos constantes do orçamento anual, bem como as modificações que se verificarem no curso do exercício e se a classificação das receitas está em conformidade com as determinações legais;
- Controlar a prestação de contas de convênios, suprimentos de fundo e acompanhamento de transferência de recursos às Secretarias municipais;
- Realizar auditorias técnicas, administrativas, financeiras e orçamentárias dos órgãos do poder executivo, quando entender conveniente ou de forma amostral, objetivando o controle legal, de mérito e técnico;
- Efetuar o exame posterior e obrigatório dos contratos e dos empenhos de despesas de qualquer natureza, decidindo quanto ao seu registro definitivo, desde que esteja condizente com o orçamento e com a minuta anteriormente examinada;
- Observar a aplicação dos recursos públicos no mercado financeiro nacional de títulos públicos e privados, bem como os provenientes das operações de crédito que o Município vier a contratar;
- Analisar e emitir parecer sobre as prestações de contas de responsabilidade do poder executivo e emitir relatórios anuais sobre as contas prestadas pelo Prefeito;
- Elaborar o balanço geral do município;
- Elaborar a prestação de contas do FUNDEB e respectivos balanços mensais e anuais;
- Representar o Prefeito quanto às prestações de contas junto ao TCE;
- Atender às diligências junto a outros órgãos;
- Realizar outras atividades compatíveis com a destinação institucional do órgão.

Estrutura básica:
- Controlador Geral;
- Coordenadoria de Controle Interno.`
        },
        {
            nome: "Procuradoria Municipal",
            slug: "procuradoria-municipal",
            secretario: "Débora Vieira Fonseca",
            email: "procuradoria@saotome.rn.gov.br",
            telefone: "(84) 99417-1690",
            endereco: "Praça Antônio Assunção, 276, Centro",
            horarioFuncionamento: "07h30 às 11h30 e 13h00 às 17h00",
            descricao: `A Procuradoria Geral do Município é o órgão de advocacia geral do Município, responsável pela representação judicial e extrajudicial, cabendo-lhe as atividades de consultoria e assessoria jurídica ao Poder Executivo Municipal.

Das competências:
- Representar o Município em juízo ou fora dele;
- Exercer as funções de consultoria jurídica e assessoramento técnico-legislativo ao Prefeito e aos demais órgãos da Administração Municipal;
- Emitir pareceres em processos administrativos, licitações, contratos e convênios;
- Elaborar minutas de projetos de lei, decretos e atos oficiais;
- Promover a cobrança amigável ou judicial da dívida ativa do Município;
- Realizar outras atividades compatíveis com a destinação institucional do órgão.`
        },
        {
            nome: "Secretaria de Administração e Planejamento",
            slug: "administracao-planejamento",
            secretario: "Teresa Cristina da Silva",
            email: "administracao@saotome.rn.gov.br",
            telefone: "(84) 99452-4900",
            endereco: "Praça Antônio Assunção, 276, Centro",
            horarioFuncionamento: "07h30 às 11h30 e 13h00 às 17h00",
            descricao: `A Secretaria Municipal de Administração e Recursos Humanos é o órgão responsável pelas atividades do sistema de administração geral, que compreende as atividades de pessoal, recursos humanos, material, patrimônio, arquivo e apoio às demais Secretarias Municipais.

Das competências de Administração e Recursos Humanos:
- Normatizar sobre o sistema de administração geral, planejamento, executando e acompanhando as atividades de pessoal, recursos humanos, compras, patrimônio, serviços e obras, transporte e arquivo;
- Coordenar e orientar a modernização administrativa e financeira, visando à racionalização, simplificação, agilização e atualização estrutural e funcional dos diversos setores;
- Gerir e desenvolver os recursos humanos da Administração Direta e Indireta por intermédio de programas para a valorização do servidor;
- Realizar o processamento da folha de pagamento dos servidores;
- Estabelecer as políticas e planos de desenvolvimento profissional, capacitando e motivando os empregados para a obtenção dos objetivos organizacionais;
- Planejar, desenvolver e coordenar a política geral de Gestão de Pessoas da administração direta e indireta;
- Desenvolver estudos, visando à racionalização e à otimização dos recursos humanos do município;
- Manter um banco de dados com as informações cadastrais dos servidores;
- Admitir, demitir e encaminhar a folha de pagamento de pessoal, incluindo todas as vantagens previstas na legislação municipal posse e lotação de pessoal;
- Realizar o cadastro, acompanhamento e manutenção dos registros de pessoal da administração pública direta e indireta para permitir a constituição de um banco de dados com as informações indispensáveis à gestão de pessoal do Município;
- Elaborar os atos necessários ao provimento, exoneração, demissão, cessão, relotação, redistribuição, afastamento, disponibilidade, aposentadoria e à declaração da vacância de cargos da Administração Direta;
- Coordenar e supervisionar a realização de concursos públicos para o funcionalismo em geral;
- Coordenar as atividades da Junta Médica do Município;
- Instaurar processo administrativo disciplinar ou sindicância para apuração de irregularidade no serviço público;
- Gerenciar o almoxarifado geral do município;
- Coordenar as atividades relacionadas com a gestão do sistema de informação Municipal, preservando a autonomia dos sistemas setoriais específicos;
- Promover e realizar o tombamento, o registro e o inventário dos bens móveis e imóveis do município, visando a manutenção permanente e atualizada dos bens patrimoniais;
- Realizar atividades dos serviços de conservação e limpeza, estabelecendo e uniformizando critérios de acompanhamento e controle desses serviços nas instalações dos equipamentos públicos do município;
- Controlar e manter o acervo de documentação, assegurando o acesso a ele e a disponibilização da informação;
- Coordenar e desenvolver as atividades voltadas para administração de formulários e racionalização de espaço físico;
- Gerenciar a frota de veículos e motocicletas próprios ou terceirizados, inclusive abastecimento, manutenção preventiva e corretiva;
- Elaborar as metas da Secretaria para compor o Plano Plurianual, de acordo com o plano de gestão da Prefeitura;
- Administrar os recursos financeiros destinados à Secretaria, de acordo com as diretrizes estabelecidas nos planos estratégicos da Prefeitura;
- Administrar os recursos humanos, quanto à frequência e desempenho dos colaboradores.

Estrutura básica:
- Secretário Municipal;
- Secretaria Adjunta;
- Diretoria de Folha de Pagamento;
- Coordenadoria de Pessoal e Recursos Humanos;
- Diretoria de Compras e Orçamentos;
- Coordenadoria de Patrimônio e Almoxarifado;
- Coordenadoria de Protocolo e Arquivo;
- Coordenadoria de Licitações e Contratos.`
        },
        {
            nome: "Secretaria de Finanças e Tributação",
            slug: "financas-tributacao",
            secretario: "Jorge César Silva Ribeiro",
            email: "financas@saotome.rn.gov.br",
            telefone: "(84) 99467-3609",
            endereco: "Praça Antônio Assunção, 276, Centro",
            horarioFuncionamento: "07h30 às 11h30 e 13h00 às 17h00",
            descricao: `A Secretaria Municipal de Tributação e Finanças é o órgão responsável por exercer a política tributária e financeira do Município, bem como as atividades referentes aos lançamentos, fiscalização, arrecadação dos tributos e demais rendas municipais.

Das competências administrativas:
- Formular a política financeira e tributária do Município;
- Fazer inspecionar processo de lançamento de tributos, corrigindo-o ou reformando-o, quando irregularmente executado;
- Fixar e alterar os limites das zonas e setores fiscais;
- Aprovar as tabelas de valores de terrenos, de custo de construção e do enquadramento das edificações e submetê-las ao Chefe do Executivo;
- Instruir e fazer instruir os contribuintes sobre o cumprimento da legalidade fiscal;
- Assinar conjuntamente com a contabilidade do Município, os boletins, balancetes, diários mensais, os balanços gerais e seus anexos, as prestações de contas e outros documentos de apuração contábil;
- Tomar conhecimento diariamente de movimentos econômicos e financeiros;
- Tomar conhecimento das denúncias de grandes infrações fiscais para a defesa do fisco municipal;
- Julgar em primeira instância os processos de reclamações contra lançamento e cobrança de tributos;
- Fazer fiscalizar a aplicação de crédito bem como de dotações orçamentárias;
- Apresentar relatórios ao Prefeito, sobre a situação fiscal do Município;
- Elaborar a Lei de Diretrizes Orçamentárias, a proposta orçamentária anual e o Plano Plurianual, em colaboração com os demais órgãos da prefeitura, de acordo com as políticas estabelecidas pelo governo municipal;
- Promover o controle da execução orçamentária de modo que a administração esteja permanentemente a par da execução dos programas ou planos de trabalho previstos no orçamento;
- Sistematizar, coordenar, executar, avaliar e controlar as atividades vinculadas à administração tributária e aos sistemas de fiscalização, arrecadação, informações econômico-fiscais, bem como quanto ao sistema financeiro e contábil;
- Executar a política fiscal do Município;
- Administrar a Dívida Ativa do Município;
- Expedir regulamentos e Portarias Internas sobre matérias administrativas da Secretaria.

Estrutura básica:
- Secretário Municipal;
- Secretaria Adjunta;
- Diretoria de Planejamento e Arrecadação;
- Diretoria de Controle e Fiscalização;
- Coordenadoria de Tributos e Dívida Ativa.`
        },
        {
            nome: "Secretaria de Educação, Cultura e Desporto",
            slug: "educacao-cultura-desporto",
            secretario: "Ana Edileuza Dantas",
            email: "educacao@saotome.rn.gov.br",
            telefone: "(84) 99415-8614",
            endereco: "Praça Antônio Assunção, 276, Centro",
            horarioFuncionamento: "07h30 às 11h30 e 13h00 às 17h00",
            descricao: `A Secretaria Municipal de Educação, Cultura e Desporto é o órgão responsável pelo planejamento, organização, coordenação, execução e controle de programas, projetos e atividades voltados para a educação, cultura e desporto do Município.

Das competências administrativas:
- Organizar, administrar, supervisionar, controlar e avaliar a ação municipal no campo da educação;
- Articular-se com Órgãos dos Governos Federal e Estadual, assim como aqueles de âmbito Municipal para o desenvolvimento de políticas e para a elaboração de legislação educacional, em regime de parceria;
- Apoiar e orientar a iniciativa privada no campo da educação;
- Administrar, avaliar e controlar o Sistema de Ensino Municipal promovendo sua expansão qualitativa e atualização permanente;
- Implantar e implementar políticas públicas que assegurem o aperfeiçoamento do ensino e da aprendizagem de alunos, professores e servidores;
- Estudar, pesquisar e avaliar os recursos financeiros para o custeio e investimento no sistema educacional, assegurando sua plena utilização e eficiente operacionalidade;
- Propor e executar medidas que assegurem processo contínuo de renovação e aperfeiçoamento dos métodos e técnicas de ensino;
- Integrar suas ações às atividades culturais e esportivas do município;
- Pesquisar, planejar e promover o aperfeiçoamento e a atualização permanentes das características e qualificações do magistério e da população estudantil, atuando de maneira compatível com os problemas identificados;
- Assegurar às crianças, jovens e adultos, no âmbito do sistema educacional do Município, as condições necessárias de acesso, permanência e sucesso escolar;
- Planejar, orientar, coordenar e executar a política relativa ao programa de assistência escolar, no que concerne a sua suplementação alimentar, como merenda escolar e alimentação dos usuários de creches e demais serviços públicos;
- Proceder, no âmbito do seu Órgão, à gestão e ao controle financeiro dos recursos orçamentários previstos na sua Unidade, bem como à gestão de pessoas e recursos materiais existentes, em consonância com as diretrizes e regulamentos emanados do Chefe do Poder Executivo;
- Implantar política de qualificação profissional, quando necessário, na área artístico-cultural;
- Efetuar o estudo e a implementação de programas voltados ao desenvolvimento cultural dos alunos, mediante a inclusão de disciplinas relacionadas às artes, à música, e aos usos e costumes dos diferentes grupos étnicos brasileiros;
- Exercer ação redistributiva em relação às escolas municipais;
- Baixar normas complementares para o sistema municipal de ensino;
- Autorizar, credenciar e supervisionar os estabelecimentos do sistema municipal de ensino;
- Oferecer a educação infantil e com prioridade o ensino fundamental, observando o que determina a Lei de Diretrizes e Bases da Educação Nacional (Lei Federal nº 9394/1996);
- Estabelecer mecanismos para avaliar a qualidade do processo educativo desenvolvido pelas escolas públicas municipais e da iniciativa privada;
- Planejar e coordenar programas e planos de esportes, recreação e lazer dirigidos às várias faixas etárias;
- Programar eventos desportivos de caráter popular;
- Desenvolver, promover, divulgar e controlar as atividades esportivas e de lazer do Município, estimulando o hábito de esporte nas comunidades.

Estrutura básica:
- Secretário Municipal;
- Secretaria Adjunta;
- Coordenadoria do Ensino Infantil;
- Coordenadoria do Ensino Fundamental I;
- Coordenadoria do Ensino Fundamental II;
- Coordenadoria do EJA;
- Coordenadoria de Educação Especial;
- Coordenadoria de Alimentação Escolar;
- Diretoria da Cozinha Alternativa;
- Coordenadoria do Transporte Escolar;
- Departamento de Administração da Biblioteca e Sala de Leitura;
- Coordenadoria de Eventos e Atividades Culturais;
- Coordenadoria de Eventos e Atividades Esportivas.`
        },
        {
            nome: "Secretaria de Saúde",
            slug: "saude",
            secretario: "Katia Cristina Câmara de Oliveira",
            email: "saude@saotome.rn.gov.br",
            telefone: "(84) 99112-9423",
            endereco: "Praça Antônio Assunção, 276, Centro",
            horarioFuncionamento: "07h30 às 11h30 e 13h00 às 17h00",
            descricao: `A Secretaria Municipal de Saúde é o órgão responsável pelo planejamento, organização, coordenação e execução dos programas, projetos e atividades voltados para a implantação das políticas de saúde do Município.

Das competências administrativas:
- Planejar, organizar, controlar, coordenar e executar a política de saúde do município, através da implementação do sistema municipal de saúde e do desenvolvimento de ações de promoção, proteção e recuperação da saúde da população com a realização integrada de atividades assistenciais e preventivas;
- Promover campanhas educacionais e informativas, visando a preservação das condições de saúde da população;
- Coordenar e executar a realização de programas e ações de saúde bucal, da família, do adulto e do idoso, da criança e do adolescente, da mulher, da saúde mental e do serviço social;
- Realizar o controle, avaliação e a auditoria das ações municipais de saúde, por meio de um sistema integrado de informações;
- Exercer a fiscalização e o controle das condições sanitárias, higiênicas, de saneamento, alimentação e nutrição e saúde do trabalhador;
- Fiscalizar as agressões ao meio ambiente que tenham repercussão sobre a saúde humana;
- Desenvolver atividades supletivas de serviços médicos, paramédicos e farmacêuticos com órgãos federais e estaduais, bem como gerenciar a municipalização de programas federais;
- Coordenar e fiscalizar o Sistema Único de Saúde no âmbito do Município e administrar a rede hospitalar municipal, compreendidos os centros clínicos, maternidades, hospitais, unidades mistas e postos de saúde;
- Acompanhar a manutenção dos equipamentos médicos/hospitalares do município, realizando periodicamente vistorias às instalações municipais de saúde, a fim de garantir uma melhor utilização dos equipamentos quanto ao atendimento prestados aos cidadãos do município;
- Oferecer à população a prestação de serviços médicos e ambulatoriais de urgência e de emergência;
- Realizar o controle de zoonoses e gerenciar as ações de vigilância sanitária, epidemiológica e ambiental em conjunto com a comunidade e com a iniciativa privada;
- Elaborar as metas da Secretaria para compor o Plano Plurianual, de acordo com o plano de gestão da Prefeitura;
- Administrar os recursos financeiros destinados à Secretaria, de acordo com as diretrizes estabelecidas nos planos estratégicos da Prefeitura;
- Elaborar, em conjunto com a Secretaria de Administração e Recursos Humanos, um programa de capacitação e desenvolvimento dos servidores da área de saúde, para um atendimento com melhor qualidade à população do município;
- Administrar os recursos humanos, quanto à frequência e desempenho dos colaboradores;
- Criar e operar as unidades de saúde;
- Exercer a vigilância sanitária e controle de medicamentos, drogas, insumos, produtos farmacêuticos, cosméticos, saneamento e outros produtos do interesse da saúde da população;
- Celebrar convênios, acordos e contratos com entidades, públicas ou privadas, visando ao melhor aproveitamento dos recursos humanos, materiais e financeiros;
- Realizar outras atividades compatíveis com a destinação institucional do órgão.

Estrutura básica:
- Secretário Municipal;
- Secretaria Adjunta;
- Diretoria das Unidades de Saúde;
- Diretoria de Regulação e Transporte Sanitário;
- Coordenadoria de Vigilância Sanitária;
- Coordenadoria de Atenção Primária;
- Diretoria de Assistência e Farmácia Básica;
- Diretoria de Gestão Hospitalar.`
        },
        {
            nome: "Secretaria de Trabalho, Habitação e Assistência Social",
            slug: "assistencia-social",
            secretario: "Lucicarla Pereira da Silva",
            email: "assistenciasocial@saotome.rn.gov.br",
            telefone: "(84) 99218-3838",
            endereco: "Rua Padre Ramiro Varela, 613, Alto de São Sebastião",
            horarioFuncionamento: "07h30 às 11h30 e 13h00 às 17h00",
            descricao: `A Secretaria Municipal do Trabalho, Habitação e Assistência Social é o órgão responsável pelas atividades de assistência social aos habitantes do município, bem como pela promoção do bem-estar e da melhoria das condições de vida da sociedade, com ênfase na habitação e na geração de emprego e renda.

Das competências administrativas:
- Realizar conferências municipais de assistência social, conforme as diretrizes nacionais da Lei Orgânica de Assistência Social – LOAS;
- Implementar o sistema de informações do SUAS municipal, em conformidade com as diretrizes do Ministério do Desenvolvimento Social e do Combate à Fome;
- Realizar a proteção social básica, prevenindo situações de risco por meio do desenvolvimento de potencialidade e aquisições, e o fortalecimento de vínculos familiares e comunitários, destinado à população que vive em situação de vulnerabilidade social decorrente da pobreza, privação e fragilização de vínculos afetivos-relacionais e de pertencimento social;
- Realizar a proteção social especial destinado a famílias e indivíduos que se encontram em situação de risco pessoal e/ou social, por ocorrência de abandono, maus tratos físicos e/ou psíquicos, abuso sexual, uso de substâncias psicoativas, situação de rua, situação de trabalho infantil entre outras;
- Fomentar, articular e implementar políticas de apoio ao portador de necessidades especiais, proporcionando-lhe os instrumentos e oportunidades de trabalho, lazer, habitação, mobilidade e acessibilidade, mediante parcerias com órgãos federais, estaduais, municipais e entidades civis;
- Prestar serviços de assistência social, através de benefícios, serviços assistenciais, programas e projetos de enfrentamento à pobreza;
- Prestar suporte técnico e administrativo aos conselhos municipais de assistência social, nos direitos da criança e do adolescente tutelar, do idoso, emprego, segurança alimentar e nutricional e de proteção às pessoas com deficiência;
- Implementar a descentralização da assistência social, fomentando entidades filantrópicas, públicas ou privadas, observando a legislação atinente em vigor;
- Estimular a organização comunitária, habilitando a população a construir ou resgatar a sua cidadania, com vistas a melhores condições de vida;
- Propor e efetivar a política de trabalho e da assistência social através de programas, projetos e ações de geração de renda, promoção e atenção à criança e ao adolescente, à pessoa com deficiência, ao idoso, à mulher e demais usuários da assistência social do Município de São Tomé;
- Criar e implementar políticas de trabalho e renda voltadas para programas que criem postos de trabalho de maneira solidária, fomentando a criação de associações que propiciam o desenvolvimento local de cada comunidade do Município;
- Oferecer instrumentos e estratégias de incentivo ao trabalho, ocupação e geração de resultados do trabalho, oportunidades de trabalho e habitação;
- Fomentar o estabelecimento e o aperfeiçoamento das redes sociais municipais, integrando a ação das entidades empresariais e sociais;
- Elaborar o plano municipal de habitação, para ordenamento da política habitacional do município;
- Promover programas de habitação popular em articulação com os organismos municipais, estaduais, federais e internacionais, públicos ou privados, visando obter recursos financeiros e tecnológicos para o desenvolvimento urbano e de programas habitacionais, no âmbito do Município;
- Estimular a pesquisa de formas alternativas de construção possibilitando a redução dos custos;
- Estabelecer, de acordo com as diretrizes do Plano Diretor Participativo do Município, ou outros instrumentos compatíveis, e de forma integrada à Região, programas destinados a facilitar o acesso da população de baixa renda à habitação, bem como à melhoria da moradia e das condições de habitabilidade como elemento essencial no atendimento do princípio da função social da cidade;
- Estimular a iniciativa privada a contribuir para promover a melhoria das condições habitacionais e aumentar a oferta de moradias adequadas e compatíveis com a capacidade econômica da população;
- Articular a regularização e a titulação das áreas ocupadas pela população de baixa renda, passíveis de implantação de programas habitacionais;
- Elaborar as metas da Secretaria para compor o Plano Plurianual, de acordo com o plano de gestão da Prefeitura;
- Administrar os recursos financeiros destinados à Secretaria, de acordo com as diretrizes estabelecidas nos planos estratégicos da Prefeitura;
- Realizar outras atividades compatíveis com a destinação institucional do órgão.

Estrutura básica:
- Secretário Municipal;
- Secretaria Adjunta;
- Coordenadoria de Habitação de Interesse Social;
- Coordenadoria de Gestão do SUAS;
- Coordenadoria do CRAS;
- Coordenadoria do SCFV;
- Coordenadoria de Projetos de Geração de Emprego e Renda;
- Coordenadoria de Promoção à Igualdade Racial;
- Diretoria de Programas e Projetos Sociais.`
        },
        {
            nome: "Secretaria de Obras, Transporte e Serviços Urbanos",
            slug: "obras-servicos-urbanos",
            secretario: "Marithon Macário Santos de Andrade",
            email: "obras_servicos@saotome.rn.gov.br",
            telefone: "(84) 99168-5300",
            endereco: "Rua João Gonçalves de Andrade, 187, Centro",
            horarioFuncionamento: "07h30 às 11h30 e 13h00 às 17h00",
            descricao: `A Secretaria Municipal de Obras, Transportes e Serviços Urbanos é o órgão responsável pela execução de serviços voltados à conservação de vias, obras e patrimônio públicos municipais, bem como ações voltadas ao planejamento urbano, mobilidade urbana e transporte.

Das competências de Obras:
- Atuar na fiscalização de contratos para execução de projetos viários, sistemas de drenagem, pavimentação geotecnia e geometria de vias;
- Prestar esclarecimentos e analisar solicitações de terceiros, por intermédio dos Termos de Compromisso e Autorização (TCA);
- Fiscalizar os contratos de obras de construção e recuperação de infraestrutura do Município;
- Projetar, programar, executar e fiscalizar a construção de edifícios públicos;
- Aprovar e autorizar a ocupação do leito das vias públicas por equipamentos a serem implantados por entidades de direito público e privado;
- Examinar o planejamento de obras e serviços que venham a se desenvolver nas vias e logradouros públicos;
- Organizar e manter o cadastro de instalações e equipamentos existentes;
- Ser responsável pela execução de obras de drenagem, sistemas viários, e recuperações;
- Fiscalizar e acompanhar as obras de macrodrenagem, que consistem na construção de galerias;
- Promover a contenção de margens de córregos;
- Executar a construção de lagoas de drenagem;
- Promover o manejo e a gestão dos Resíduos Sólidos Domiciliares gerados no Município de São Tomé, em cooperação com a Coordenadoria de Meio Ambiente;
- Prestar atendimento emergencial em ocasiões de chuvas intensas, que podem causar riscos à vida e ao patrimônio público e privado;
- Executar obras de recuperação estrutural de estradas.

Das competências de Transportes:
- Execução da política de diretrizes voltadas para os setores de transportes urbanos do Município;
- Controle de concessões para o funcionamento de serviços de transportes coletivos e táxis;
- Administração dos serviços de transporte interno;
- Administração, manutenção e conservação da frota de veículos da Prefeitura;
- Administração da garagem municipal;
- Promover a conservação e sinalização das estradas.

Das competências de Serviços Urbanos:
- Desenvolver processo permanente e contínuo de acompanhamento, avaliação e aprimoramento da legislação relativa ao planejamento e desenvolvimento urbano;
- Coordenar o desenvolvimento de projetos urbanos interagindo com os órgãos e entidades da Administração Direta e Indireta, com outras esferas de governo e com a sociedade civil;
- Promover a integração dos planos, programas e projetos dos diversos órgãos e entidades da Administração Direta e Indireta relacionados ao desenvolvimento urbano, de forma a maximizar os resultados positivos para o Município;
- Desenvolver e consolidar planos de desenvolvimento urbano de médio e longo prazo, considerando o uso e ocupação do solo;
- Formular políticas, diretrizes e ações que propiciem o posicionamento do Município em questões relacionadas ao seu desenvolvimento urbano, incluindo as que decorram de sua inserção em planos nacionais, regionais, estaduais e metropolitanos;
- Desenvolver os mecanismos e modelos mais adequados para a viabilização e implementação de projetos de desenvolvimento urbano, explorando as potenciais parcerias com a iniciativa privada, com outros setores das políticas públicas e com outras esferas de governo, utilizando os instrumentos de política urbana;
- Coordenar, organizar, manter, atualizar e disponibilizar permanentemente o sistema municipal de informações sociais, culturais, econômicas, financeiras, patrimoniais, administrativas, físico-territoriais, inclusive cartográficas e geológicas, ambientais, imobiliárias e outras de relevante interesse para o Município, progressivamente georreferenciadas em meio digital;
- A elaboração, o acompanhamento, o controle e a implementação do Plano Diretor do Município, se houver, e dos demais instrumentos que lhe são complementares, em articulação com a Coordenadoria de Meio Ambiente e com a Coordenadoria de Turismo;
- A manutenção da planta cadastral do Município, para efeito de disciplinamento da expansão urbana, e do licenciamento de obras e edificações particulares, em apoio às atividades de tributação e fiscalização de bens imóveis localizados no Município;
- O acompanhamento e a coordenação do cumprimento do plano de urbanização do Município, especialmente no que se refere à abertura ou construção de vias e logradouros públicos, elaborando projetos, em articulação com os órgãos competentes;
- Promover a identificação e avaliação das ameaças, suscetibilidades e vulnerabilidades a desastres, de modo a evitar ou reduzir sua ocorrência;
- Promover a fiscalização e o monitoramento das áreas de risco de desastres e vedar a ocupação de novas áreas;
- Vistoriar edificações e áreas de risco e promover, quando for o caso, a intervenção preventiva e a evacuação da população das áreas de alto risco ou das edificações vulneráveis;
- Promover a continuidade das ações de proteção e defesa civil.

Estrutura básica:
- Secretário Municipal;
- Secretaria Adjunta;
- Diretoria de Obras e Projetos;
- Coordenadoria de Limpeza Urbana e Serviços Gerais;
- Diretoria de Serviços Urbanos;
- Coordenadoria de Serviços de Transporte e Mobilidade Urbana;
- Coordenadoria da Proteção e Defesa Civil.`
        },
        {
            nome: "Secretaria de Agricultura, Meio Ambiente e Turismo",
            slug: "agricultura-meio-ambiente",
            secretario: "Jadiel Esdras Andrade",
            email: "agricultura@saotome.rn.gov.br",
            telefone: "(84) 99229-3714",
            endereco: "Praça Antônio Assunção, 276, Centro",
            horarioFuncionamento: "08h30 às 14h00",
            descricao: `A Secretaria Municipal de Agricultura, Meio Ambiente e Turismo é o órgão responsável em elaborar e executar projetos vinculados a tecnologias apropriadas ao desenvolvimento da agricultura e dos recursos hídricos em perfeita harmonia com o meio ambiente e com o desenvolvimento do turismo de forma sustentável.

Das competências da Agricultura:
- Desenvolver política de fomento nas áreas de agricultura, pesca e comercialização de seus respectivos produtos;
- Atuar na expansão e no desenvolvimento da agricultura familiar;
- Estimular os sistemas de produção integrados de piscicultura, agricultura e pecuária, com o fornecimento de alevinos, sementes e mudas, orientações sobre técnicas de produção e facilitação do uso de maquinários específicos;
- Adotar políticas que viabilizem o desenvolvimento da agropecuária e dos sistemas de abastecimento municipal;
- Promover a execução de planos, programas, projetos, atividades e ações relacionadas com a melhoria de vida do homem do campo;
- Promover a execução de estudos, pesquisas, que visem melhorar a produção e produtividade do sector agrícola;
- Assegurar medidas que visem aumentar a eficiência dos sistemas de comercialização;
- Viabilizar a celebração de convênios e contratos com entidades internacionais, federais e estaduais, além de empresas privadas, visando o aperfeiçoamento técnico-administrativo dos servidores da secretaria;
- Desenvolver atividades e projetos com o escopo de preservar e proteger os recursos hídricos e meio ambiente;
- Planejar e executar projetos para melhoria dos sistemas de abastecimento de água nas comunidades rurais do município;
- Manter atualizado os dados relativos à infraestrutura hídrica existente no município, tais como: poços, cacimbas, barragem, barreiros, açudes;
- Planejar e executar o Sistema de Inspeção Municipal (SIM);
- Executar ações de fiscalização e Inspeção Municipal nos termos da legislação em vigor;
- Elaborar as metas da Secretaria para compor o Plano Plurianual, de acordo com o plano de gestão da Prefeitura;
- Administrar os recursos financeiros destinados à Secretaria, de acordo com as diretrizes estabelecidas nos planos estratégicos da Prefeitura;
- Administrar os recursos humanos, quanto à frequência e desempenho dos servidores;
- Realizar outras atividades compatíveis com a destinação institucional do órgão.

Das competências de Meio Ambiente:
- Funcionar plenamente como órgão municipal de meio ambiente, realizando a concepção, desenvolvimento e execução da Política Municipal de Meio Ambiente, exercendo a fiscalização das atividades econômicas ou empreendimentos que causem ou possam causar degradação ambiental no Município;
- Efetivar o cumprimento das leis ambientais emitidas nos âmbitos municipal, estadual e federal;
- Estabelecer os padrões e mecanismos de qualidade e controle ambiental nas intervenções setoriais que possam vir a comprometer a preservação, melhoria e recuperação da qualidade ambiental, objetivo central da Política Nacional de Meio Ambiente e da Política Municipal de Meio Ambiente;
- Administrar e executar o licenciamento ambiental da construção, instalação, ampliação e funcionamento de estabelecimentos e atividades utilizadoras de recursos ambientais, considerados efetiva ou potencialmente poluidores, bem como os capazes, sob qualquer forma, de causar degradação ambiental com impacto local, executando também a respectiva fiscalização e controle ambiental dos mesmos empreendimentos e operações;
- Anuir, recepcionar, manter e, quando necessário, apresentar publicamente a informação técnica ambiental no âmbito dos processos de licenciamento ambiental de competência dos órgãos ou entidades responsáveis pela execução da política de meio ambiente em nível federal e estadual;
- Exigir, para empreendimentos e atividades licenciados, fiscalizados e monitorados pelo Município, os estudos e programas ambientais correspondentes ao grau de impacto sobre o meio ambiente e o patrimônio sociocultural, coordenando, conforme o caso, as respectivas audiências públicas e/ou consultas técnicas;
- Controlar a qualidade ambiental do Município, mediante o levantamento, a fiscalização e o monitoramento permanente dos seus recursos naturais e exercendo o controle das fontes de poluição de todo gênero, de forma a garantir o cumprimento dos padrões de emissão estabelecidos pelas normas nacionais e o desenvolvimento sustentável do Município;
- Adotar as medidas de preservação e conservação dos recursos naturais do Município, propondo, quando pertinente, a criação e gestão de unidades de conservação, bem como administrar parques, hortos florestais, jardins zoológicos e outros logradouros públicos, além de programar e executar a arborização de parques, jardins, praças públicas e logradouros, abrangendo com isso tanto a sede municipal quanto os seus distritos;
- Aplicar, no âmbito do município de São Tomé, as penalidades por infração às normas de proteção ambiental federal, estadual e municipal, de acordo com o que estabelece a legislação em vigor;
- Baixar, mediante portaria e/ou instrução normativa, as normas técnicas e administrativas necessárias à regularização da Política Municipal de Meio Ambiente, mediante, quando for o caso, de parecer(es) do Conselho Municipal do Meio Ambiente;
- Promover pesquisas, debates e estudos técnicos no âmbito da proteção ambiental e da sustentabilidade, contribuindo para o desenvolvimento de tecnologias ecológicas e posturas ambientalmente favoráveis;
- Desenvolver programas de educação ambiental que contribuam para a melhor compreensão social dos problemas sanitários ambientais do Município;
- Formalizar e celebrar convênios, ajustes, acordos, termos de cooperação e contratos com entidades públicas e privadas, organizações não-governamentais nacionais ou internacionais para a execução de atividades ligadas às suas finalidades;
- Gerenciar os recursos do Fundo Municipal do Meio Ambiente (FMA);
- Baixar, por portaria, as normas administrativas necessárias à definição dos procedimentos específicos para as licenças ambientais, observadas a natureza, as características e as peculiaridades de cada atividade ou empreendimento, bem como a compatibilização do processo de licenciamento com as etapas de planejamento, implantação, operação, além do estabelecimento de procedimentos simplificados para atividades e empreendimentos de pequeno impacto ambiental, ouvido, quando pertinente em casos específicos, o Conselho Municipal de Meio Ambiente;
- Receber, avaliar e responder às solicitações, justificativas e projetos bem como, após apreciação, emitir ou não as Certidões de Uso e Ocupação do Solo contendo a informação sobre a permissibilidade ou não de atividades específicas ou do parcelamento do solo;
- Organizar e manter atualizado o Sistema de Informações Ambientais do Município, em articulação com os órgãos ambientais estadual e federal para acompanhamento, monitoramento e controle dos impactos ambientais no Município;
- Organizar e manter o Cadastro Técnico Municipal de Atividades Potencialmente Poluidoras ou Utilizadoras de Recursos Ambientais (CTAPP), para registro obrigatório de pessoas físicas ou jurídicas que se dedicam a atividades potencialmente poluidoras e/ou degradadoras;
- Gerir e aplicar os recursos de medidas compensatórias cobradas em processos de licenciamento ambiental de competência do município de São Tomé;
- Executar todas as demais atividades relacionadas com a Política Municipal de Meio Ambiente, bem como exercer as demais competências que lhe forem conferidas por instrumento legal.

Das competências de Turismo:
- Planejar e coordenar a política geral de desenvolvimento turístico do Município;
- Aproveitar os potenciais do município de forma ordenada e decisiva para a geração de renda e de sustentabilidade;
- Coordenar os processos de definição e elaboração de programas e projetos municipais, de forma a integrar os esforços voltados para a implementação de políticas de desenvolvimento econômico, urbano e social através do turismo local;
- Coordenar, em articulação com os demais órgãos e entidades da administração pública, a captação e negociação de recursos financeiros junto a órgãos e instituições nacionais, organismos multilaterais e agências governamentais e não-governamentais estrangeiras, e monitorar sua aplicação;
- Elaborar, em conjunto com os demais órgãos e entidades da Administração Direta e Indireta, estratégias e mecanismos de controle da expansão ordenada das atividades econômicas e de ocupação do espaço urbano do Município relacionadas ao turismo;
- Articular e propoe políticas municipais de desenvolvimento do turismo;
- Planejar e implementar a política municipal de turismo, visando criar condições para o incremento e o desenvolvimento da atividade turística sustentável do município, sob a égide da sustentabilidade ambiental, social e cultural;
- Contribuir para a promoção e a divulgação do potencial turístico do município em âmbito local, nacional e internacional;
- Indicar processos de obtenção de uma maior fluidez na expansão e melhoria da infraestrutura turística, instigando parcerias para novos investimentos no município;
- Viabilizar a formação e a captação dos profissionais que atuam na área de turismo, visando a melhoria da qualidade e da produtividade dos serviços prestados aos turistas;
- Administrar os recursos financeiros destinados à Secretaria, de acordo com as diretrizes estabelecidas nos planos estratégicos da Prefeitura;
- Administrar os recursos humanos, quanto à frequência e desempenho dos colaboradores;
- Realizar outras atividades compatíveis com a destinação institucional do órgão.

Estrutura básica:
- Secretário Municipal;
- Secretaria Adjunta;
- Coordenadoria de Agricultura e Pecuária;
- Coordenadoria de Gestão de Recursos Naturais;
- Coordenadoria de Gestão Ambiental;
- Coordenadoria do Turismo.`
        },
        {
            nome: "Ouvidoria Municipal",
            slug: "ouvidoria-municipal",
            secretario: "Thamara Xavier Dias",
            email: "ouvidoria@saotome.rn.gov.br",
            telefone: "(84) 99211-5922",
            endereco: "Praça Antônio Assunção, 276, Centro",
            horarioFuncionamento: "08h00 às 14h00",
            descricao: `A Ouvidoria Geral do Município é instituição permanente, essencial à Administração Pública Municipal direta e indireta, vinculada diretamente ao Prefeito e à qual incumbe atuar na defesa dos direitos e interesses individuais e coletivos contra atos e omissões – ilegais e injustos, cometidos pela Administração Pública Municipal – direta ou indireta.

Das competências administrativas:
a) ouvir o cidadão e prover com informações os órgãos da Administração Direta e Indireta, objetivando a criação de políticas públicas de atendimento ao Cidadão, voltadas para a melhoria da qualidade dos serviços Públicos da Prefeitura Municipal de São Tomé;
b) viabilizar um canal direto entre a Prefeitura e o cidadão, a fim de possibilitar respostas a problemas no tempo mais rápido possível;
c) receber e examinar sugestões, reclamações, elogios e denúncias dos cidadãos relativos aos serviços e ao atendimento prestados pelos diversos órgãos da Prefeitura de São Tomé, dando encaminhamento aos procedimentos necessários para a solução dos problemas apontados, possibilitando o retorno aos interessados;
d) encaminhar aos diversos órgãos da Prefeitura de São Tomé as manifestações dos cidadãos, acompanhando as providências adotadas e garantindo o retorno aos interessados;
e) elaborar pesquisas de satisfação dos usuários dos diversos serviços prestados pelos Órgãos da Prefeitura;
f) apoiar tecnicamente e atuar com os diversos órgãos da Administração Direta e Indireta, visando à solução dos problemas apontados pelos cidadãos;
g) produzir relatórios que expressem expectativas, demandas e nível de satisfação da sociedade e sugerir as mudanças necessárias, a partir da análise e interpretação das manifestações recebidas;
h) recomendar a instauração de procedimentos administrativos para exame técnico das questões e a adoção de medidas necessárias para a adequada prestação de serviço público, quando for o caso;
i) contribuir para a disseminação de formas de participação popular no acompanhamento e fiscalização dos serviços prestados pela Prefeitura;
j) aconselhar o interessado a dirigir-se à autoridade competente quando for o caso;
k) resguardar o sigilo referente às informações levadas ao seu conhecimento, no exercício de suas funções;
l) divulgar, através dos diversos canais de comunicação da Prefeitura de São Tomé, o trabalho realizado pela Ouvidoria, assim como informações e orientações que considerar necessárias ao desenvolvimento de suas ações;
m) exercer outras atividades correlatas.

Estrutura básica:
- Ouvidor Geral.`
        }
    ];

    // Remover secretarias órfãs que não estão na lista ativa
    const slugsAtivos = secretarias.map(s => s.slug);
    const secretariasDeletadas = await prisma.secretaria.deleteMany({
        where: {
            slug: {
                notIn: slugsAtivos
            }
        }
    });
    if (secretariasDeletadas.count > 0) {
        console.log(`🧹 Removidas ${secretariasDeletadas.count} secretaria(s) órfã(s) do banco de dados.`);
    }

    for (const s of secretarias) {
        await prisma.secretaria.upsert({ where: { slug: s.slug }, update: s, create: { ...s } });
    }

    // --- Notícias ---
    const noticias = [
        { titulo: "São Tomé recebe Selo Diamante na Sala do Empreendedor", slug: "saotome-selo-diamante-2026", resumo: "Destaque nacional em atendimento pelo SEBRAE.", conteudo: "<p>A Prefeitura de São Tomé conquistou o Selo Diamante de Referência em Atendimento do SEBRAE.</p>", publicada: true, destaque: true, publicadoEm: new Date() },
        { titulo: "Obras de pavimentação avançam em São Tomé", slug: "obras-pavimentacao-2026", resumo: "Melhorias na infraestrutura urbana.", conteudo: "<p>Novas ruas recebem pavimentação asfáltica.</p>", publicada: true, destaque: false, publicadoEm: new Date() },
    ];

    for (const n of noticias) {
        await prisma.noticia.upsert({ where: { slug: n.slug }, update: n, create: n });
    }

    // --- Unidades de Atendimento ---
    console.log("🌱 Semeando Unidades de Atendimento...");
    const unidadesPath = path.join(__dirname, 'unidades.json');
    if (fs.existsSync(unidadesPath)) {
        const unidadesData = JSON.parse(fs.readFileSync(unidadesPath, 'utf8'));
        for (const u of unidadesData) {
            const existing = await prisma.unidadeAtendimento.findFirst({
                where: { nome: u.nome, tipo: u.tipo }
            });
            if (existing) {
                await prisma.unidadeAtendimento.update({
                    where: { id: existing.id },
                    data: u
                });
            } else {
                await prisma.unidadeAtendimento.create({
                    data: u
                });
            }
        }
    } else {
        console.log("⚠️ Arquivo unidades.json não encontrado para o seed.");
    }

    // --- Configurações Detalhadas ---
    const configuracoes = [
        { chave: "municipio_nome", valor: "São Tomé", grupo: "geral" },
        { chave: "municipio_cnpj", valor: "08.080.210/0001-49", grupo: "geral" },
        { chave: "prefeitura_endereco", valor: "Praça Antônio Assunção, s/n, Centro, São Tomé/RN", grupo: "geral" },
        { chave: "prefeitura_telefone", valor: "(84) 99211-5922", grupo: "geral" },
        { chave: "prefeitura_email", valor: "ouvidoria@saotome.rn.gov.br", grupo: "geral" },
        { chave: "prefeito_nome", valor: "Josinaldo Amaro de Lima (Gá)", grupo: "gestao" },
        { chave: "prefeito_descricao", valor: "Josinaldo Amaro de Lima, conhecido como Gá, é o prefeito de São Tomé/RN, focado em promover o desenvolvimento sustentável e o bem-estar de toda a população são-tomeense.", grupo: "gestao" },
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
        { chave: "municipio_historia", valor: `São Tomé desmembrou-se do município de Santa Cruz – RN em 1928, quando passou a categoria de vila, mediante o requerimento de licença de “portas abertas”, solicitada pelo Senhor Tomás Barbosa de Moura, comerciante e fazendeiro de tradicional família latifundiária local, o qual foi reconhecido como fundador oficial deste município. O Senhor Tomás Barbosa de Moura doou também o terreno para a construção da Igreja matriz e o terreno no qual seria erguida a casa paroquial, cujo orago teve – ainda permanece – por invocação Nossa Senhora da Conceição, erguida pelos irmãos Inácio, Francisco, Julião e Romualdo Brasileiro de Andrade – os irmãos Andrade -, cuja ascendência era legitimamente portuguesa.

Tomás Barbosa de Moura foi casado com a Senhora Maria Rosalinda de Moura, tendo como filhos Miguel Barbosa de Moura, Vicente Barbosa de Moura, Rafael Barbosa de Moura, José Amaro Barbosa de Moura, Domingas Barbosa de Moura e Máxima Barbosa de Moura. Tomás de Moura, como era vulgarmente conhecido em âmbito local, era originário da Fazenda Lagoa do Mato, na Ribeira do Jundiaí – atualmente município de Macaíba -, sendo o filho mais novo do sesmeiro Gonçalo Barbosa de Moura, citado acima, e de Joaquina Barbosa de Moura, e que teve como irmãos Maximiano Barbosa de Moura, fundador da Fazenda Caiçara dos Barbosas, atualmente localizada no município de Rui Barbosa, e Gonçalo Barbosa de Moura – chamado o novo – proprietário da Fazenda Carnaúba – que, posteriormente, viria à pertencer Domingos Cândido Lopes e sua esposa Aurita Lopes.

O fundador do município de São Tomé, Tomás Barbosa de Moura, era senhor e possuidor das Fazendas Santa Luzia e Barreiros, onde se dedicava, juntamente com familiares, as lides com o algodão e o ao criatório de gado vacum e cavalar, dividindo seus afazeres do mundo rural com o comércio de pequena e média escala, pois, nos idos da década de 1910, estabeleceu uma casa comercial à margem direita do Rio Potengi, em terras que recebeu do espólio de herança de seu pai, Gonçalo Barbosa de Moura, onde passou a comprar e vender, dentre outras coisas, o algodão produzido pelos agricultores locais. A partir disso, Tomás Barbosa de Moura adquiriu uma propriedade (a Fazenda Santa Luzia) encravada na metade do caminho para Santa Cruz, principal destino do algodão que comprava nos arredores de sua “Bodega” – que durante anos serviu como topônimo para o povoado nascente -, cujo principal objetivo era servir de local “pouso”, ou seja, espaço de descanso, para as tropas que fazem o transporte daquele produto, em lombo de muares, que eram conduzidos por seus criados até Santa Cruz.

Devido ao “vai-e-vem” não apenas no comércio, como também para fins de deveres cívicos e administrativos, bem como ao oneroso e desgastante trajeto realizado entre o povoado “Bodega” e a cidade de Santa Cruz, Tomás Barbosa de Moura escreve e escabeça uma representação – espécie de documento similar a um abaixo assinado -, no qual recolhe a assinatura de algumas figuras de proa do povoado Bodega e arredores, fazendeiros e comerciantes como ele, onde se destacavam os sobrenomes de integrantes das famílias Teixeira, Melo e Andrade, e entrega ao juiz de paz de Santa Cruz solicitando, por meio daquele documento, de licença de portas abertas, para poder comprar, vender, comerciar, assim como realizar seus deveres políticos e administrativos no próprio povoado que, naquela altura, 1928, já contava com três ruas – a saber as atuais Félix Medeiros, Barão do Rio Branco e Ladislau Galvão Pereira -, de casas de tijolos e devidamente enfileiradas. Apenas um ano depois, Tomás de Moura veio à óbito e, devido a todo o seu empenho e afinco para que o povoado que viria a constituir a cidade de São Tomé, tornar-se-ia, por honra, merecimento e reconhecimento, o fundador oficial da cidade de São Tomé, cujo primeiro prefeito viria a ser o Sr. Félix Gomes de Melo, filho secundogênito de tradicional família santa-cruzense, que através de sua rede familiar, do poder econômico e do sistema de alianças políticas de que dispunha, o habilitou a assumir e garantir a independência de São Tomé ante o julgo da elite política e econômica de Santa Cruz da qual fazia parte.

Fato curioso, é que o nome atual do município e, anteriormente, da própria cidade, deve-se não a uma homenagem ao Apóstolo Tomé (São Tomé), mas sim a um fato, ocorrido entre os anos de 1924 e 1925, em meio a uma grande seca, na qual um homem faminto chegou a casa de um dos integrantes da família Andrade e pediu algo que pudesse saciar a sua fome; no entanto, naquele momento o dono da casa tinha apenas um pouco de mel em uma garrafa e o viajante, cansado e com fome, fez daquele mel uma garapa e o bebeu, após alguns instantes, saciado e reconfortado, disse: “Que santo Mé”” (em alusão ao mel que saciou sua fome e não ao apóstolo). Disso, resultou o topônimo.`, grupo: "geral" },
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
