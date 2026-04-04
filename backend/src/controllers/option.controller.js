import { prisma } from "../utils/prisma.js";

export const uploadOptionImage = async (req, res) => {
  try {
    const file = req.file;
    const { questionId } = req.body;

    let imageUrl = null;

    if (file) {
      imageUrl = `https://rendermood.onrender.com/uploads/${file.filename}`;
    }

    const question = await prisma.question.update({
      where: { id: Number(questionId) },
      data: {
        imageUrl,
      },
    });

    res.json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "upload failed" });
  }
};