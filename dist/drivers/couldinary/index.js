"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const logger_1 = __importDefault(require("../../utils/logger"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});
// Kiểm tra kết nối
cloudinary_1.v2.api
    .ping()
    .then((res) => logger_1.default.info(`Trạng thái kết nối với cloudinary: ${res.status}`))
    .catch((err) => {
    logger_1.default.error("Kết nối với cloudinary thất bại");
    console.log(err);
});
exports.default = cloudinary_1.v2;
