import mongoose from "mongoose";

interface IReaction {
  messageId: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  reacts: {
    dislike: number;
    like: number;
    love: number;
    angry: number;
    sad: number;
    cry: number;
    wow: number;
    haha: number;
  };
}

export default IReaction;
