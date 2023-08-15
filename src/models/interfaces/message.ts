import mongoose from "mongoose";

interface IMessage {
  conversation: mongoose.Types.ObjectId;
  content: string;
  attachment: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  reaction: mongoose.Types.ObjectId[];
  reply?: mongoose.Types.ObjectId;
  unsend: boolean;
  removeFor: string[];
  tags: mongoose.Types.ObjectId[];
  isSticker: boolean;
}

export default IMessage;
