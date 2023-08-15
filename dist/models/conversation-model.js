"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const conversationSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        trim: true,
    },
    avatar: {
        type: String,
        default: process.env.DEFAULT_AVATAR_GROUP_URL,
    },
    creator: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "user",
    },
    admins: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "user",
        },
    ],
    lastMessage: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "message",
    },
    members: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
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
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
    ],
    conversationReadByUser: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "conversation-read-by-user",
            required: true,
        },
    ],
}, {
    collection: "Conversation",
    timestamps: true,
});
const ConversationModel = mongoose_1.default.model("conversation", conversationSchema);
exports.default = ConversationModel;
