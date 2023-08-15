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
const init_1 = __importDefault(require("../../drivers/redis/init"));
const user_model_1 = __importDefault(require("../../models/user-model"));
function resetPassword(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, code, password } = req.body;
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
            // Kiểm tra mã khôi phục
            const otp = yield init_1.default.get(`reset_password_${email}`);
            if (code !== otp) {
                const err = {
                    name: "Sai mã khôi phục",
                    statusCode: 400,
                    message: "Mã khôi phục không hợp lệ",
                };
                throw err;
            }
            // Sau khi xác minh thành công mã khôi phục, tiến hành thay đổi mật khẩu
            const user = yield user_model_1.default.findOne({ email });
            if (!user) {
                const err = {
                    name: "Không tìm thấy tài khoản",
                    statusCode: 404,
                    message: "Tài khoản không tồn tại",
                };
                throw err;
            }
            user.password = password;
            yield user.save();
            // Sau khi khôi phục mật khẩu cho tài khoản thành công, tiến hành xóa cache
            yield init_1.default.del(`reset_password_${email}`);
            // Ok, gửi kết quả trả về
            res.json({
                status: true,
                message: "Khôi phục mật khẩu cho tài khoản thành công",
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = resetPassword;
