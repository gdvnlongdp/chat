"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
function init() {
    // Bật strict query
    mongoose_1.default.set("strictQuery", true);
    // Khi trả về json, object sẽ là id thay vì _id
    mongoose_1.default.set("toJSON", {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret._id;
            delete ret.time;
            const createdAt = new Date(ret.createdAt);
            const updatedAt = new Date(ret.updatedAt);
            createdAt.setHours(createdAt.getHours() + 7);
            updatedAt.setHours(updatedAt.getHours() + 7);
            ret.createdAt = createdAt;
            ret.updatedAt = updatedAt;
            return ret;
        },
    });
}
exports.default = init;
