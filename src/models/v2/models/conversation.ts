import mongoose from "mongoose";
import IConversation from "../interfaces/conversation";

const conversationSchema = new mongoose.Schema<IConversation>(
  {
    name: {
      type: String,
      required: true,
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
      enum: ["one-to-one", "group"],
      required: true,
    },
    seen: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "message",
        required: true,
      },
    ],
    attachments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "message",
        required: true,
      },
    ],
  },
  { collection: "conversation", timestamps: true }
);

const Conversation = mongoose.model<IConversation>(
  "conversation",
  conversationSchema
);

export default Conversation;
