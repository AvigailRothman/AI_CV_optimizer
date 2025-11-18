import express from "express";
import multer from "multer";
import { uploadResume } from "../controllers/uploadController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("pdf"), uploadResume);

export default router;

