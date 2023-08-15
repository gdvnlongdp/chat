import mongoose from "mongoose";
import IAttachment from "../interfaces/attachment";

const attachmentSchema = new mongoose.Schema<IAttachment>(
  {
    filename: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "video", "raw"],
    },
    size: {
      type: Number,
      required: true,
    },
  },
  { collection: "attachment", timestamps: true }
);

const Attachment = mongoose.model<IAttachment>("attachment", attachmentSchema);

export default Attachment;
