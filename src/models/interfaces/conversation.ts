import mongoose from "mongoose";

interface IConversation {
  name?: string;
  avatar: string;
  creator: mongoose.Types.ObjectId;
  admins: mongoose.Types.ObjectId[];
  lastMessage: mongoose.Types.ObjectId;
  type: "one-to-one" | "group";
  members: mongoose.Types.ObjectId[];
  unread: mongoose.Types.ObjectId[];
  conversationReadByUser: mongoose.Types.ObjectId[];
}

export default IConversation;
