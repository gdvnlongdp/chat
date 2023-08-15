"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const attachmentSchema = new mongoose_1.default.Schema({
    filename: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["image", "video", "raw"],
    },
    size: {
        type: Number,
        required: true,
    },
}, { collection: "attachment", timestamps: true });
const Attachment = mongoose_1.default.model("attachment", attachmentSchema);
exports.default = Attachment;
