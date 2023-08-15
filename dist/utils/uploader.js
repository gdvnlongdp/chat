"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const uploader = (0, multer_1.default)({
    // storage: multer.memoryStorage(),
    storage: multer_1.default.diskStorage({
        destination(req, file, callback) {
            callback(null, "uploads");
        },
        filename(req, file, callback) {
            file.originalname = Buffer.from(file.originalname, "latin1").toString("utf8");
            callback(null, `${Date.now()}-${file.originalname}`);
        },
    }),
    limits: {
        fileSize: 100 * 1024 * 1024, // Giới hạn kích thước file là 100Mb
    },
});
exports.default = uploader;
