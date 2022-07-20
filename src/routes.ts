import express from "express";
import avatarRoute from "./routes/avatar.routes";
import authRoute from "./routes/auth.routes";

export default (app: express.Application): void => {
  app.use("/api/v1/avatars", avatarRoute);
  app.use("/api/v1/auth", authRoute);
};
