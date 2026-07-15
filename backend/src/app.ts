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

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use(loggerConsole);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/sessoes", sessaoRoutes);
app.use("/api/produtos", produtoRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export default app;
