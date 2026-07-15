import { Router } from "express";
import { SessaoController } from "../controllers/sessaoController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", SessaoController.getAll);
router.get("/:id", SessaoController.getById);
router.post("/", authenticate, SessaoController.create);
router.put("/:id", authenticate, SessaoController.update);
router.delete("/:id", authenticate, SessaoController.delete);

export default router;
