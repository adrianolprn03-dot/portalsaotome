-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "cargo" TEXT,
ADD COLUMN IF NOT EXISTS "secretariasAutorizadas" TEXT NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "Secretaria" ADD COLUMN IF NOT EXISTS "atoNomeacaoSecretario" TEXT,
ADD COLUMN IF NOT EXISTS "conferidoPor" TEXT,
ADD COLUMN IF NOT EXISTS "dataUltimaConferencia" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "normaCriacao" TEXT,
ADD COLUMN IF NOT EXISTS "situacaoPublicacao" TEXT NOT NULL DEFAULT 'publicado';

-- AlterTable
ALTER TABLE "Licitacao" ADD COLUMN IF NOT EXISTS "adesaoArp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "amparoLegal" TEXT,
ADD COLUMN IF NOT EXISTS "ataRegistroPreco" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "codigoPermanente" TEXT,
ADD COLUMN IF NOT EXISTS "criterioPntp" TEXT DEFAULT '8.1',
ADD COLUMN IF NOT EXISTS "dataAtualizacaoEfetiva" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "dataHomologacao" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "dataPublicacao" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "dataUltimaConferencia" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "editalUrl" TEXT,
ADD COLUMN IF NOT EXISTS "fasesDocumentos" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN IF NOT EXISTS "fonteOrigem" TEXT DEFAULT 'Sistema de Compras Municipal / PNCP',
ADD COLUMN IF NOT EXISTS "numeroProcesso" TEXT,
ADD COLUMN IF NOT EXISTS "responsavelCadastro" TEXT,
ADD COLUMN IF NOT EXISTS "responsavelRevisao" TEXT,
ADD COLUMN IF NOT EXISTS "situacaoPublicacao" TEXT NOT NULL DEFAULT 'publicado',
ADD COLUMN IF NOT EXISTS "unidadeResponsavel" TEXT,
ADD COLUMN IF NOT EXISTS "valorEstimado" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "valorHomologado" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "versao" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Contrato" ADD COLUMN IF NOT EXISTS "aditivos" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN IF NOT EXISTS "ano" INTEGER,
ADD COLUMN IF NOT EXISTS "codigoPermanente" TEXT,
ADD COLUMN IF NOT EXISTS "criterioPntp" TEXT DEFAULT '9.1',
ADD COLUMN IF NOT EXISTS "dataAssinatura" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "dataAtualizacaoEfetiva" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "dataUltimaConferencia" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "fiscais" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN IF NOT EXISTS "fonteOrigem" TEXT DEFAULT 'Gestão de Contratos / PNCP',
ADD COLUMN IF NOT EXISTS "instrumentoIntegralUrl" TEXT,
ADD COLUMN IF NOT EXISTS "justificativaOrdemCronologica" TEXT,
ADD COLUMN IF NOT EXISTS "modalidadeOrigem" TEXT,
ADD COLUMN IF NOT EXISTS "responsavelCadastro" TEXT,
ADD COLUMN IF NOT EXISTS "responsavelRevisao" TEXT,
ADD COLUMN IF NOT EXISTS "situacaoPublicacao" TEXT NOT NULL DEFAULT 'publicado',
ADD COLUMN IF NOT EXISTS "unidadeResponsavel" TEXT,
ADD COLUMN IF NOT EXISTS "versao" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Convenio" ADD COLUMN IF NOT EXISTS "ano" INTEGER,
ADD COLUMN IF NOT EXISTS "arquivoInteiroTeor" TEXT,
ADD COLUMN IF NOT EXISTS "beneficiario" TEXT,
ADD COLUMN IF NOT EXISTS "cnpjParticipe" TEXT,
ADD COLUMN IF NOT EXISTS "codigoPermanente" TEXT,
ADD COLUMN IF NOT EXISTS "criterioPntp" TEXT DEFAULT '5.1',
ADD COLUMN IF NOT EXISTS "dataAtualizacaoEfetiva" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "dataUltimaConferencia" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "fonteOrigem" TEXT DEFAULT 'Transferegov / SICONV / Controle Municipal',
ADD COLUMN IF NOT EXISTS "obrigacoes" TEXT,
ADD COLUMN IF NOT EXISTS "responsavelCadastro" TEXT,
ADD COLUMN IF NOT EXISTS "responsavelRevisao" TEXT,
ADD COLUMN IF NOT EXISTS "situacaoPublicacao" TEXT NOT NULL DEFAULT 'publicado',
ADD COLUMN IF NOT EXISTS "tipoConvenio" TEXT NOT NULL DEFAULT 'recebido',
ADD COLUMN IF NOT EXISTS "valorLiberado" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "Diaria" ADD COLUMN IF NOT EXISTS "codigoPermanente" TEXT,
ADD COLUMN IF NOT EXISTS "criterioPntp" TEXT DEFAULT '7.1',
ADD COLUMN IF NOT EXISTS "dataAtualizacaoEfetiva" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "dataUltimaConferencia" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "fonteOrigem" TEXT DEFAULT 'Sistema de Recursos Humanos / Contabilidade',
ADD COLUMN IF NOT EXISTS "matricula" TEXT,
ADD COLUMN IF NOT EXISTS "numeroPortaria" TEXT,
ADD COLUMN IF NOT EXISTS "relatorioViagemUrl" TEXT,
ADD COLUMN IF NOT EXISTS "responsavelCadastro" TEXT,
ADD COLUMN IF NOT EXISTS "responsavelRevisao" TEXT,
ADD COLUMN IF NOT EXISTS "situacaoPublicacao" TEXT NOT NULL DEFAULT 'publicado',
ADD COLUMN IF NOT EXISTS "tipoDestino" TEXT DEFAULT 'estadual';

