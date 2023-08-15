"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const attachmentSchema = new mongoose_1.default.Schema({
    conversation: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "conversation",
        required: true,
    },
    filename: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
    },
    resourceType: {
        type: String,
        trim: true,
        required: true,
    },
}, { collection: "Attachment", timestamps: true });
const AttachmentModel = mongoose_1.default.model("attachment", attachmentSchema);
exports.default = AttachmentModel;
