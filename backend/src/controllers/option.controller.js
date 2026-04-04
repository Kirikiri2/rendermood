import { prisma } from "../utils/prisma.js";

export const createOptionWithImage = async (req, res) => {
  try {
    const { text, questionId } = req.body;
    const file = req.file;

    console.log("FILE:", file);

    let imageUrl = null;

    if (file) {
      imageUrl = `https://rendermood.onrender.com/uploads/${file.filename}`;
    }

    const option = await prisma.option.create({
      data: {
        text,
        questionId: Number(questionId),
        imageUrl,
      },
    });

    res.json(option);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create option" });
  }
};