-- AlterTable
ALTER TABLE "Servidor" ADD COLUMN IF NOT EXISTS "cargaHorariaSemanal" INTEGER DEFAULT 40,
ADD COLUMN IF NOT EXISTS "cpfAnonimizado" TEXT,
ADD COLUMN IF NOT EXISTS "dataAdmissao" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "dataAtualizacaoEfetiva" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "dataUltimaConferencia" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "descontos" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS "fonteOrigem" TEXT DEFAULT 'Sistema de Folha de Pagamento',
ADD COLUMN IF NOT EXISTS "lotacao" TEXT,
ADD COLUMN IF NOT EXISTS "padraoRemuneratorio" TEXT,
ADD COLUMN IF NOT EXISTS "situacaoPublicacao" TEXT NOT NULL DEFAULT 'publicado',
ADD COLUMN IF NOT EXISTS "vantagens" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "Receita" ADD COLUMN IF NOT EXISTS "codigoPermanente" TEXT,
ADD COLUMN IF NOT EXISTS "criterioPntp" TEXT DEFAULT '3.1',
ADD COLUMN IF NOT EXISTS "dataAtualizacaoEfetiva" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "dataUltimaConferencia" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "fonteOrigem" TEXT DEFAULT 'Sistema Contábil / SICONFI',
ADD COLUMN IF NOT EXISTS "naturezaCodigo" TEXT,
ADD COLUMN IF NOT EXISTS "orgao" TEXT DEFAULT 'Prefeitura Municipal de São Tomé',
ADD COLUMN IF NOT EXISTS "responsavelCadastro" TEXT,
ADD COLUMN IF NOT EXISTS "responsavelRevisao" TEXT,
ADD COLUMN IF NOT EXISTS "situacaoPublicacao" TEXT NOT NULL DEFAULT 'publicado',
ADD COLUMN IF NOT EXISTS "unidade" TEXT,
ADD COLUMN IF NOT EXISTS "valorArrecadado" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "valorAtualizado" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "valorLancado" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "valorPrevisto" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Despesa" ADD COLUMN IF NOT EXISTS "classificacaoOrcamentaria" TEXT,
ADD COLUMN IF NOT EXISTS "codigoPermanente" TEXT,
ADD COLUMN IF NOT EXISTS "contratoId" TEXT,
ADD COLUMN IF NOT EXISTS "credorCpfCnpj" TEXT,
ADD COLUMN IF NOT EXISTS "criterioPntp" TEXT DEFAULT '4.1',
ADD COLUMN IF NOT EXISTS "dataAtualizacaoEfetiva" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "dataEmpenho" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "dataUltimaConferencia" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "elementoDespesa" TEXT,
ADD COLUMN IF NOT EXISTS "fonteOrigem" TEXT DEFAULT 'Sistema Contábil / SICONFI',
ADD COLUMN IF NOT EXISTS "fonteRecurso" TEXT,
ADD COLUMN IF NOT EXISTS "funcao" TEXT,
ADD COLUMN IF NOT EXISTS "licitacaoId" TEXT,
ADD COLUMN IF NOT EXISTS "modalidadeLicitacao" TEXT,
ADD COLUMN IF NOT EXISTS "numeroEmpenho" TEXT,
ADD COLUMN IF NOT EXISTS "numeroProcessoLicitatorio" TEXT,
ADD COLUMN IF NOT EXISTS "orgao" TEXT DEFAULT 'Prefeitura Municipal de São Tomé',
ADD COLUMN IF NOT EXISTS "programa" TEXT,
ADD COLUMN IF NOT EXISTS "responsavelCadastro" TEXT,
ADD COLUMN IF NOT EXISTS "responsavelRevisao" TEXT,
ADD COLUMN IF NOT EXISTS "situacaoPublicacao" TEXT NOT NULL DEFAULT 'publicado',
ADD COLUMN IF NOT EXISTS "subfuncao" TEXT,
ADD COLUMN IF NOT EXISTS "unidade" TEXT,
ADD COLUMN IF NOT EXISTS "valorEmpenhado" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "valorLiquidado" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "valorPago" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Documento" ADD COLUMN IF NOT EXISTS "acessoRestrito" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "arquivoEditavelUrl" TEXT,
ADD COLUMN IF NOT EXISTS "codigoPermanente" TEXT,
ADD COLUMN IF NOT EXISTS "competencia" TEXT,
ADD COLUMN IF NOT EXISTS "criterioPntp" TEXT,
ADD COLUMN IF NOT EXISTS "dataAtualizacaoEfetiva" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "dataUltimaConferencia" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "descricao" TEXT,
ADD COLUMN IF NOT EXISTS "documentoAnteriorId" TEXT,
ADD COLUMN IF NOT EXISTS "orgaoResponsavel" TEXT,
ADD COLUMN IF NOT EXISTS "pesquisavelOcr" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "responsavelCadastro" TEXT,
ADD COLUMN IF NOT EXISTS "responsavelRevisao" TEXT,
ADD COLUMN IF NOT EXISTS "secretaria" TEXT,
ADD COLUMN IF NOT EXISTS "situacaoPublicacao" TEXT NOT NULL DEFAULT 'publicado',
ADD COLUMN IF NOT EXISTS "versao" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Ouvidoria" ADD COLUMN IF NOT EXISTS "codigoVerificacao" TEXT,
ADD COLUMN IF NOT EXISTS "historicoTramitacao" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN IF NOT EXISTS "justificativaPrazo" TEXT,
ADD COLUMN IF NOT EXISTS "orgaoDestino" TEXT;

