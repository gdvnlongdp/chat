"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mediaSchema = new mongoose_1.default.Schema({
    body: {
        type: String,
        required: true,
    },
    contentType: {
        type: String,
        enum: ["image", "video", "raw"],
        default: "image",
    },
    attachment: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "attachment",
            required: true,
        },
    ],
    sender: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
}, { collection: "media message", timestamps: true });
const Media = mongoose_1.default.model("media-message", mediaSchema);
exports.default = Media;
