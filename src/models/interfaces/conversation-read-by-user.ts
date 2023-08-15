import mongoose from "mongoose";

interface IConversationReadByUser {
  conversationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  readAt: Date;
}

export default IConversationReadByUser;
