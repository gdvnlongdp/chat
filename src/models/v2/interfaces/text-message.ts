import mongoose from "mongoose";

interface ITextMessage {
  body: string;
  contentType: "text";
  sender: mongoose.Types.ObjectId;
}

export default ITextMessage;
