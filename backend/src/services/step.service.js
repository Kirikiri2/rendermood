import { prisma } from "../utils/prisma.js";

export const StepService = {
  getAll: async () => {
    return prisma.step.findMany({
      include: {
        question: {
          include: {
            options: true
          }
        }
      },
      orderBy: {
        order: "asc"
      }
    });
  }
};