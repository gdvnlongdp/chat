"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const reactionSchema = new mongoose_1.default.Schema({
    messageId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "message",
        required: true,
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
}, { collection: "Reaction", timestamps: true });
const ReactionModel = mongoose_1.default.model("reaction", reactionSchema);
exports.default = ReactionModel;
