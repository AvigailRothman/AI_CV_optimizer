import express from "express";
import multer from "multer";
import uploadController from "../controllers/uploadController.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("pdf"), uploadController.processUpload);

export default router;