-- AlterTable
ALTER TABLE "Esic" ADD COLUMN IF NOT EXISTS "autoridadeClassificadora" TEXT,
ADD COLUMN IF NOT EXISTS "codigoVerificacao" TEXT,
ADD COLUMN IF NOT EXISTS "dataClassificacao" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "dataDesclassificacao" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "dataRecursoSegunda" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "dataRespostaSegunda" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "fundamentoSigilo" TEXT,
ADD COLUMN IF NOT EXISTS "historicoTramitacao" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN IF NOT EXISTS "justificativaProrrogacao" TEXT,
ADD COLUMN IF NOT EXISTS "recursoSegundaInstancia" TEXT,
ADD COLUMN IF NOT EXISTS "respostaRecursoSegunda" TEXT;

-- AlterTable
ALTER TABLE "Obra" ADD COLUMN IF NOT EXISTS "cnpjEmpresa" TEXT,
ADD COLUMN IF NOT EXISTS "codigoPermanente" TEXT,
ADD COLUMN IF NOT EXISTS "contratoId" TEXT,
ADD COLUMN IF NOT EXISTS "criterioPntp" TEXT DEFAULT '10.1',
ADD COLUMN IF NOT EXISTS "dataAtualizacaoEfetiva" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "dataUltimaConferencia" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "fonteOrigem" TEXT DEFAULT 'Secretaria de Obras / Engenharia',
ADD COLUMN IF NOT EXISTS "medicoes" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN IF NOT EXISTS "motivoParalisacao" TEXT,
ADD COLUMN IF NOT EXISTS "numeroContrato" TEXT,
ADD COLUMN IF NOT EXISTS "previsaoReinicio" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "quantitativosContratados" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN IF NOT EXISTS "responsavelCadastro" TEXT,
ADD COLUMN IF NOT EXISTS "responsavelParalisacao" TEXT,
ADD COLUMN IF NOT EXISTS "responsavelRevisao" TEXT,
ADD COLUMN IF NOT EXISTS "secretaria" TEXT DEFAULT 'Secretaria de Obras e Infraestrutura',
ADD COLUMN IF NOT EXISTS "situacaoPublicacao" TEXT NOT NULL DEFAULT 'publicado',
ADD COLUMN IF NOT EXISTS "valorPago" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "FAQ" ADD COLUMN IF NOT EXISTS "dataUltimaConferencia" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Legislacao" ADD COLUMN IF NOT EXISTS "arquivoEditavelUrl" TEXT,
ADD COLUMN IF NOT EXISTS "atoRelacionado" TEXT,
ADD COLUMN IF NOT EXISTS "codigoPermanente" TEXT,
ADD COLUMN IF NOT EXISTS "dataAto" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "dataAtualizacaoEfetiva" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "dataUltimaConferencia" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "orgaoResponsavel" TEXT DEFAULT 'Gabinete do Prefeito',
ADD COLUMN IF NOT EXISTS "responsavelCadastro" TEXT,
ADD COLUMN IF NOT EXISTS "responsavelRevisao" TEXT,
ADD COLUMN IF NOT EXISTS "situacaoPublicacao" TEXT NOT NULL DEFAULT 'publicado',
ADD COLUMN IF NOT EXISTS "situacaoVigencia" TEXT NOT NULL DEFAULT 'vigente',
ADD COLUMN IF NOT EXISTS "versao" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "UnidadeAtendimento" ADD COLUMN IF NOT EXISTS "cnes" TEXT,
ADD COLUMN IF NOT EXISTS "equipe" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN IF NOT EXISTS "especialidades" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN IF NOT EXISTS "servicos" TEXT,
ADD COLUMN IF NOT EXISTS "subtipo" TEXT;

