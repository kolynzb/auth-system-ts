import express from "express";
// import cookieParser from 'cookie-parser';
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
// import xss from 'xss-clean';
import swaggerUI from "swagger-ui-express";
import yamlJS from "yamljs";
import compression from "compression";
import hpp from "hpp";
import cors from "cors";
import globalErrorHandler from "./middleware/errorHandler.middleware";
import AppError from "./utils/appError.util";
import APIroutes from "./routes";

const app: express.Application = express();
const swaggerDocument = yamlJS.load("././swagger.yaml");

app.enable("trust proxy");

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin *
// api.nest.com, front-end nest.com
// app.use(cors({
//   origin: 'https://www.nest.com'
// }))

// app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
// app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
// app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

app.use(compression());

// API routes
app.use("/api/v1/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
APIroutes(app);
// global error handling

app.all("*", (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

export default app;
