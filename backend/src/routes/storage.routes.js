import express from "express";
import multer from "multer";
import { createOptionWithImage } from "../controllers/option.controller.js";

const router = express.Router();
const upload = multer();

router.post("/", upload.single("file"), createOptionWithImage);

export default router;