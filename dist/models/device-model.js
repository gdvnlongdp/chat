"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const deviceSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "user",
        unique: true,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
}, { collection: "Device", timestamps: true });
const DeviceModel = mongoose_1.default.model("device", deviceSchema);
exports.default = DeviceModel;
