import mongoose from "mongoose";
import log from "../utils/logger.util";

const connectDB = async (DB_URI: string): Promise<void> => {
  await mongoose
    .connect(DB_URI)
    .then(() => log.info("Database Connected successfully"))
    .catch((err) => log.error("Error connecting to Database ", err));
};

export default connectDB;
