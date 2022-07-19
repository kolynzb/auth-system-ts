import winston = require("winston");

const logConfiguration = {
  transports: [
    new winston.transports.Console({
      level: "warn",
    }),
    new winston.transports.File({
      level: "error",
      filename: "logs/example.log",
    }),
  ],
};

const logger: winston.Logger = winston.createLogger(logConfiguration);

export default logger;
