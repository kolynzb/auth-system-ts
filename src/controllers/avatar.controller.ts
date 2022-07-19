import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { NextFunction, Request, Response, Express } from "express";
import { Readable } from "stream";
import catchAsync from "../utils/catchAsync.util";
import log from "../utils/logger.util";
import AppError from "../utils/appError.util";
import factory from "../utils/handlerFactory.util";
import Avatar from "../models/avatar.model";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const folder = "Avatars";

const uploadWithUrl = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Resize Image using sharp

    const { url } = req.body;
    url as string;

    await cloudinary.uploader
      .upload(url, { resource_type: "image", folder })
      .then(async (response) => {
        log.info(`Image Uploaded Successfully \n ${response}`);

        const newAvatar = await Avatar.create({
          name: req.body.name,
          url: response.secure_url,
        });
        await newAvatar.save();
        res.status(200).json({ status: "success", data: newAvatar });
      })
      .catch((err) => {
        log.error(`error: ${err}`);
        return next(new AppError("Image Upload Failed", 500));
      });
  }
);

const bufferUpload = async (buffer: any) => {
  return new Promise((resolve, reject) => {
    const writeStream = cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      }
    );
    const readStream = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      },
    });
    readStream.pipe(writeStream);
  });
};

const uploadRawImage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { buffer } = req.file as Express.Multer.File;

    try {
      const bufferObj = await bufferUpload(buffer);
      const url = (bufferObj as UploadApiResponse).secure_url;

      log.info(`Image Uploaded Successfully \n ${bufferObj}`);
      const newAvatar = await Avatar.create({ name: req.body.name, url });
      await newAvatar.save();
      return res.status(200).json({ status: "success", data: newAvatar });
    } catch (error) {
      log.error(`error: ${error}`);
      return next(new AppError("Image Upload Failed", 500));
    }
  }
);

const getAllAvatars = factory.getAll(Avatar);
const getAvatar = factory.getOne(Avatar);
const updateAvatar = factory.updateOne(Avatar);
const deleteAvatar = factory.deleteOne(Avatar);

export default {
  uploadRawImage,
  uploadWithUrl,
  getAllAvatars,
  updateAvatar,
  deleteAvatar,
  getAvatar,
};
