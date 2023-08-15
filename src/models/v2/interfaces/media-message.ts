import mongoose from "mongoose";

interface IMediaMessage {
  body: string;
  contentType: "image" | "video" | "raw";
  attachment: mongoose.Types.ObjectId[];
  sender: mongoose.Types.ObjectId;
}

export default IMediaMessage;
