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
const mail_transport_1 = __importDefault(require("../../utils/mail-transport"));
const rand_code_1 = __importDefault(require("../../utils/rand-code"));
function sendOtpResetPassword(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email } = req.body;
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
            // Tạo một mã otp
            const code = (0, rand_code_1.default)();
            // Gửi code đến email
            yield mail_transport_1.default.sendMail({
                from: `Hệ thống chat GDVN`,
                to: email,
                subject: "Khôi phục mật khẩu",
                html: `Mã khôi phục mật khẩu của bạn là ${code}`,
            });
            // Lưu record vào cache với key là email (unique) và value là code được tạo
            yield init_1.default.set(`reset_password_${email}`, code, { EX: 300 });
            // Ok, gửi kết quả trả về
            res.json({
                status: true,
                message: `Gửi mã khôi phục mật khẩu thành công đến ${email}`,
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = sendOtpResetPassword;
