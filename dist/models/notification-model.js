"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const notificationSchema = new mongoose_1.default.Schema({
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
}, { collection: "Notification", timestamps: true });
const NotificationModel = mongoose_1.default.model("notification", notificationSchema);
exports.default = NotificationModel;