-- AlterTable
ALTER TABLE "Conselho" ADD COLUMN IF NOT EXISTS "atoNomeacao" TEXT,
ADD COLUMN IF NOT EXISTS "calendarioReunioes" TEXT,
ADD COLUMN IF NOT EXISTS "dataUltimaConferencia" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "mandatoVigencia" TEXT,
ADD COLUMN IF NOT EXISTS "regimentoInternoUrl" TEXT,
ADD COLUMN IF NOT EXISTS "situacaoPublicacao" TEXT NOT NULL DEFAULT 'publicado';

-- AlterTable
ALTER TABLE "ImportacaoCSV" ADD COLUMN IF NOT EXISTS "detalhesErros" TEXT DEFAULT '[]',
ADD COLUMN IF NOT EXISTS "executadoPor" TEXT,
ADD COLUMN IF NOT EXISTS "identificadorUnico" TEXT,
ADD COLUMN IF NOT EXISTS "ignoradosDuplicados" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "origemSistema" TEXT DEFAULT 'Planilha CSV';

-- AlterTable
ALTER TABLE "Medicamento" ADD COLUMN IF NOT EXISTS "apresentacao" TEXT DEFAULT 'Comprimido / Frasco',
ADD COLUMN IF NOT EXISTS "dataReferenciaEstoque" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "estoqueMinimo" INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS "loteValidade" TEXT,
ADD COLUMN IF NOT EXISTS "principioAtivo" TEXT,
ADD COLUMN IF NOT EXISTS "quantidadeEstoque" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "situacaoPublicacao" TEXT NOT NULL DEFAULT 'publicado',
ADD COLUMN IF NOT EXISTS "tipoComponente" TEXT DEFAULT 'Básico (CBAF)',
ADD COLUMN IF NOT EXISTS "unidadeMedida" TEXT DEFAULT 'Unidade',
ADD COLUMN IF NOT EXISTS "unidadeSaude" TEXT DEFAULT 'CAF / Farmácia Básica Municipal';

