import mongoose from "mongoose";
import IMessage from "./interfaces/message";

const messageSchema = new mongoose.Schema<IMessage>(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversation",
      required: true,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    ],
    content: {
      type: String,
    },
    attachment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "attachment",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    reply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "message",
    },
    reaction: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "reaction",
        required: true,
      },
    ],
    unsend: {
      type: Boolean,
      default: false,
    },
    removeFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    isSticker: {
      type: Boolean,
      default: false,
    },
  },
  { collection: "Message", timestamps: true }
);

const MessageModel = mongoose.model<IMessage>(
  "message",
  messageSchema
);

export default MessageModel;
