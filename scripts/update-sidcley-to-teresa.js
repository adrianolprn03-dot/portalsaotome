const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Iniciando script de migração de nomes no banco de dados...");

  try {
    // 1. Secretarias
    const secretariasUpdated = await prisma.secretaria.updateMany({
      where: {
        secretario: {
          contains: 'Sidcley',
          mode: 'insensitive'
        }
      },
      data: {
        secretario: 'Teresa Cristina da Silva'
      }
    });
    console.log(`✅ Secretarias atualizadas: ${secretariasUpdated.count}`);

    // 2. Diárias
    const diariasUpdated = await prisma.diaria.updateMany({
      where: {
        servidor: {
          contains: 'Sidcley',
          mode: 'insensitive'
        }
      },
      data: {
        servidor: 'Teresa Cristina da Silva'
      }
    });
    console.log(`✅ Diárias atualizadas: ${diariasUpdated.count}`);

    // 3. Servidores
    const servidoresUpdated = await prisma.servidor.updateMany({
      where: {
        nome: {
          contains: 'Sidcley',
          mode: 'insensitive'
        }
      },
      data: {
        nome: 'Teresa Cristina da Silva'
      }
    });
    console.log(`✅ Servidores atualizados: ${servidoresUpdated.count}`);

    // 4. Configurações
    const configsUpdated = await prisma.configuracao.updateMany({
      where: {
        valor: {
          contains: 'Sidcley',
          mode: 'insensitive'
        }
      },
      data: {
        valor: 'Teresa Cristina da Silva'
      }
    });
    console.log(`✅ Configurações atualizadas: ${configsUpdated.count}`);

    // 5. Conselhos
    const conselhosUpdated = await prisma.conselho.updateMany({
      where: {
        presidente: {
          contains: 'Sidcley',
          mode: 'insensitive'
        }
      },
      data: {
        presidente: 'Teresa Cristina da Silva'
      }
    });
    console.log(`✅ Conselhos atualizados: ${conselhosUpdated.count}`);

    console.log("🎉 Script de migração concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao executar a migração no banco de dados:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
