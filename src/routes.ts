import express from "express";
import avatarRoute from "./routes/avatar.routes";

export default (app: express.Application): void => {
  app.use("/api/v1/avatars", avatarRoute);
};
