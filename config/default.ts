import dotenv from "dotenv-safe";

dotenv.config();

const { NODE_ENV, DB_PROD, DB_LOCAL, DB_TEST, DB_DEV } = process.env;

let DB_URI;

switch (NODE_ENV) {
  case "development":
    DB_URI = DB_DEV;
    break;
  case "test":
    DB_URI = DB_TEST;
    break;
  case "production":
    DB_URI = DB_PROD;
    break;
  case "local":
    DB_URI = DB_LOCAL;
    break;
  default:
    DB_URI = "mongodb://localhost:1337/test";
    break;
}

export default {
  port: process.env.PORT || 5000,
  host: process.env.HOST || "localhost",
  dbUri: DB_URI,
  saltWorkFactor: process.env.SALT_WORK_FACTOR || 12,
  JWT_SECRET:
    process.env.JWT_SECRET ||
    "69583852c1c25db622023dc4c939287bd4fbc716e49747166b50",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "30d",
  JWT_COOKIE_EXPIRES_IN: process.env.JWT_COOKIE_EXPIRES_IN || 30,
};
