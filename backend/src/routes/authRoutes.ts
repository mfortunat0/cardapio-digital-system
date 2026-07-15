import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/login", AuthController.login);

export default router;
