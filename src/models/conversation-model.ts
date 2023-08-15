import mongoose from "mongoose";
import IConversation from "./interfaces/conversation";

const conversationSchema = new mongoose.Schema<IConversation>(
  {
    name: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: process.env.DEFAULT_AVATAR_GROUP_URL as string,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "message",
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    ],
    type: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ["one-to-one", "group"],
      required: true,
    },
    unread: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    ],
    conversationReadByUser: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "conversation-read-by-user",
        required: true,
      },
    ],
  },
  {
    collection: "Conversation",
    timestamps: true,
  }
);

const ConversationModel = mongoose.model<IConversation>(
  "conversation",
  conversationSchema
);

export default ConversationModel;
