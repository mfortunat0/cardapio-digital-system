import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/login", AuthController.login);
router.post("/login/validate", authenticate, (req, res) => {
  return res.status(200).json({ valid: true });
});

export default router;
