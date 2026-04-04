import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Quiz API",
      version: "1.0.0",
      description: "API documentation for Quiz backend"
    },
    servers: [
      {
        url: "https://rendermood.onrender.com"
      }
    ]
  },
  apis: ["./src/routes/*.js"]
});