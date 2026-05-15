import { prisma } from "../src/lib/prisma";

async function limpar() {
    console.log("🗑️  Limpando banco de dados...");

    const modelos = [
        "avaliacaoServico", "conselhoAta", "conselho", "esic", "cidadaoEsic",
        "ouvidoria", "contato", "pesquisaSatisfacao", "servicoCarta",
        "emendaPix", "emendaParlamentar", "renunciaFiscal", "relatorioFiscal",
        "pagamento", "diaria", "servidor", "terceirizado", "estagiario",
        "quadroServidor", "veiculo", "medicamento", "obra", "concurso",
        "despesa", "receita", "contrato", "licitacao", "convenio",
        "legislacao", "documento", "galeriaFoto", "evento", "fAQ",
        "glossario", "unidadeAtendimento", "linkExterno", "importacaoCSV",
        "noticia", "secretaria", "configuracao", "usuario"
    ];

    for (const modelo of modelos) {
        try {
            // @ts-ignore
            await (prisma[modelo] as any).deleteMany();
            console.log(`  ✅ ${modelo} limpo`);
        } catch (e: any) {
            console.log(`  ⚠️  ${modelo}: ${e.message?.slice(0, 60)}`);
        }
    }

    console.log("\n✅ Banco limpo com sucesso!");
}

limpar()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error("Erro:", e.message);
        await prisma.$disconnect();
        process.exit(1);
    });
