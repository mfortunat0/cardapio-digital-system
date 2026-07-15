import { Router } from "express";
import upload from "../config/multer";
import { UploadController } from "../controllers/uploadController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post(
  "/single",
  authenticate,
  upload.single("file"),
  UploadController.uploadFile,
);
router.post(
  "/multiple",
  authenticate,
  upload.array("files", 10),
  UploadController.uploadMultiple,
);
router.delete("/:filename", authenticate, UploadController.deleteFile);

export default router;
