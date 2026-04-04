export const uploadQuestionImage = async (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "File is missing" });
    }

    const questionId = req.body.questionId;

    if (!questionId) {
      return res.status(400).json({ message: "questionId is missing" });
    }

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
    console.error(err); 
    next(err);
  }
};