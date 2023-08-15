"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const conversationReadByUserSchema = new mongoose_1.default.Schema({
    conversationId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "conversation",
        required: true,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    readAt: {
        type: Date,
        default: Date.now,
    },
}, { collection: "Conversation Read By User", timestamps: true });
const ConversationReadByUserModel = mongoose_1.default.model("conversation-read-by-user", conversationReadByUserSchema);
exports.default = ConversationReadByUserModel;
