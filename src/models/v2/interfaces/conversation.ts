import mongoose from "mongoose";

interface IConversation {
  name: string;
  members: mongoose.Types.ObjectId[];
  type: "one-to-one" | "group";
  seen: mongoose.Types.ObjectId[];
  messages: mongoose.Types.ObjectId[];
  attachments: mongoose.Types.ObjectId[];
}

export default IConversation;
