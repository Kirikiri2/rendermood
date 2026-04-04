import { uploadImage } from "../services/storage.service.js";
import prisma from "../utils/prisma.js";

export const uploadQuestionImage = async (req, res, next) => {
  try {
    const file = req.file;
    const questionId = Number(req.body.questionId);

    const uploaded = await uploadImage(file);

    const image = await prisma.questionImage.create({
      data: {
        url: uploaded.url,
        key: uploaded.key,
        questionId,
      },
    });

    res.json(image);
  } catch (err) {
    next(err);
  }
};