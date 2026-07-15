import express from "express";
import cors from "cors";
import path from "path";
import { logger, loggerConsole } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/authRoutes";
import sessaoRoutes from "./routes/sessaoRoutes";
import produtoRoutes from "./routes/produtoRoutes";
import uploadRoutes from "./routes/uploadRoutes";

const app = express();

// Middlewares
app.use(
  cors({
    origin: "*", // Em produção, restrinja ao domínio do frontend
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Logging
app.use(logger);
app.use(loggerConsole);

// Servir arquivos estáticos (uploads)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/sessoes", sessaoRoutes);
app.use("/api/produtos", produtoRoutes);
app.use("/api/upload", uploadRoutes);

// Rota de saúde
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handler (deve ser o último middleware)
app.use(errorHandler);

export default app;
