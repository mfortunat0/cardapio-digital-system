import { Router } from "express";
import { ProdutoController } from "../controllers/produtoController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", ProdutoController.getAll);
router.get("/:id", ProdutoController.getById);
router.post("/", authenticate, ProdutoController.create);
router.put("/:id", authenticate, ProdutoController.update);
router.delete("/:id", authenticate, ProdutoController.delete);

export default router;
