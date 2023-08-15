import mongoose from "mongoose";
import IAttachment from "./interfaces/attachment";

const attachmentSchema = new mongoose.Schema<IAttachment>(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversation",
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
    },
    resourceType: {
      type: String,
      trim: true,
      required: true,
    },
  },
  { collection: "Attachment", timestamps: true }
);

const AttachmentModel = mongoose.model("attachment", attachmentSchema);

export default AttachmentModel;
