import mongoose from "mongoose";
import IProfile from "./interfaces/profile";

const profileSchema = new mongoose.Schema<IProfile>(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ["male", "female"], // male cho giới tính nam, female cho giới tính nữ
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: process.env.DEFAULT_AVATAR_URL as string,
    },
    background: {
      type: String,
      default: process.env.DEFAULT_BACKGROUND_URL as string,
    },
  },
  { collection: "Profile", timestamps: true }
);

const ProfileModel = mongoose.model<IProfile>("profile", profileSchema);

export default ProfileModel;
