import "dotenv/config";
import http from "http";
import app from "./app";
import { initSocket } from "./config/socket";
import prisma from "./config/database";

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// Inicializar Socket.io
initSocket(server);

// Testar conexão com o banco
prisma
  .$connect()
  .then(() => {
    console.log("✅ Conectado ao banco de dados");
    server.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
      console.log(`📡 Socket.io ativo`);
    });
  })
  .catch((err: any) => {
    console.error("❌ Erro ao conectar ao banco:", err);
    process.exit(1);
  });

process.on("SIGTERM", () => {
  console.log("🛑 Encerrando servidor...");
  server.close(async () => {
    await prisma.$disconnect();
    console.log("✅ Servidor encerrado");
  });
});

export default server;
