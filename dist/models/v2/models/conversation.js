"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const conversationSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
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
        enum: ["one-to-one", "group"],
        required: true,
    },
    seen: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
    ],
    messages: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "message",
            required: true,
        },
    ],
    attachments: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "message",
            required: true,
        },
    ],
}, { collection: "conversation", timestamps: true });
const Conversation = mongoose_1.default.model("conversation", conversationSchema);
exports.default = Conversation;
