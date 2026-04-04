import { uploadImage } from "../services/storage.service.js";
import { prisma } from "../utils/prisma.js";

export const createOptionWithImage = async (req, res) => {
  const { text, questionId } = req.body;

  const file = req.file;

  let imageUrl = null;

  if (file) {
    imageUrl = await uploadImage(file);
  }

  const option = await prisma.option.create({
    data: {
      text,
      imageUrl,
      questionId: Number(questionId),
    },
  });

  res.json(option);
};