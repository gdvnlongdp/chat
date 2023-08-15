import mongoose from "mongoose";
import IReaction from "./interfaces/reaction";

const reactionSchema = new mongoose.Schema<IReaction>(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "message",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    reacts: {
      like: {
        type: Number,
        default: 0,
      },
      dislike: {
        type: Number,
        default: 0,
      },
      love: {
        type: Number,
        default: 0,
      },
      angry: {
        type: Number,
        default: 0,
      },
      sad: {
        type: Number,
        default: 0,
      },
      cry: {
        type: Number,
        default: 0,
      },
      wow: {
        type: Number,
        default: 0,
      },
      haha: {
        type: Number,
        default: 0,
      },
    },
  },
  { collection: "Reaction", timestamps: true }
);

const ReactionModel = mongoose.model<IReaction>("reaction", reactionSchema);

export default ReactionModel;
