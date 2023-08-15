"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const profile_model_1 = __importDefault(require("../../models/profile-model"));
function uploadBackground(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Kiểm tra access token
            if (!req.user) {
                const err = {
                    name: "Không tìm thấy token",
                    statusCode: 403,
                    message: "Truy cập yêu cầu access token",
                };
                throw err;
            }
            // Kiểm tra file avatar
            if (!req.file) {
                const err = {
                    name: "Không tìm thấy ảnh nền của người dùng",
                    statusCode: 404,
                    message: "Yêu cầu tải lên ảnh nền",
                };
                throw err;
            }
            // Tiến hành tải ảnh đại diện vào cloudinary
            // const img = await uploadFromBuffer(req, {
            //   folder: `profile/${req.user.profileId}`,
            //   resource_type: "image",
            //   transformation: {
            //     width: 400,
            //     gravity: "auto",
            //     crop: "fill",
            //   },
            // });
            // Cập nhật đường link ảnh đại diện đã lấy được từ bước upload vào hồ sơ
            const profile = yield profile_model_1.default.findByIdAndUpdate(req.user.profileId, {
                background: `${req.protocol}://${req.get("host")}/static/${req.file.filename}`,
            }, { new: true });
            if (!profile) {
                const err = {
                    name: "Không tìm thấy hồ sơ",
                    statusCode: 404,
                    message: "Hồ sơ không hợp lệ",
                };
                throw err;
            }
            // Ok, gửi kết quả trả về
            res.status(201).json({
                status: true,
                message: "Cập nhật ảnh nền người dùng thành công",
                profile,
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = uploadBackground;
