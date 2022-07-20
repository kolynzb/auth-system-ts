import mongoose from "mongoose";

export interface UserDocument extends mongoose.Document {
  first_name?: string | undefined;
  last_name?: string | undefined;
  email: string;
  statusCodeuserStatus?:
    | {
        status: "Pending" | "Active";
      }
    | undefined;
  roles?:
    | {
        User: number;
        Editor?: number | undefined;
        Admin?: number | undefined;
      }
    | undefined;
  password?: string | undefined;
  googleid?: string | undefined;
}

const userSchema = new mongoose.Schema(
  {
    first_name: String,
    last_name: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    userStatus: {
      status: {
        type: String,
        enum: ["Pending", "Active"],
        default: "Pending",
      },
    },
    roles: {
      User: {
        type: Number,
        default: 2001,
      },
      Editor: Number,
      Admin: Number,
    },
    password: String,
    googleid: String,
  },
  { timestamps: true }
);

export default mongoose.model<UserDocument>("User", userSchema);
