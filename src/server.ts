import config from "config";
import { Server } from "http";
import app from "./app";
import connectDB from "./config/DB.config";
import log from "./utils/logger.util";

const PORT = config.get("port");
const uri = config.get("dbUri") as string;

const startServer = async () => {
  await connectDB(uri);
  return app.listen(PORT, () => log.info(`listening on port: ${PORT}`));
};

let server: Server;

startServer().then((serve) => {
  server = serve;
});

// For unhandled promise rejections rejections
process.on("unhandledRejection", (err: any) => {
  log.info(`${err.name} \n ${err.message}`);
  log.error("Unhandled rejection 💥 shutting down....");
  server.close(() => {
    process.exit(1);
  });
});

// Handling uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandled rejection 💥 shutting down....");

  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});
