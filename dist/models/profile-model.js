"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const profileSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    dob: {
        type: Date,
        required: true,
    },
    gender: {
        type: String,
        trim: true,
        lowercase: true,
        enum: ["male", "female"],
        required: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    avatar: {
        type: String,
        default: process.env.DEFAULT_AVATAR_URL,
    },
    background: {
        type: String,
        default: process.env.DEFAULT_BACKGROUND_URL,
    },
}, { collection: "Profile", timestamps: true });
const ProfileModel = mongoose_1.default.model("profile", profileSchema);
exports.default = ProfileModel;
