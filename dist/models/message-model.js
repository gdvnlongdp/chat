"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    conversation: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "conversation",
        required: true,
    },
    tags: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
    ],
    content: {
        type: String,
    },
    attachment: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "attachment",
    },
    sender: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    reply: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "message",
    },
    reaction: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
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
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "user",
        },
    ],
    isSticker: {
        type: Boolean,
        default: false,
    },
}, { collection: "Message", timestamps: true });
const MessageModel = mongoose_1.default.model("message", messageSchema);
exports.default = MessageModel;
