import { Request } from "express";
import { UserDocument } from "../models/user.model";

export interface ReqUser extends Request {
  user?: UserDocument;
}

export interface JWTPayload {

}