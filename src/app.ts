import express from "express";
import swaggerUI from "swagger-ui-express";
import yamlJS from "yamljs";
import globalMiddleware from "./middleware/global.middleware";
import globalErrorHandler from "./middleware/errorHandler.middleware";
import AppError from "./utils/appError.util";
import APIroutes from "./routes";

import passport from "passport";
import session from "express-session";
import initializePassport from "./middleware/passport.middleware";
import cookieParser from "cookie-parser";

const app: express.Application = express();
const swaggerDocument = yamlJS.load("././swagger.yaml");

globalMiddleware(app);

// you can use a sid effect import
initializePassport(passport);

app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(cookieParser(process.env.SESSION_SECRET));
app.use(passport.initialize());
app.use(passport.session());

// API routes
app.use("/api/v1/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
APIroutes(app);

// Global Error Handling
app.all("*", (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl}`, 404));
});
app.use(globalErrorHandler);

export default app;
