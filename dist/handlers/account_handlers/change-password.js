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
const express_validator_1 = require("express-validator");
const user_model_1 = __importDefault(require("../../models/user-model"));
function changePassword(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { password, newPassword } = req.body;
        try {
            // Ràng buộc đầu vào
            const errs = (0, express_validator_1.validationResult)(req);
            if (!errs.isEmpty()) {
                const err = {
                    name: "Lỗi ràng buộc đầu vào",
                    statusCode: 400,
                    message: errs.array()[0].msg,
                };
                throw err;
            }
            // Kiểm tra access token
            if (!req.user) {
                const err = {
                    name: "Không tìm thấy token",
                    statusCode: 403,
                    message: "Truy cập yêu cầu access token",
                };
                throw err;
            }
            // Tìm user document để xử lý thay đổi mật khẩu
            const user = yield user_model_1.default.findById(req.user.id);
            if (!user) {
                const err = {
                    name: "Không tìm thấy người dùng",
                    statusCode: 400,
                    message: "Id không khả dụng",
                };
                throw err;
            }
            // Kiểm tra mật khẩu cũ (password)
            const isMatch = yield user.comparePassword(password);
            if (!isMatch) {
                const err = {
                    name: "Mật khẩu cũ không trùng khớp",
                    statusCode: 400,
                    message: "Mật khẩu cũ không trùng khớp",
                };
                throw err;
            }
            // Tiến hành đổi mật khẩu và lưu vào document
            user.password = newPassword;
            yield user.save();
            // Ok, gửi response trả về kết quả
            res.json({
                status: true,
                message: "Đổi mật khẩu thành công",
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = changePassword;
