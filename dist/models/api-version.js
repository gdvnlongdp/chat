"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiVersion = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    android: {
        type: String,
    },
    ios: {
        type: String,
    },
}, {
    timestamps: true,
});
exports.ApiVersion = mongoose_1.default.model("api-version", schema);
