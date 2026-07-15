import prisma from "../src/config/database";

async function seed() {
  console.log("🌱 Iniciando seed...");

  const existingSessoes = await prisma.sessao.count();

  if (existingSessoes === 0) {
    console.log("Criando sessões iniciais...");
    const sessoesData = [
      { nome: "Pratos Principais" },
      { nome: "Entradas" },
      { nome: "Sobremesas" },
    ];

    await prisma.sessao.createMany({
      data: sessoesData,
    });
    
    console.log(`✅ ${sessoesData.length} sessões criadas.`);
  } else {
    console.log(`ℹ️ O banco já possui ${existingSessoes} sessões. Pulando criação.`);
  }

  // Criar produtos (opcional)
  // ... (pode adicionar produtos aqui)

  console.log("✅ Seed concluído!");
}

seed()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
