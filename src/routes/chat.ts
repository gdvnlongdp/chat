import express from "express";
import { body } from "express-validator";
import getChatLogById from "../handlers/chat_handlers/get-chat-log-by-id";
import getConversationList from "../handlers/chat_handlers/get-conversation-list";
import getConversationReadByUser from "../handlers/chat_handlers/get-conversation-read-by-user";
import getLastMessage from "../handlers/chat_handlers/get-last-message";
import grantAdmins from "../handlers/chat_handlers/grant-admins";
import markAsSeen from "../handlers/chat_handlers/mark-as-seen";
import { removeConversation } from "../handlers/chat_handlers/remove-conversation";
import { removeMessageForYou } from "../handlers/chat_handlers/remove-for";
import sendMessage from "../handlers/chat_handlers/send-message";
import { unSendMessage } from "../handlers/chat_handlers/unsend-message";
import grantCreator from "../handlers/group_handlers/grant-creator";
import verifyToken from "../middlewares/verify-token";
import uploader from "../utils/uploader";

const chatRouter = express.Router();

chatRouter.get("/conversations", verifyToken, getConversationList);

chatRouter.get("/conversations/:id", verifyToken, getConversationReadByUser);

chatRouter.get("/logs/:conversationId", verifyToken, getChatLogById);

chatRouter.post(
  "/messages/send/:conversationId",
  uploader.single("file"),
  verifyToken,
  sendMessage
);

chatRouter.get(
  "/logs/last-message/:conversationId",
  verifyToken,
  getLastMessage
);

chatRouter.patch("/remove-for-me/:messageId", verifyToken, removeMessageForYou);

chatRouter.patch("/mark-as-seen/:conversationId", verifyToken, markAsSeen);
chatRouter.patch("/unsend-message/:messageId", verifyToken, unSendMessage);
chatRouter.patch(
  "/remove-conversation/:conversationId",
  verifyToken,
  removeConversation
);
chatRouter.patch(
  "/groups/grant-admins/:conversationId",
  body("adminIds")
    .isArray()
    .withMessage("Người dùng được thêm vào không được rỗng"),
  verifyToken,
  grantAdmins
);

chatRouter.patch(
  "/groups/grant-creator/:conversationId",
  verifyToken,
  grantCreator
);

export default chatRouter;
