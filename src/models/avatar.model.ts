import mongoose from 'mongoose';

export interface AvatarDocument extends mongoose.Document {
  name: string | undefined;
  url: string;
}

// TODO: add  isURL(str [, options])
const avatarSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
    },
    url: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<AvatarDocument>('Avatar', avatarSchema);
