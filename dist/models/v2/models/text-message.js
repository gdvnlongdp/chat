"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const textSchema = new mongoose_1.default.Schema({
    body: {
        type: String,
        required: true,
    },
    contentType: {
        type: String,
        default: "text",
    },
    sender: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
}, { collection: "text message", timestamps: true });
const Text = mongoose_1.default.model("text-message", textSchema);
exports.default = Text;
