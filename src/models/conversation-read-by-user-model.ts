import mongoose from "mongoose";
import IConversationReadByUser from "./interfaces/conversation-read-by-user";

const conversationReadByUserSchema =
  new mongoose.Schema<IConversationReadByUser>(
    {
      conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "conversation",
        required: true,
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
      readAt: {
        type: Date,
        default: Date.now,
      },
    },
    { collection: "Conversation Read By User", timestamps: true }
  );

const ConversationReadByUserModel = mongoose.model(
  "conversation-read-by-user",
  conversationReadByUserSchema
);

export default ConversationReadByUserModel;
