import prisma from "../src/config/database";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Iniciando seed...");

  // Criar usuário admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: adminPassword,
      role: "admin",
    },
  });
  console.log(`✅ Usuário admin criado: ${admin.username}`);

  // Criar sessões
  const sessoes = await Promise.all([
    prisma.sessao.upsert({
      where: { slug: "pratos" },
      update: {},
      create: {
        nome: "Pratos Principais",
        slug: "pratos",
        videoUrl:
          "https://videos.pexels.com/video-files/4761687/4761687-sd_640_360_24fps.mp4",
      },
    }),
    prisma.sessao.upsert({
      where: { slug: "entradas" },
      update: {},
      create: {
        nome: "Entradas",
        slug: "entradas",
        videoUrl:
          "https://videos.pexels.com/video-files/4065393/4065393-sd_640_360_25fps.mp4",
      },
    }),
    prisma.sessao.upsert({
      where: { slug: "sobremesas" },
      update: {},
      create: {
        nome: "Sobremesas",
        slug: "sobremesas",
        videoUrl:
          "https://videos.pexels.com/video-files/4107551/4107551-sd_640_360_25fps.mp4",
      },
    }),
  ]);

  console.log(`✅ ${sessoes.length} sessões criadas`);

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