-- AlterTable
ALTER TABLE "EmendaParlamentar" ADD COLUMN IF NOT EXISTS "contratoVinculado" TEXT,
ADD COLUMN IF NOT EXISTS "dataUltimaConferencia" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "despesaVinculada" TEXT,
ADD COLUMN IF NOT EXISTS "esfera" TEXT DEFAULT 'Federal',
ADD COLUMN IF NOT EXISTS "formaRepasse" TEXT DEFAULT 'Transferência Especial / Convênio',
ADD COLUMN IF NOT EXISTS "obraVinculada" TEXT,
ADD COLUMN IF NOT EXISTS "situacaoPublicacao" TEXT NOT NULL DEFAULT 'publicado',
ADD COLUMN IF NOT EXISTS "valorRecebido" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "Concurso" ADD COLUMN IF NOT EXISTS "fasesAtos" TEXT NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "RelatorioFiscal" ADD COLUMN IF NOT EXISTS "arquivoEditavelUrl" TEXT,
ADD COLUMN IF NOT EXISTS "codigoPermanente" TEXT,
ADD COLUMN IF NOT EXISTS "dataUltimaConferencia" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "orgaoResponsavel" TEXT DEFAULT 'Secretaria de Finanças e Tributação',
ADD COLUMN IF NOT EXISTS "periodicidade" TEXT DEFAULT 'Bimestral',
ADD COLUMN IF NOT EXISTS "responsavelCadastro" TEXT,
ADD COLUMN IF NOT EXISTS "responsavelRevisao" TEXT,
ADD COLUMN IF NOT EXISTS "situacaoPublicacao" TEXT NOT NULL DEFAULT 'publicado',
ADD COLUMN IF NOT EXISTS "versao" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Pagamento" ADD COLUMN IF NOT EXISTS "fonteRecurso" TEXT,
ADD COLUMN IF NOT EXISTS "justificativaQuebra" TEXT,
ADD COLUMN IF NOT EXISTS "numeroEmpenho" TEXT;

