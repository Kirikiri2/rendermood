import express from "express";
import multer from "multer";
import { uploadQuestionImage } from "../controllers/questionImage.controller.js";

const router = express.Router();
const upload = multer();

router.post("/upload", upload.single("file"), uploadQuestionImage);

export default router;