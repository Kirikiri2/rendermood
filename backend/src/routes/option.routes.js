import express from "express";
import multer from "multer";
import { createOptionWithImage } from "../controllers/option.controller.js";

const router = express.Router();

/* =========================
   MULTER (local upload)
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

/* =========================
   ROUTE
========================= */
router.post("/", upload.single("file"), createOptionWithImage);

export default router;