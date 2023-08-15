import mongoose from "mongoose";
import IMediaMessage from "../interfaces/media-message";

const mediaSchema = new mongoose.Schema<IMediaMessage>(
  {
    body: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      enum: ["image", "video", "raw"],
      default: "image",
    },
    attachment: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "attachment",
        required: true,
      },
    ],
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { collection: "media message", timestamps: true }
);

const Media = mongoose.model<IMediaMessage>("media-message", mediaSchema);

export default Media;
