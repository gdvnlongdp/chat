"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const get_chat_log_by_id_1 = __importDefault(require("../handlers/chat_handlers/get-chat-log-by-id"));
const get_conversation_list_1 = __importDefault(require("../handlers/chat_handlers/get-conversation-list"));
const get_conversation_read_by_user_1 = __importDefault(require("../handlers/chat_handlers/get-conversation-read-by-user"));
const get_last_message_1 = __importDefault(require("../handlers/chat_handlers/get-last-message"));
const grant_admins_1 = __importDefault(require("../handlers/chat_handlers/grant-admins"));
const mark_as_seen_1 = __importDefault(require("../handlers/chat_handlers/mark-as-seen"));
const remove_conversation_1 = require("../handlers/chat_handlers/remove-conversation");
const remove_for_1 = require("../handlers/chat_handlers/remove-for");
const send_message_1 = __importDefault(require("../handlers/chat_handlers/send-message"));
const unsend_message_1 = require("../handlers/chat_handlers/unsend-message");
const grant_creator_1 = __importDefault(require("../handlers/group_handlers/grant-creator"));
const verify_token_1 = __importDefault(require("../middlewares/verify-token"));
const uploader_1 = __importDefault(require("../utils/uploader"));
const chatRouter = express_1.default.Router();
chatRouter.get("/conversations", verify_token_1.default, get_conversation_list_1.default);
chatRouter.get("/conversations/:id", verify_token_1.default, get_conversation_read_by_user_1.default);
chatRouter.get("/logs/:conversationId", verify_token_1.default, get_chat_log_by_id_1.default);
chatRouter.post("/messages/send/:conversationId", uploader_1.default.single("file"), verify_token_1.default, send_message_1.default);
chatRouter.get("/logs/last-message/:conversationId", verify_token_1.default, get_last_message_1.default);
chatRouter.patch("/remove-for-me/:messageId", verify_token_1.default, remove_for_1.removeMessageForYou);
chatRouter.patch("/mark-as-seen/:conversationId", verify_token_1.default, mark_as_seen_1.default);
chatRouter.patch("/unsend-message/:messageId", verify_token_1.default, unsend_message_1.unSendMessage);
chatRouter.patch("/remove-conversation/:conversationId", verify_token_1.default, remove_conversation_1.removeConversation);
chatRouter.patch("/groups/grant-admins/:conversationId", (0, express_validator_1.body)("adminIds")
    .isArray()
    .withMessage("Người dùng được thêm vào không được rỗng"), verify_token_1.default, grant_admins_1.default);
chatRouter.patch("/groups/grant-creator/:conversationId", verify_token_1.default, grant_creator_1.default);
exports.default = chatRouter;
