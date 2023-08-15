import mongoose from "mongoose";
import ITextMessage from "../interfaces/text-message";

const textSchema = new mongoose.Schema<ITextMessage>(
  {
    body: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      default: "text",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { collection: "text message", timestamps: true }
);

const Text = mongoose.model<ITextMessage>("text-message", textSchema);

export default Text;
