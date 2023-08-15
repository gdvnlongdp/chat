"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const deviceInfoSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "user",
        unique: true,
        required: true,
    },
    imei: {
        type: String,
        // unique: true,
        required: true,
    },
    ip: {
        type: String,
        required: true,
    },
    mac: {
        type: String,
    },
    device: {
        type: String,
    },
    token: {
        type: String,
    },
    expireAt: {
        type: Date,
        default: Date.now,
        index: { expires: "3d" },
    },
}, { collection: "Device Info", timestamps: true });
const DeviceInfoModel = mongoose_1.default.model("device-info", deviceInfoSchema);
exports.default = DeviceInfoModel;
