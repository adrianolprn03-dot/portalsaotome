const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- INICIANDO CORREÇÃO E POPULAÇÃO DA LEGISLAÇÃO ---");

  // 1. Atualizar tipo de "Decreto" para "decreto"
  const res = await prisma.legislacao.updateMany({
    where: { tipo: 'Decreto' },
    data: { tipo: 'decreto' }
  });
  console.log(`Corrigidos ${res.count} registros de "Decreto" para "decreto".`);

  // 2. Inserir leis e portarias locais
  const itensParaInserir = [
    {
      tipo: 'lei',
      numero: '426',
      ano: 2026,
      ementa: 'Lei Municipal nº 426 - LOA 2026 - Dispõe sobre a Lei Orçamentária Anual (LOA) para o exercício financeiro de 2026.',
      arquivo: '/uploads/1773280848011-LEI_Nº_426_-_LOA_2026.pdf',
      documentUrl: '/uploads/1773280848011-LEI_Nº_426_-_LOA_2026.pdf',
      ativo: true
    },
    {
      tipo: 'portaria_diaria',
      numero: '023',
      ano: 2026,
      ementa: 'Portaria nº 023/2026 - Concede diária a servidora Sazilla Cândida de Araújo com destino a Natal/RN.',
      arquivo: '/uploads/1773280919130-Portaria_nº_023_-_2026_-_Diária_de_SAZILLA_CANDIDA_-_Natal.pdf',
      documentUrl: '/uploads/1773280919130-Portaria_nº_023_-_2026_-_Diária_de_SAZILLA_CANDIDA_-_Natal.pdf',
      ativo: true
    },
    {
      tipo: 'lei',
      numero: '425',
      ano: 2025,
      ementa: 'Lei Municipal nº 425/2025 - Dispõe sobre o Plano Plurianual (PPA) para o período de 2026 a 2029.',
      arquivo: '/uploads/1776789082693-lei_municipal_n_425_2025_ppa_2026_2029_compressed.pdf',
      documentUrl: '/uploads/1776789082693-lei_municipal_n_425_2025_ppa_2026_2029_compressed.pdf',
      ativo: true
    },
    {
      tipo: 'portaria_diaria',
      numero: '190',
      ano: 2025,
      ementa: 'Portaria nº 190/2025 - Concede diária a servidora Inez Manuela de Lima Bezerra com destino a Natal/RN.',
      arquivo: '/uploads/1777052294207-portaria_n_190_2025_diaria_de_inez_manuela_de_lima_bezerra_natal.pdf',
      documentUrl: '/uploads/1777052294207-portaria_n_190_2025_diaria_de_inez_manuela_de_lima_bezerra_natal.pdf',
      ativo: true
    },
    {
      tipo: 'portaria_diaria',
      numero: '095',
      ano: 2026,
      ementa: 'Portaria nº 095/2026 - Concede diária ao servidor Antonio Bruno dos Santos com destino a Natal/RN.',
      arquivo: '/uploads/1777465546437-portaria_n_095_2026_diaria_de_antonio_bruno_dos_santos_natal.pdf',
      documentUrl: '/uploads/1777465546437-portaria_n_095_2026_diaria_de_antonio_bruno_dos_santos_natal.pdf',
      ativo: true
    },
    {
      tipo: 'lei',
      numero: '440',
      ano: 2026,
      ementa: 'Lei Complementar Municipal nº 440/2026 - Dispõe sobre a nova regra de fixação e repasse do piso salarial profissional nacional dos Agentes Comunitários de Saúde (ACS) e Agentes de Combate às Endemias (ACE) da Atenção Primária da Saúde.',
      arquivo: '/uploads/1777465851528-lei_complementar_municipal_n_440_2026_nova_regra_do_piso_atencao_primaria_da_saude.pdf',
      documentUrl: '/uploads/1777465851528-lei_complementar_municipal_n_440_2026_nova_regra_do_piso_atencao_primaria_da_saude.pdf',
      ativo: true
    }
  ];

  for (const item of itensParaInserir) {
    const existe = await prisma.legislacao.findFirst({
      where: {
        tipo: item.tipo,
        numero: item.numero,
        ano: item.ano
      }
    });

    if (!existe) {
      const criado = await prisma.legislacao.create({
        data: item
      });
      console.log(`Criado: ${criado.tipo} ${criado.numero}/${criado.ano}`);
    } else {
      console.log(`Pulado (já existe): ${item.tipo} ${item.numero}/${item.ano}`);
    }
  }

  console.log("--- FINALIZADO COM SUCESSO ---");
}

main().catch(console.error).finally(() => prisma.$disconnect());
