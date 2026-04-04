import express from "express";
import multer from "multer";
import { createOption } from "../controllers/option.controller.js";

const router = express.Router();
const upload = multer();

router.post("/", upload.single("file"), createOption);

export default router;