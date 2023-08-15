"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const relationshipSchema = new mongoose_1.default.Schema({
    relatingUser: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    relatedUser: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    blockedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "user",
    },
}, { collection: "Relationship", timestamps: true });
const RelationshipModel = mongoose_1.default.model("relationship", relationshipSchema);
exports.default = RelationshipModel;
