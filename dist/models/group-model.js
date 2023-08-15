"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const groupSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    members: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
    ],
    host: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
}, { collection: "Group", timestamps: true });
const GroupModel = mongoose_1.default.model("group", groupSchema);
exports.default = GroupModel;
