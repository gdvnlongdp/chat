"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const locationSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    ip: {
        type: String,
    },
    mac: {
        type: String,
    },
    longitude: {
        type: Number,
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
    },
    device: {
        type: String,
    },
    platform: {
        type: String,
    },
    token: {
        type: String,
    },
    checked: {
        type: Boolean,
        default: false,
    },
}, {
    collection: "Location",
    timestamps: true,
});
const LocationModel = mongoose_1.default.model("location", locationSchema);
exports.default = LocationModel;
