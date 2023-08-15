"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const stickerSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
    },
    thum: {
        type: String,
    },
    collect: [
        {
            type: String,
        },
    ],
}, { collection: "Sticker", timestamps: true });
const StickerModel = mongoose_1.default.model("sticker", stickerSchema);
exports.default = StickerModel;
