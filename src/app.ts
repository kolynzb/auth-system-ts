import express from "express";
import swaggerUI from "swagger-ui-express";
import yamlJS from "yamljs";
import securityMiddleware from "./middleware/security.middleware";

import globalErrorHandler from "./middleware/errorHandler.middleware";
import AppError from "./utils/appError.util";
import APIroutes from "./routes";

const app: express.Application = express();
const swaggerDocument = yamlJS.load("././swagger.yaml");

securityMiddleware(app);

// API routes
app.use("/api/v1/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
APIroutes(app);

// Global Error Handling
app.all("*", (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

export default app;
