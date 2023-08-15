"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.friendRequestSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.friendRequestSchema = new mongoose_1.default.Schema({
    from: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    to: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "declined"],
        default: "pending",
    },
}, { collection: "Friend Request", timestamps: true });
const FriendRequestModel = mongoose_1.default.model("friend-request", exports.friendRequestSchema);
exports.default = FriendRequestModel;
