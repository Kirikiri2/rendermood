import { prisma } from "../utils/prisma.js";

export const StepController = {
  getAll: async (req, res) => {
    try {
      const steps = await prisma.step.findMany({
        orderBy: {
          order: 'asc'
        },
        include: {
          question: {
            include: {
              options: {
                orderBy: {
                  id: 'asc'
                }
              },
              sliderConfigs: {
                include: {
                  option: true
                }
              }
            }
          }
        }
      });

      res.json({
        success: true,
        steps
      });
    } catch (error) {
      console.error("GET STEPS ERROR:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const step = await prisma.step.findUnique({
        where: { id: Number(id) },
        include: {
          question: {
            include: {
              options: true,
              sliderConfigs: {
                include: {
                  option: true
                }
              }
            }
          }
        }
      });

      if (!step) {
        return res.status(404).json({
          success: false,
          error: "Step not found"
        });
      }

      res.json({
        success: true,
        step
      });
    } catch (error) {
      console.error("GET STEP ERROR:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};