-- AlterTable
ALTER TABLE "RenunciaFiscal" ADD COLUMN IF NOT EXISTS "cnpjBeneficiario" TEXT,
ADD COLUMN IF NOT EXISTS "dataUltimaConferencia" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "modalidadeIncentivo" TEXT DEFAULT 'Tributário',
ADD COLUMN IF NOT EXISTS "projetoIncentivado" TEXT,
ADD COLUMN IF NOT EXISTS "situacaoPublicacao" TEXT NOT NULL DEFAULT 'publicado',
ADD COLUMN IF NOT EXISTS "valorRealizado" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "QuadroServidor" ADD COLUMN IF NOT EXISTS "cargaHoraria" TEXT DEFAULT '40h',
ADD COLUMN IF NOT EXISTS "padraoSalarial" TEXT,
ALTER COLUMN "atualizadoEm" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Terceirizado" ADD COLUMN IF NOT EXISTS "cnpjEmpresa" TEXT,
ADD COLUMN IF NOT EXISTS "contratoNumero" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "DocumentoSaude" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "anoExercicio" INTEGER NOT NULL,
    "periodoVigencia" TEXT,
    "statusConselho" TEXT DEFAULT 'Aprovado pelo Conselho Municipal de Saúde (CMS)',
    "numeroResolucao" TEXT,
    "descricao" TEXT,
    "linkDocumento" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentoSaude_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CentralRegulacaoItem" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "totalPacientes" INTEGER NOT NULL DEFAULT 0,
    "tempoEspera" TEXT NOT NULL,
    "procedimentos" TEXT,
    "competencia" TEXT,
    "protocolosLista" TEXT,
    "icone" TEXT NOT NULL DEFAULT 'FaUserMd',
    "cor" TEXT NOT NULL DEFAULT 'from-blue-500 to-indigo-600',
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CentralRegulacaoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CentralRegulacaoConfig" (
    "id" TEXT NOT NULL DEFAULT 'config',
    "titulo" TEXT NOT NULL DEFAULT 'Central de Regulação em Saúde',
    "subtitulo" TEXT DEFAULT 'Acompanhe as filas de espera para consultas especializadas, exames e cirurgias eletivas no SUS municipal.',
    "comoFunciona" TEXT,
    "telefone" TEXT DEFAULT '(84) 3400-0000',
    "horarioFuncionamento" TEXT DEFAULT 'Segunda a Sexta, 07h às 13h',
    "endereco" TEXT DEFAULT 'Secretaria Municipal de Saúde de São Tomé',
    "linkSistemaExterno" TEXT,
    "documentoRegulamento" TEXT,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CentralRegulacaoConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TabelaDiaria" (
    "id" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "valorEstadual" DOUBLE PRECISION NOT NULL,
    "valorDemaisCidades" DOUBLE PRECISION NOT NULL,
    "valorOutrosEstados" DOUBLE PRECISION NOT NULL,
    "valorCapitalFederal" DOUBLE PRECISION NOT NULL,
    "valorInternacional" DOUBLE PRECISION,
    "normaLegal" TEXT NOT NULL,
    "vigenciaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vigenciaFim" TIMESTAMP(3),
    "versao" INTEGER NOT NULL DEFAULT 1,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TabelaDiaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "FilaEsperaCreche" (
    "id" TEXT NOT NULL,
    "protocoloAnonimizado" TEXT NOT NULL,
    "iniciaisCrianca" TEXT NOT NULL,
    "dataNascimentoMesAno" TEXT NOT NULL,
    "unidadeEscolar" TEXT NOT NULL,
    "turmaEtapa" TEXT NOT NULL,
    "criterioPrioridade" TEXT NOT NULL,
    "posicaoFila" INTEGER NOT NULL,
    "dataInscricao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'aguardando',
    "ano" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FilaEsperaCreche_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DeclaracaoTransparencia" (
    "id" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,
    "criterioPntp" TEXT,
    "orgaoResponsavel" TEXT NOT NULL,
    "exercicio" INTEGER NOT NULL,
    "competencia" TEXT,
    "tipoSituacao" TEXT NOT NULL DEFAULT 'nao_ocorrencia_declarada',
    "textoDeclaracao" TEXT NOT NULL,
    "fundamentoLegal" TEXT,
    "responsavelNome" TEXT NOT NULL,
    "responsavelCargo" TEXT,
    "arquivoAssinadoUrl" TEXT,
    "dataEmissao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataConferencia" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "situacaoPublicacao" TEXT NOT NULL DEFAULT 'publicado',
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeclaracaoTransparencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "HistoricoAlteracao" (
    "id" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "dadosAnteriores" TEXT,
    "dadosNovos" TEXT,
    "resumoAlteracao" TEXT NOT NULL,
    "isConferenciaSemAlteracao" BOOLEAN NOT NULL DEFAULT false,
    "usuarioId" TEXT,
    "usuarioNome" TEXT NOT NULL,
    "usuarioPerfil" TEXT NOT NULL,
    "secretaria" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoAlteracao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CriterioPNTP" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "dimensao" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "textoIntegral" TEXT NOT NULL,
    "classificacao" TEXT NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "periodicidadeDias" INTEGER NOT NULL DEFAULT 30,
    "exigenciasCartilha" TEXT NOT NULL,
    "referenciaCartilha" TEXT,
    "paginaPublica" TEXT NOT NULL,
    "telaAdministrativa" TEXT NOT NULL,
    "secretariaResponsavel" TEXT NOT NULL,
    "statusFuncionalidade" TEXT NOT NULL DEFAULT 'implementada',
    "statusConteudo" TEXT NOT NULL DEFAULT 'publicado',
    "statusEvidencia" TEXT NOT NULL DEFAULT 'conferida',
    "statusValidacao" TEXT NOT NULL DEFAULT 'validado',
    "resultadoAvaliacaoExterna" TEXT DEFAULT 'Atendido na Ficha Histórica',
    "pendenciasTecnicas" TEXT,
    "pendenciasConteudo" TEXT,
    "evidenciaUrl" TEXT,
    "dataUltimaVerificacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verificadoPor" TEXT DEFAULT 'Controladoria Geral do Município',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CriterioPNTP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "FilaEsperaCreche_protocoloAnonimizado_key" ON "FilaEsperaCreche"("protocoloAnonimizado");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CriterioPNTP_codigo_key" ON "CriterioPNTP"("codigo");


