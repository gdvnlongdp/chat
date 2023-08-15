"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const friendSchema = new mongoose_1.default.Schema({
    requester: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    recipient: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    status: {
        type: Number,
        enum: [0, 1, 2, 3],
        require: true,
    },
}, { collection: "Friend", timestamps: true });
const FriendModel = mongoose_1.default.model("friend", friendSchema);
exports.default = FriendModel;
