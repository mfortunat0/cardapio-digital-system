import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";

let io: SocketServer;

export const initSocket = (server: HttpServer) => {
  io = new SocketServer(server, {
    cors: {
      origin: "*", // Em produção, restrinja para o domínio do frontend
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);

    socket.on("request-reload-produtos", () => {
      socket.broadcast.emit("reload-produtos");
    });

    socket.on("request-reload-sessoes", () => {
      socket.broadcast.emit("reload-sessoes");
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
};

export const getSocket = () => {
  if (!io) {
    throw new Error("Socket.io não inicializado");
  }
  return io;
};
